import { TradeOfferState } from "./../classes/SteamTradeOfferTrackerBase";
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
    findUserTrades(steamApiKey: string): Promise<TradeOffer[]>;
    cancelTrade(steamApiKey: string, tradeId: string): Promise<void>;
}

export class TradeRepository implements ITradeRepository {
    private api: Axios;

    constructor(
        private timeHistoricalCutOff: number = 15 * 60 /* Default 15 minutes */
    ) {
        this.api = axios.create({
            baseURL: "https://api.steampowered.com/IEconService",
        });
    }

    findUserTrades = async (steamApiKey: string): Promise<TradeOffer[]> => {
        const offers = [];
        let cursor = 0;

        while (true) {
            const response = await this.api.get<WebApiSentOffer>(
                "/GetTradeOffers/v1",
                {
                    params: {
                        key: steamApiKey,
                        get_sent_offers: true,
                        get_received_offers: true,
                        time_historical_cutoff: this.timeHistoricalCutOff,
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
    };

    // Unused for now
    cancelTrade = async (
        steamApiKey: string,
        tradeId: string
    ): Promise<void> => {
        await this.api.post(
            `/CancelTradeOffer/v1`,
            {},
            {
                params: {
                    key: steamApiKey,
                    tradeofferid: tradeId,
                },
            }
        );
    };
}
