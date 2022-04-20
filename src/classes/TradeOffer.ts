import { AssetsIds } from "../types";

import { TradeOfferState } from "../types/enums";
import { SteamTradeOffer } from "../types/steam";

export class TradeOffer {
    id: string;
    assetsIds: string[];
    partnerId: string;
    timeCreated: number;
    tradeOfferState: TradeOfferState;
    isOurOffer: boolean;

    constructor(
        offer: Pick<
            SteamTradeOffer,
            | "tradeofferid"
            | "items_to_give"
            | "accountid_other"
            | "time_created"
            | "trade_offer_state"
            | "is_our_offer"
        >
    ) {
        this.id = offer.tradeofferid;
        this.assetsIds = offer.items_to_give.map((item) => item.assetid);
        this.partnerId = offer.accountid_other.toString();
        this.timeCreated = offer.time_created;
        this.tradeOfferState = offer.trade_offer_state;
        this.isOurOffer = offer.is_our_offer;
    }

    isCanceled = () => {
        return this.tradeOfferState === TradeOfferState.CANCELED;
    };

    isDeclined = () => {
        return this.tradeOfferState === TradeOfferState.DECLINED;
    };

    isSent = () => {
        return this.tradeOfferState === TradeOfferState.SENT;
    };

    isAccepted = () => {
        return this.tradeOfferState === TradeOfferState.ACCEPTED;
    };

    isNeedingConfirmation = () => {
        return this.tradeOfferState === TradeOfferState.NEEDS_CONFIRMATION;
    };

    isCancelable = () => {
        return this.isNeedingConfirmation() || this.isSent();
    };

    hasItems = (assetsIds: AssetsIds) => {
        return assetsIds.every((expectedId) => {
            /**
             * If expectedId is an array,
             * check if the intersection length of expectedId and this.assetsIds is equal to 1
             */
            if (Array.isArray(expectedId)) {
                return (
                    this.assetsIds.filter((actualId) =>
                        expectedId.includes(actualId)
                    ).length === 1
                );
            }

            return this.assetsIds.includes(expectedId);
        });
    };
}
