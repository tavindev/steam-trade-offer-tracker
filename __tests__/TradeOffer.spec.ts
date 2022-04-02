import { TradeOfferState } from "../src/classes/SteamTradeOfferTrackerBase";
import { createMockTrade } from "./utils/createMockTrade";

describe("TradeOffer Tests", () => {
    it("should detect a canceled offer", async () => {
        const tradeOffer = createMockTrade(
            1,
            ["1"],
            TradeOfferState.CANCELED,
            true
        );

        expect(tradeOffer.isCanceled()).toBe(true);
    });

    it("should detect a accepted offer", async () => {
        const tradeOffer = createMockTrade(
            1,
            ["1"],
            TradeOfferState.ACCEPTED,
            true
        );

        expect(tradeOffer.isAccepted()).toBe(true);
    });

    it("should detect a declined offer", async () => {
        const tradeOffer = createMockTrade(
            1,
            ["1"],
            TradeOfferState.DECLINED,
            true
        );

        expect(tradeOffer.isDeclined()).toBe(true);
    });

    it("should detect a sent offer", async () => {
        const tradeOffer = createMockTrade(
            1,
            ["1"],
            TradeOfferState.SENT,
            true
        );

        expect(tradeOffer.isSent()).toBe(true);
    });

    it("should detect if the offer has the right items", async () => {
        const tradeOffer = createMockTrade(
            1,
            ["1"],
            TradeOfferState.SENT,
            true
        );

        expect(tradeOffer.hasItems(["1"])).toBe(true);
    });

    it("should return true if the one of the optional offer items is present in trade", async () => {
        const tradeOffer = createMockTrade(
            1,
            ["1", "2"],
            TradeOfferState.SENT,
            true
        );

        expect(tradeOffer.hasItems(["1", ["2", "3"]])).toBe(true);
    });

    it("should return false if both of the optional items are present in trade", async () => {
        const tradeOffer = createMockTrade(
            1,
            ["1", "2"],
            TradeOfferState.SENT,
            true
        );

        expect(tradeOffer.hasItems([["1", "2"]])).toBe(false);
    });

    it("should return false if none of the optional items are present in trade", async () => {
        const tradeOffer = createMockTrade(
            1,
            ["1", "2"],
            TradeOfferState.SENT,
            true
        );

        expect(tradeOffer.hasItems([["3", "4"]])).toBe(false);
    });
});
