import SteamID from "steamid";

import { ITradeRepository } from "../repositories/trade-repository";
import { EventEmitterType } from "./EventEmmiterType";

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
    partnerId: string;
    assetsIds: string[];
    tradeId?: string | number;
}

export interface SteamTradeOfferTrackerConfig {
    /**
     * The time span in which trades will be retrieved
     * Defaults to 15 minutes
     *
     * Trades from the past 'x' minutes will be retrieved
     */
    timeHistoricalCutOff?: number;
}

interface CompromisedApiKeyTrades {
    /** Partner's Id */
    partnerId: string;
    /** Partner's Steam 64 Id */
    partnerSteamId: string;
    /** The assets ids of the items present in the trade */
    assetsIds: string[];
}

interface SteamTradeOfferEvents {
    compromisedApiKey: [
        {
            /** Manually created id for reference purposes */
            tradeId?: string | number;
            /** The original trade that was canceled */
            originalTrade: CompromisedApiKeyTrades;
            /** The identical trade that was created and sent to another partner */
            suspiciousTrade: CompromisedApiKeyTrades;
        }
    ];
    wrongItems: [
        {
            /** Manually created id for reference purposes */
            tradeId?: string | number;
            /** Partner's Id */
            partnerId: string;
            /** The items' assets ids that were expected to be in the trade */
            expectedAssetsIds: string[];
            /** The item's assets ids that were present in the trade */
            offerAssetsIds: string[];
        }
    ];
    wrongPartner: [
        {
            /** Manually created id for reference purposes */
            tradeId?: string | number;
            /** The trade's partner id */
            offerPartnerId: string;
            /** Expected Partner Id */
            expectedPartnerId: string;
            /** The assets ids of the items present in the trade */
            assetsIds: string[];
        }
    ];
    tradeSent: [
        {
            /** Manually created id for reference purposes */
            tradeId?: string | number;
            /** Partner's Id */
            partnerId: string;
            /** The assets ids of the items present in the trade */
            assetsIds: string[];
        }
    ];
    tradeAccepted: [
        {
            /** Manually created id for reference purposes */
            tradeId?: string | number;
            /** Partner's Id */
            partnerId: string;
            /** The assets ids of the items present in the trade */
            assetsIds: string[];
        }
    ];
    tradeCanceled: [
        {
            /** Manually created id for reference purposes */
            tradeId?: string | number;
            /** Partner's Id */
            partnerId: string;
            /** The assets ids of the items present in the trade */
            assetsIds: string[];
        }
    ];
    tradeDeclined: [
        {
            /** Manually created id for reference purposes */
            tradeId?: string | number;
            /** Partner's Id */
            partnerId: string;
            /** The assets ids of the items present in the trade */
            assetsIds: string[];
        }
    ];
}

// @ts-ignore
export class SteamTradeOfferTrackerBase extends EventEmitterType<SteamTradeOfferEvents> {
    constructor(private tradeRepository: ITradeRepository) {
        super();
    }

    getUserSteam3Id = (partnerId: string) => new SteamID(`[U:1:${partnerId}]`);

    track = async (steamApiKey: string, trades: TrackedTrade[]) => {
        const offers = await this.tradeRepository.findUserTrades(steamApiKey);

        trades.forEach(async (trade) => {
            // find the trade with the same partner id and assets ids
            const foundTrade = offers.find((offer) => {
                return (
                    offer.partnerId === trade.partnerId &&
                    offer.assetsIds.length === trade.assetsIds.length
                );
            });

            if (foundTrade) {
                // if trade is canceled, check if there is another trade with the exact same assets ids but different partner id and is not our offer
                // if the trade is found, it means that the steam api key is compromised
                if (foundTrade.tradeOfferState === TradeOfferState.CANCELED) {
                    const foundTradeWithDifferentPartner = offers.find(
                        (offer) => {
                            return (
                                offer.partnerId !== trade.partnerId &&
                                offer.hasItems(trade.assetsIds) &&
                                !offer.isOurOffer
                            );
                        }
                    );

                    if (foundTradeWithDifferentPartner) {
                        this.emit("compromisedApiKey", {
                            tradeId: trade.tradeId,
                            originalTrade: {
                                partnerId: foundTrade.partnerId,
                                partnerSteamId: this.getUserSteam3Id(
                                    foundTrade.partnerId
                                ).getSteamID64(),
                                assetsIds: foundTrade.assetsIds,
                            },
                            suspiciousTrade: {
                                partnerId:
                                    foundTradeWithDifferentPartner.partnerId,
                                partnerSteamId: this.getUserSteam3Id(
                                    foundTradeWithDifferentPartner.partnerId
                                ).getSteamID64(),
                                assetsIds:
                                    foundTradeWithDifferentPartner.assetsIds,
                            },
                        });
                    } else {
                        this.emit("tradeCanceled", {
                            tradeId: trade.tradeId,
                            partnerId: foundTrade.partnerId,
                            assetsIds: foundTrade.assetsIds,
                        });
                    }
                } else if (
                    foundTrade.tradeOfferState === TradeOfferState.DECLINED
                ) {
                    this.emit("tradeDeclined", {
                        tradeId: trade.tradeId,
                        partnerId: foundTrade.partnerId,
                        assetsIds: foundTrade.assetsIds,
                    });
                } else if (
                    foundTrade.tradeOfferState === TradeOfferState.SENT
                ) {
                    this.emit("tradeSent", {
                        tradeId: trade.tradeId,
                        partnerId: foundTrade.partnerId,
                        assetsIds: foundTrade.assetsIds,
                    });
                } else if (
                    foundTrade.tradeOfferState === TradeOfferState.ACCEPTED
                ) {
                    this.emit("tradeAccepted", {
                        tradeId: trade.tradeId,
                        partnerId: foundTrade.partnerId,
                        assetsIds: foundTrade.assetsIds,
                    });
                }
            } else {
                const foundSimilarTrades = offers.filter((offer) => {
                    return (
                        offer.partnerId === trade.partnerId ||
                        offer.hasItems(trade.assetsIds)
                    );
                });

                // for each similar trade, if the partnerId is different from the trade partnerId, emit a "wrongPartner" event
                // for each similar trade, if the assetsIds are different from the trade assetsIds, emit a "wrongItems" event
                foundSimilarTrades.forEach((similarTrade) => {
                    if (similarTrade.partnerId !== trade.partnerId) {
                        this.emit("wrongPartner", {
                            tradeId: trade.tradeId,
                            offerPartnerId: similarTrade.partnerId,
                            expectedPartnerId: trade.partnerId,
                            assetsIds: similarTrade.assetsIds,
                        });
                    }

                    if (!similarTrade.hasItems(trade.assetsIds)) {
                        this.emit("wrongItems", {
                            tradeId: trade.tradeId,
                            partnerId: similarTrade.partnerId,
                            expectedAssetsIds: trade.assetsIds,
                            offerAssetsIds: similarTrade.assetsIds,
                        });
                    }
                });
            }
        });
    };
}
