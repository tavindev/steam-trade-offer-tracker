import { TradeOffer } from "../../src/classes/TradeOffer";
import { TradeOfferState } from "../../src/types/enums";

export const createMockTrade = (
    partnerId: number,
    assetsIds: string[],
    tradeOfferState: TradeOfferState,
    isOurOffer: boolean,
    timeCreated: number = Date.now()
) => {
    return new TradeOffer({
        accountid_other: partnerId,
        time_created: timeCreated,
        trade_offer_state: tradeOfferState,
        tradeofferid: "1",
        is_our_offer: isOurOffer,
        items_to_give: assetsIds.map((assetid) => ({
            amount: "1",
            appid: 730,
            assetid,
            classid: "1",
            contextid: "2",
            est_usd: "",
            instanceid: "1",
            missing: false,
        })),
    });
};
