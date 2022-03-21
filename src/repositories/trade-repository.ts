import axios, { Axios } from "axios";

import { TradeOffer } from "../classes/TradeOffer";
import { SteamTradeOffer } from "../classes/SteamTradeOfferTrackerBase";

interface WebApiSentOffer {
    response: {
        trade_offers_sent?: SteamTradeOffer[];
        trade_offers_received?: SteamTradeOffer[];
        next_cursor: number;
    };
}

export interface ITradeRepository {
    findUserTrades(): Promise<TradeOffer[]>;
    cancelTrade(tradeId: string): Promise<void>;
}

export class TradeRepository implements ITradeRepository {
    api: Axios;

    constructor(steam_api_key: string) {
        this.api = axios.create({
            baseURL: "https://api.steampowered.com/IEconService",
            params: { key: steam_api_key },
        });
    }

    async findUserTrades(): Promise<TradeOffer[]> {
        const offers = [];
        let cursor = 0;

        while (true) {
            const response = await this.api.get<WebApiSentOffer>(
                "/GetTradeOffers/v1",
                {
                    params: {
                        get_sent_offers: true,
                        get_received_offers: true,
                        time_historical_cutoff: 15 * 60,
                        cursor,
                    },
                }
            );

            if (response.data.response.trade_offers_sent)
                offers.push(...response.data.response.trade_offers_sent);

            if (cursor === response.data.response.next_cursor) break;

            cursor++;
        }

        return offers.map((offer) => new TradeOffer(offer));
    }

    async cancelTrade(trade_id: string): Promise<void> {
        await this.api.post(
            `/CancelTradeOffer/v1`,
            {},
            {
                params: {
                    tradeofferid: trade_id,
                },
            }
        );
    }
}
