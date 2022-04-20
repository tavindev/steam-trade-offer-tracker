# Steam Trade Offer Tracker

A simple package for tracking Steam Trade Offers

## Description

This package is useful for tracking Steam Trade Offers, making sure trades are correctly sent.

**NOTE: This package is not production ready yet**

## Features

-   [x] Event driven architecture and Promise responses
-   [x] Fully typed events
-   [x] Detect offers that may have compromised API Keys
-   [x] Detect wrong items sent in offer
-   [x] Detect offer sent to wrong partner
-   [x] Detect offer declined by other party (withdrawer)
-   [x] Detect offer canceled by party (depositor)
-   [x] Proxy support
-   [ ] Cancel trades based on expiry time

## Installation

`npm install steam-trade-offer-tracker`
or
`yarn add steam-trade-offer-tracker`

## Usage

```javascript
import SteamTradeOfferTracker from "steam-trade-offer-tracker";

const tracker = new SteamTradeOfferTracker({
    // ...
});

const results = await tracker.track("STEAM_API_KEY", [
    {
        partnerId: "188530139",
        assetsIds: ["25224414618", "25223442758"],
        createdAt: 1650419071564,
    },
    {
        // request options
    },
]);

tracker.on("compromisedApiKey", (data) => {
    // ...
});

tracker.on("wrongItem", (data) => {
    // ...
});

tracker.on("wrongPartner", (data) => {
    // ...
});

tracker.on("tradeSent", (data) => {
    // ...
});

// or
results.forEach((result) => {
    // ...
});
```

Results come as an array of objects that follow the following interface:

```typescript
type Result =  {
    event: T;
    data: SteamTradeOfferEvents[T];
} || false
```

`false` results are default for non implemented events

See [this](https://github.com/gustavo-dev/steam-trade-offer-tracker/blob/master/src/types/index.ts#L34) for reference

### Class instance

`new SteamTradeOfferTracker(options)`

```typescript
interface Options {
    /**
     * The time span in which trades will be retrieved
     * Defaults to 15 minutes
     *
     * Trades from the past 'x' minutes will be retrieved
     */
    timeHistoricalCutOff?: number;
}
```

## API

### async track(steamApiKey, trades, requestOptions?)

Method to track trades sent trades (depositor side)

| Params         | Type                         | Required | Description                          |
| -------------- | ---------------------------- | -------- | ------------------------------------ |
| steamApiKey    | string                       | Yes      | The user's Steam API Key             |
| trades         | Trade[]                      | Yes      | An array of trades to track          |
| requestOptions | TradeRepositoryRequestConfig | No       | An object containing request options |

```typescript
interface Trade {
    /** A manually created id to keep track of trades */
    tradeId?: string | number;
    /** Offer partner id */
    partnerId: string;
    /** Items assets ids that should be in trade  */
    assetsIds: (string | string[])[];
    /**
     * Time since epoch in milliseconds when the trade was created
     * If provided, steam trades created before that time will not be
     * checked and compared to this trade.
     */
    createdAt?: number;
}

interface TradeRepositoryRequestConfig {
    proxy?: AxiosProxyConfig;
}
```

When `assetsIds` contains an array of strings, one and only one of the ids provided in the array must be present it trade

Example:

```typescript
tracker.track("STEAM_API_KEY", {
    partnerId: "12345",
    assetsIds: ["123", ["456", "789"]],
});
```

In the above case we are tracking a trade that has items with assets ids `123` and [`456` or `789`]

This is useful, for example, when a user has repeated skins but needs to deposit one that has a float less than `x`. You can then provide the assetsIds of all skins with a float less than `x` and any of them will be accepted.

The following trades would be valid:

```JSON
{
    "assetsIds": ["123", "456"]
}
// or
{
    "assetsIds": ["123", "789"]
}
```

The following trades would not be valid:

```JSON
{
    "assetsIds": ["123", "456", "789"]
}
// or
{
    "assetsIds": ["123"]
}
```

## Events

### compromisedApiKey

Emitted when a suspicious trade is detected, characterizing a phishing scam.

Trades are considered suspicious when they are identical to a previously canceled trade but are sent to and from another account other than the expected one.

```typescript
interface CompromisedApiKeyEvent {
    /** Manually created id for reference purposes */
    tradeId?: string | number;
    /** The original trade that was canceled */
    originalTrade: {
        /** Partner Id */
        partnerId: string;
        /** Steam 64 id */
        partnerSteamId: string;
        /** The assets ids of the items present in the trade */
        assetsIds: string[];
    };
    /** The identical trade that was created and sent to another partner */
    suspiciousTrade: {
        partnerId: string;
        partnerSteamId: string;
        assetsIds: string[];
    };
}
```

### wrongItems

Emitted when a not expected item is sent in the trade

```typescript
interface WrongItemsEvent {
    /** Manually created id for reference purposes */
    tradeId?: string | number;
    /** Partner Id */
    partnerId: string;
    /** The items' assets ids that were expected to be in the trade */
    expectedAssetsIds: string[];
    /** The item's assets ids that were present in the trade */
    offerAssetsIds: string[];
}
```

### wrongPartner

Emitted when the trade is sent to the wrong partner

```typescript
interface WrongPartnerEvent {
    /** Manually created id for reference purposes */
    tradeId?: string | number;
    /** The trade's partner id */
    offerPartnerId: string;
    /** Expected Partner Id */
    expectedPartnerId: string;
    /** The assets ids of the items present in the trade */
    assetsIds: string[];
}
```

### tradeSent

Emitted when the correct trade is sent

```typescript
interface TradeSentEvent {
    /** Manually created id for reference purposes */
    tradeId?: string | number;
    /** The trade's partner id */
    partnerId: string;
    /** The assets ids of the items present in the trade */
    assetsIds: string[];
}
```

### tradeCanceled

Emitted when the trade is canceled by the depositor

```typescript
interface TradeCanceledEvent {
    /** Manually created id for reference purposes */
    tradeId?: string | number;
    /** The trade's partner id */
    partnerId: string;
    /** The assets ids of the items present in the trade */
    assetsIds: string[];
}
```

### tradeDeclined

Emitted when the trade is declined by the withdrawer

```typescript
interface TradeDeclinedEvent {
    /** Manually created id for reference purposes */
    tradeId?: string | number;
    /** The trade's partner id */
    partnerId: string;
    /** The assets ids of the items present in the trade */
    assetsIds: string[];
}
```
