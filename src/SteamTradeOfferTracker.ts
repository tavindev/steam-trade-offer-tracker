import { SteamTradeOfferTrackerBase } from "./classes/SteamTradeOfferTrackerBase";
import { TradeRepository } from "./repositories/TradeRepository";

import { SteamTradeOfferTrackerConfig } from "./types";

export class SteamTradeOfferTracker extends SteamTradeOfferTrackerBase {
    constructor(options?: SteamTradeOfferTrackerConfig) {
        super(new TradeRepository(options?.timeHistoricalCutOff));
    }
}
