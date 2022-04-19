import { InMemoryTradeRepository } from "./../src/repositories/in-memory/InMemoryTradeRepository";
import { SteamTradeOfferTrackerBase } from "../src/classes/SteamTradeOfferTrackerBase";
import { createMockTrade } from "./utils/createMockTrade";
import { TradeOfferState } from "../src/types/enums";

type JestMock = jest.Mock<any, any>;

describe("SteamTradeOfferTrackerBase tests", () => {
    const tradeRepository = new InMemoryTradeRepository();
    const tradeOfferTracker = new SteamTradeOfferTrackerBase(tradeRepository);

    beforeEach(() => {
        tradeOfferTracker._emit = jest.fn();
        tradeRepository.offers = [];
    });

    it("should detect items sent to the wrong partner", async () => {
        tradeRepository.createTrade(
            createMockTrade(1, ["1"], TradeOfferState.NEEDS_CONFIRMATION, true)
        );

        await tradeOfferTracker.track("", [
            {
                assetsIds: ["1"],
                partnerId: "2",
            },
        ]);

        expect((tradeOfferTracker._emit as JestMock).mock.calls[0][0]).toBe(
            "wrongPartner"
        );
    });

    it("should detect compromised api key", async () => {
        // create a CANCELED offer to partner 1 with assetsIds ["1"]
        tradeRepository.createTrade(
            createMockTrade(1, ["1"], TradeOfferState.CANCELED, true)
        );

        // create a NEEDS_CONFIRMATION from  to partner 2 with same assetsIds
        tradeRepository.createTrade(
            createMockTrade(
                2,
                ["1"],
                TradeOfferState.NEEDS_CONFIRMATION,
                false,
                Date.now() + 1000
            )
        );

        await tradeOfferTracker.track("", [
            {
                assetsIds: ["1"],
                partnerId: "1",
            },
        ]);

        expect((tradeOfferTracker._emit as JestMock).mock.calls[0][0]).toBe(
            "compromisedApiKey"
        );
    });

    it("should detect wrong items", async () => {
        tradeRepository.createTrade(
            createMockTrade(1, ["1"], TradeOfferState.NEEDS_CONFIRMATION, true)
        );

        await tradeOfferTracker.track("", [
            {
                assetsIds: ["2"],
                partnerId: "1",
            },
        ]);

        expect((tradeOfferTracker._emit as JestMock).mock.calls[0][0]).toBe(
            "wrongItems"
        );
    });

    it("should detect trade sent", async () => {
        tradeRepository.createTrade(
            createMockTrade(1, ["1"], TradeOfferState.SENT, true)
        );

        await tradeOfferTracker.track("", [
            {
                assetsIds: ["1"],
                partnerId: "1",
            },
        ]);

        expect((tradeOfferTracker._emit as JestMock).mock.calls[0][0]).toBe(
            "tradeSent"
        );
    });

    it("should detect trade accepted", async () => {
        tradeRepository.createTrade(
            createMockTrade(1, ["1"], TradeOfferState.ACCEPTED, true)
        );

        await tradeOfferTracker.track("", [
            {
                assetsIds: ["1"],
                partnerId: "1",
            },
        ]);

        expect((tradeOfferTracker._emit as JestMock).mock.calls[0][0]).toBe(
            "tradeAccepted"
        );
    });

    it("should detect trade canceled", async () => {
        tradeRepository.createTrade(
            createMockTrade(1, ["1"], TradeOfferState.CANCELED, true)
        );

        await tradeOfferTracker.track("", [
            {
                assetsIds: ["1"],
                partnerId: "1",
            },
        ]);

        expect((tradeOfferTracker._emit as JestMock).mock.calls[0][0]).toBe(
            "tradeCanceled"
        );
    });

    it("should detect trade declined", async () => {
        tradeRepository.createTrade(
            createMockTrade(1, ["1"], TradeOfferState.DECLINED, true)
        );

        await tradeOfferTracker.track("", [
            {
                assetsIds: ["1"],
                partnerId: "1",
            },
        ]);

        expect((tradeOfferTracker._emit as JestMock).mock.calls[0][0]).toBe(
            "tradeDeclined"
        );
    });
});
