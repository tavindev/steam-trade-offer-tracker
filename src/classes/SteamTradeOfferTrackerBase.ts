import SteamID from "steamid";

import { EventEmitterType } from "./EventEmmiterType";

import { TrackedTrade, SteamTradeOfferEvents } from "../types";

import { ITradeRepository } from "../repositories/interfaces/ITradeRepository";

// @ts-ignore
export class SteamTradeOfferTrackerBase extends EventEmitterType<SteamTradeOfferEvents> {
    constructor(private tradeRepository: ITradeRepository) {
        super();
    }

    getUserSteam3Id = (partnerId: string) => new SteamID(`[U:1:${partnerId}]`);

    track = async (steamApiKey: string, trades: TrackedTrade[]) => {
        const offers = await this.tradeRepository.findUserTrades(steamApiKey);

        const results = await Promise.all(
            trades.map(async (trade) => {
                const offersFiltered = offers.filter(
                    (offer) => (trade.createdAt ?? 0) < offer.timeCreated * 1000
                );

                // find the trade with the same partner id and assets ids
                const foundTrade = offersFiltered.find((offer) => {
                    return (
                        offer.partnerId === trade.partnerId &&
                        offer.hasItems(trade.assetsIds)
                    );
                });

                if (foundTrade) {
                    // if trade is canceled, check if there is another trade with the exact same assets ids but different partner id and is not our offer
                    // if the trade is found, it means that the steam api key is compromised
                    if (foundTrade.isCanceled()) {
                        const foundTradeWithDifferentPartner =
                            offersFiltered.find((offer) => {
                                return (
                                    offer.partnerId !== trade.partnerId &&
                                    offer.hasItems(trade.assetsIds) &&
                                    !offer.isOurOffer &&
                                    offer.timeCreated - foundTrade.timeCreated >
                                        0
                                );
                            });

                        if (foundTradeWithDifferentPartner) {
                            if (foundTradeWithDifferentPartner.isCancelable())
                                return this._emit("compromisedApiKey", {
                                    tradeId: trade.tradeId,
                                    originalTrade: {
                                        partnerId: foundTrade.partnerId,
                                        partnerSteamId: this.getUserSteam3Id(
                                            foundTrade.partnerId
                                        ).getSteamID64(),
                                        assetsIds: foundTrade.assetsIds,
                                    },
                                    suspiciousTrade: {
                                        partnerId:
                                            foundTradeWithDifferentPartner.partnerId,
                                        partnerSteamId: this.getUserSteam3Id(
                                            foundTradeWithDifferentPartner.partnerId
                                        ).getSteamID64(),
                                        assetsIds:
                                            foundTradeWithDifferentPartner.assetsIds,
                                    },
                                });
                        }

                        return this._emit("tradeCanceled", {
                            tradeId: trade.tradeId,
                            partnerId: foundTrade.partnerId,
                            assetsIds: foundTrade.assetsIds,
                        });
                    }

                    if (foundTrade.isDeclined()) {
                        return this._emit("tradeDeclined", {
                            tradeId: trade.tradeId,
                            partnerId: foundTrade.partnerId,
                            assetsIds: foundTrade.assetsIds,
                        });
                    }

                    if (foundTrade.isSent()) {
                        return this._emit("tradeSent", {
                            tradeId: trade.tradeId,
                            partnerId: foundTrade.partnerId,
                            assetsIds: foundTrade.assetsIds,
                        });
                    }

                    if (foundTrade.isAccepted()) {
                        return this._emit("tradeAccepted", {
                            tradeId: trade.tradeId,
                            partnerId: foundTrade.partnerId,
                            assetsIds: foundTrade.assetsIds,
                        });
                    }
                }

                const foundSimilarTrades = offersFiltered.filter((offer) => {
                    return (
                        offer.partnerId === trade.partnerId ||
                        offer.hasItems(trade.assetsIds)
                    );
                });

                // for each similar trade, if the partnerId is different from the trade partnerId, emit a "wrongPartner" event
                // for each similar trade, if the assetsIds are different from the trade assetsIds, emit a "wrongItems" event
                for (const similarTrade of foundSimilarTrades) {
                    if (similarTrade.partnerId !== trade.partnerId) {
                        if (similarTrade.isCancelable())
                            return this._emit("wrongPartner", {
                                tradeId: trade.tradeId,
                                offerPartnerId: similarTrade.partnerId,
                                expectedPartnerId: trade.partnerId,
                                assetsIds: similarTrade.assetsIds,
                            });
                    }

                    if (!similarTrade.hasItems(trade.assetsIds)) {
                        if (similarTrade.isCancelable())
                            return this._emit("wrongItems", {
                                tradeId: trade.tradeId,
                                partnerId: similarTrade.partnerId,
                                expectedAssetsIds: trade.assetsIds,
                                offerAssetsIds: similarTrade.assetsIds,
                            });
                    }
                }

                return false;
            })
        );

        return results;
    };
}
