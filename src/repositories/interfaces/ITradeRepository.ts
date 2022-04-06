import { TradeOffer } from "../../classes/TradeOffer";
import { TradeRepositoryRequestConfig } from "../../types";

export interface ITradeRepository {
    findUserTrades(
        steamApiKey: string,
        requestOptions?: TradeRepositoryRequestConfig
    ): Promise<TradeOffer[]>;
    cancelTrade(steamApiKey: string, tradeId: string): Promise<void>;
}
