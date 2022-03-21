import { EventEmitter } from "stream";
import { ITradeRepository } from "../repositories/trade-repository";

export enum TradeOfferState {
    INVALID = 1,
    SENT,
    ACCEPTED,
    COUNTERED,
    EXPIRED,
    CANCELED,
    DECLINED,
    INVALID_ITEMS,
    NEEDS_CONFIRMATION,
    CANCELED_BY_SECOND_FACTOR,
    ESCROW,
}

interface ItemToGive {
    appid: number;
    contextid: string;
    assetid: string;
    classid: string;
    instanceid: string;
    amount: string;
    missing: boolean;
    est_usd: string;
}

export interface SteamTradeOffer {
    tradeofferid: string;
    accountid_other: number;
    message: string;
    /**
     * In seconds
     */
    expiration_time: number;
    trade_offer_state: TradeOfferState;
    items_to_give: ItemToGive[];
    is_our_offer: boolean;
    /**
     * In seconds
     */
    time_created: number;
    /**
     * In seconds
     */
    time_updated: number;
    from_real_time_trade: boolean;
    escrow_end_date: number;
    confirmation_method: number;
}

interface TrackedTrade {
    partnerid: string;
    assetid: string;
}

export interface SteamTradeOfferTrackerConfig {
    steam_api_key: string;
    cancel_invalid_offers?: boolean;
    time_historical_cutoff?: number;
}

export class SteamTradeOfferTrackerBase extends EventEmitter {
    time_historical_cutoff: number;

    constructor(
        private tradeRepository: ITradeRepository,
        options: SteamTradeOfferTrackerConfig
    ) {
        super();

        this.time_historical_cutoff = options.time_historical_cutoff ?? 15 * 60; // Default 15 minutes
    }

    track = async (trades: TrackedTrade[]) => {
        const offers = await this.tradeRepository.findUserTrades();

        trades.forEach(async (trade) => {
            const correctTrade = offers.find(
                (offer) =>
                    trade.assetid === offer.asset_id &&
                    trade.partnerid === offer.partner_id
            );

            if (correctTrade) {
                if (correctTrade.items_in_trade_length !== 1) {
                    this.emit("invalid_trade_length", {});
                    return;
                } else if (
                    correctTrade.trade_offer_state === TradeOfferState.CANCELED
                ) {
                    // Check if steam api key was comprimised
                    const suspiciousOffer = offers.find(
                        (offer) =>
                            offer.asset_id === correctTrade.asset_id &&
                            offer.partner_id !== correctTrade.partner_id &&
                            !offer.is_our_offer &&
                            [
                                TradeOfferState.NEEDS_CONFIRMATION,
                                TradeOfferState.SENT,
                            ].includes(offer.trade_offer_state)
                    );

                    if (suspiciousOffer) {
                        this.emit("compromised_api_key", {});
                        return;
                    }
                }
            } else {
                const similarTrades = offers.filter(
                    (offer) =>
                        (trade.assetid === offer.asset_id ||
                            trade.partnerid === offer.partner_id) &&
                        [
                            TradeOfferState.SENT,
                            TradeOfferState.NEEDS_CONFIRMATION,
                        ].includes(offer.trade_offer_state)
                );

                similarTrades.forEach((similarTrade) => {
                    if (similarTrade.asset_id === trade.assetid) {
                        this.emit("wrong_partner");
                    } else {
                        this.emit("wrong_item");
                    }
                });
            }
        });
    };
}
