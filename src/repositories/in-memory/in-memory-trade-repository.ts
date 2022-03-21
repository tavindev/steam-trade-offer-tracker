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

    createTrade(trade: TradeOffer): void {
        this.offers.push(trade);
    }

    async findUserTrades(): Promise<TradeOffer[]> {
        return this.offers;
    }

    async cancelTrade(tradeId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
