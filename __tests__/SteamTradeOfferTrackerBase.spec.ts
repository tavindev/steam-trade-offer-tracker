import {
    SteamTradeOfferTrackerBase,
    TradeOfferState,
} from "../src/classes/SteamTradeOfferTrackerBase";
import { TradeOffer } from "../src/classes/TradeOffer";
import { InMemoryTradeRepository } from "../src/repositories/in-memory/in-memory-trade-repository";

describe("SteamTradeOfferTrackerBase tests", () => {
    const tradeRepository = new InMemoryTradeRepository();
    const tradeOfferTracker = new SteamTradeOfferTrackerBase(tradeRepository, {
        time_historical_cutoff: 15 * 60,
    });

    beforeEach(() => {
        tradeOfferTracker.emit = jest.fn();
        tradeRepository.offers = [];
    });

    it("should detect item sent to the wrong partner", async () => {
        tradeRepository.createTrade(
            new TradeOffer({
                accountid_other: 1,
                time_created: 1000,
                trade_offer_state: TradeOfferState.NEEDS_CONFIRMATION,
                tradeofferid: "1",
                is_our_offer: true,
                items_to_give: [
                    {
                        amount: "1",
                        appid: 730,
                        assetid: "1",
                        classid: "1",
                        contextid: "2",
                        est_usd: "",
                        instanceid: "1",
                        missing: false,
                    },
                ],
            })
        );

        await tradeOfferTracker.track("", [
            {
                assetsIds: ["1"],
                partnerId: "2",
            },
        ]);

        expect(tradeOfferTracker.emit).toBeCalledWith("wrong_partner", {});
    });

    it("should detect a compromised api key", async () => {
        tradeRepository.createTrade(
            new TradeOffer({
                accountid_other: 1,
                time_created: 1100,
                trade_offer_state: TradeOfferState.CANCELED,
                tradeofferid: "1",
                is_our_offer: true,
                items_to_give: [
                    {
                        amount: "1",
                        appid: 730,
                        assetid: "1",
                        classid: "1",
                        contextid: "2",
                        est_usd: "",
                        instanceid: "1",
                        missing: false,
                    },
                ],
            })
        );

        tradeRepository.createTrade(
            new TradeOffer({
                accountid_other: 2,
                time_created: 1101,
                trade_offer_state: TradeOfferState.NEEDS_CONFIRMATION,
                tradeofferid: "1",
                is_our_offer: false,
                items_to_give: [
                    {
                        amount: "1",
                        appid: 730,
                        assetid: "1",
                        classid: "1",
                        contextid: "2",
                        est_usd: "",
                        instanceid: "1",
                        missing: false,
                    },
                ],
            })
        );

        await tradeOfferTracker.track("", [
            {
                assetsIds: ["1"],
                partnerId: "1",
            },
        ]);

        expect(tradeOfferTracker.emit).toBeCalledWith(
            "compromised_api_key",
            {}
        );
    });

    it("should detect wrong items", async () => {
        tradeRepository.createTrade(
            new TradeOffer({
                accountid_other: 1,
                time_created: 1100,
                trade_offer_state: TradeOfferState.SENT,
                tradeofferid: "1",
                is_our_offer: true,
                items_to_give: [
                    {
                        amount: "1",
                        appid: 730,
                        assetid: "1",
                        classid: "1",
                        contextid: "2",
                        est_usd: "",
                        instanceid: "1",
                        missing: false,
                    },
                    {
                        amount: "1",
                        appid: 730,
                        assetid: "2",
                        classid: "1",
                        contextid: "2",
                        est_usd: "",
                        instanceid: "1",
                        missing: false,
                    },
                ],
            })
        );

        await tradeOfferTracker.track("", [
            {
                assetsIds: ["1"],
                partnerId: "1",
            },
        ]);

        expect(tradeOfferTracker.emit).toBeCalledWith("wrong_items", {});
    });
});
