import { TradeOffer } from "../../classes/TradeOffer";

export interface ITradeRepository {
    findUserTrades(steamApiKey: string): Promise<TradeOffer[]>;
    cancelTrade(steamApiKey: string, tradeId: string): Promise<void>;
}
