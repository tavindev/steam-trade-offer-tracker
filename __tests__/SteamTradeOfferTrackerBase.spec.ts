import { InMemoryTradeRepository } from "./../src/repositories/in-memory/InMemoryTradeRepository";
import { SteamTradeOfferTrackerBase } from "../src/classes/SteamTradeOfferTrackerBase";
import { createMockTrade } from "./utils/createMockTrade";
import { TradeOfferState } from "../src/types/enums";

type ExcludesFalse = <T>(x: T | false) => x is T;
type JestMock = jest.Mock<any, any>;

describe("SteamTradeOfferTrackerBase tests", () => {
    const tradeRepository = new InMemoryTradeRepository();
    const tradeOfferTracker = new SteamTradeOfferTrackerBase(tradeRepository);

    beforeEach(() => {
        tradeOfferTracker._emit = jest.fn((event, data) => {
            return { event, data };
        });
        tradeRepository.offers = [];
    });

    it("should detect items sent to the wrong partner", async () => {
        tradeRepository.createTrade(
            createMockTrade(1, ["1"], TradeOfferState.NEEDS_CONFIRMATION, true)
        );

        const result = await tradeOfferTracker.track("", [
            {
                assetsIds: ["1"],
                partnerId: "2",
            },
        ]);

        expect((tradeOfferTracker._emit as JestMock).mock.calls[0][0]).toBe(
            "wrongPartner"
        );

        expect(
            result.filter(Boolean as any as ExcludesFalse).find((trade) => {
                return trade.event === "wrongPartner";
            })
        ).toBeTruthy();
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

        const result = await tradeOfferTracker.track("", [
            {
                assetsIds: ["1"],
                partnerId: "1",
            },
        ]);

        expect((tradeOfferTracker._emit as JestMock).mock.calls[0][0]).toBe(
            "compromisedApiKey"
        );

        expect(
            result.filter(Boolean as any as ExcludesFalse).find((trade) => {
                return trade.event === "compromisedApiKey";
            })
        ).toBeTruthy();
    });

    it("should detect wrong items", async () => {
        tradeRepository.createTrade(
            createMockTrade(1, ["1"], TradeOfferState.NEEDS_CONFIRMATION, true)
        );

        const result = await tradeOfferTracker.track("", [
            {
                assetsIds: ["2"],
                partnerId: "1",
            },
        ]);

        expect((tradeOfferTracker._emit as JestMock).mock.calls[0][0]).toBe(
            "wrongItems"
        );

        expect(
            result.filter(Boolean as any as ExcludesFalse).find((trade) => {
                return trade.event === "wrongItems";
            })
        ).toBeTruthy();
    });

    it("should detect trade sent", async () => {
        tradeRepository.createTrade(
            createMockTrade(
                1160131656,
                ["18869624949"],
                TradeOfferState.SENT,
                true
            )
        );

        const result = await tradeOfferTracker.track("", [
            {
                assetsIds: ["18869624949"],
                partnerId: "1160131656",
            },
        ]);

        expect((tradeOfferTracker._emit as JestMock).mock.calls[0][0]).toBe(
            "tradeSent"
        );

        expect(
            result.filter(Boolean as any as ExcludesFalse).find((trade) => {
                return trade.event === "tradeSent";
            })
        ).toBeTruthy();
    });

    it("should detect trade accepted", async () => {
        tradeRepository.createTrade(
            createMockTrade(1, ["1"], TradeOfferState.ACCEPTED, true)
        );

        const result = await tradeOfferTracker.track("", [
            {
                assetsIds: ["1"],
                partnerId: "1",
            },
        ]);

        expect((tradeOfferTracker._emit as JestMock).mock.calls[0][0]).toBe(
            "tradeAccepted"
        );

        expect(
            result.filter(Boolean as any as ExcludesFalse).find((trade) => {
                return trade.event === "tradeAccepted";
            })
        ).toBeTruthy();
    });

    it("should detect trade canceled", async () => {
        tradeRepository.createTrade(
            createMockTrade(1, ["1"], TradeOfferState.CANCELED, true)
        );

        const result = await tradeOfferTracker.track("", [
            {
                assetsIds: ["1"],
                partnerId: "1",
            },
        ]);

        expect((tradeOfferTracker._emit as JestMock).mock.calls[0][0]).toBe(
            "tradeCanceled"
        );

        expect(
            result.filter(Boolean as any as ExcludesFalse).find((trade) => {
                return trade.event === "tradeCanceled";
            })
        ).toBeTruthy();
    });

    it("should detect trade declined", async () => {
        tradeRepository.createTrade(
            createMockTrade(1, ["1"], TradeOfferState.DECLINED, true)
        );

        const result = await tradeOfferTracker.track("", [
            {
                assetsIds: ["1"],
                partnerId: "1",
            },
        ]);

        expect((tradeOfferTracker._emit as JestMock).mock.calls[0][0]).toBe(
            "tradeDeclined"
        );

        expect(
            result.filter(Boolean as any as ExcludesFalse).find((trade) => {
                return trade.event === "tradeDeclined";
            })
        ).toBeTruthy();
    });
});
