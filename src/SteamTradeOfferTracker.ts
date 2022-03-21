import {
    SteamTradeOfferTrackerBase,
    SteamTradeOfferTrackerConfig,
} from "./classes/SteamTradeOfferTrackerBase";
import { TradeRepository } from "./repositories/trade-repository";

export class SteamTradeOfferTracker extends SteamTradeOfferTrackerBase {
    constructor(options: SteamTradeOfferTrackerConfig) {
        super(new TradeRepository(options.steam_api_key), options);
    }
}
