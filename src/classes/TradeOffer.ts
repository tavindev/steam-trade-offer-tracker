import { SteamTradeOffer, TradeOfferState } from "./SteamTradeOfferTrackerBase";

export class TradeOffer {
    id: string;
    asset_id: string;
    partner_id: string;
    time_created: number;
    items_in_trade_length: number;
    trade_offer_state: TradeOfferState;
    is_our_offer: boolean;

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
        this.asset_id = offer.items_to_give[0].assetid;
        this.partner_id = offer.accountid_other.toString();
        this.time_created = offer.time_created;
        this.items_in_trade_length = offer.items_to_give.length;
        this.trade_offer_state = offer.trade_offer_state;
        this.is_our_offer = offer.is_our_offer;
    }
}
