import { AxiosProxyConfig } from "axios";

export type AssetsIds = (string | string[])[];

export interface TradeRepositoryRequestConfig {
    proxy?: AxiosProxyConfig;
}

export interface TrackedTrade {
    partnerId: string;
    assetsIds: AssetsIds;
    tradeId?: string | number;
}

export interface SteamTradeOfferTrackerConfig {
    /**
     * The time span in which trades will be retrieved
     * Defaults to 15 minutes
     *
     * Trades from the past 'x' minutes will be retrieved
     */
    timeHistoricalCutOff?: number;
}

export interface CompromisedApiKeyTrades {
    /** Partner's Id */
    partnerId: string;
    /** Partner's Steam 64 Id */
    partnerSteamId: string;
    /** The assets ids of the items present in the trade */
    assetsIds: AssetsIds;
}

export interface SteamTradeOfferEvents {
    compromisedApiKey: {
        /** Manually created id for reference purposes */
        tradeId?: string | number;
        /** The original trade that was canceled */
        originalTrade: CompromisedApiKeyTrades;
        /** The identical trade that was created and sent to another partner */
        suspiciousTrade: CompromisedApiKeyTrades;
    };

    wrongItems: {
        /** Manually created id for reference purposes */
        tradeId?: string | number;
        /** Partner's Id */
        partnerId: string;
        /** The items' assets ids that were expected to be in the trade */
        expectedAssetsIds: AssetsIds;
        /** The item's assets ids that were present in the trade */
        offerAssetsIds: AssetsIds;
    };

    wrongPartner: {
        /** Manually created id for reference purposes */
        tradeId?: string | number;
        /** The trade's partner id */
        offerPartnerId: string;
        /** Expected Partner Id */
        expectedPartnerId: string;
        /** The assets ids of the items present in the trade */
        assetsIds: AssetsIds;
    };

    tradeSent: {
        /** Manually created id for reference purposes */
        tradeId?: string | number;
        /** Partner's Id */
        partnerId: string;
        /** The assets ids of the items present in the trade */
        assetsIds: AssetsIds;
    };

    tradeAccepted: {
        /** Manually created id for reference purposes */
        tradeId?: string | number;
        /** Partner's Id */
        partnerId: string;
        /** The assets ids of the items present in the trade */
        assetsIds: AssetsIds;
    };

    tradeCanceled: {
        /** Manually created id for reference purposes */
        tradeId?: string | number;
        /** Partner's Id */
        partnerId: string;
        /** The assets ids of the items present in the trade */
        assetsIds: AssetsIds;
    };

    tradeDeclined: {
        /** Manually created id for reference purposes */
        tradeId?: string | number;
        /** Partner's Id */
        partnerId: string;
        /** The assets ids of the items present in the trade */
        assetsIds: AssetsIds;
    };
}
