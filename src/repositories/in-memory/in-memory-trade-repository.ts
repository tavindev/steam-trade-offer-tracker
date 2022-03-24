import { ITradeRepository } from "../trade-repository";
import { TradeOffer } from "../../classes/TradeOffer";

interface ITradeRepositoryTesting {
    createTrade(trade: TradeOffer): void;
}

export class InMemoryTradeRepository
    implements ITradeRepository, ITradeRepositoryTesting
{
    offers: TradeOffer[];

    constructor() {
        this.offers = [];
    }

    createTrade = (trade: TradeOffer): void => {
        this.offers.push(trade);
    };

    findUserTrades = async (): Promise<TradeOffer[]> => {
        return this.offers;
    };

    cancelTrade = async (tradeId: string): Promise<void> => {
        throw new Error("Method not implemented.");
    };
}
