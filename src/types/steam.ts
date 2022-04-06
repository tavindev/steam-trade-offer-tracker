import { TradeOfferState } from "./enums";

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
