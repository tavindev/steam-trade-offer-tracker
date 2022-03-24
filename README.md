# Steam Trade Offer Tracker
A simple package for tracking Steam Trade Offers

## Description
This package is useful for tracking Steam Trade Offers, making sure trades are correctly sent. 

**NOTE: This package is not production ready yet**

## Features
- [X] Event driven architecture
- [X] Fully typed events
- [X] Detect offers that may have compromised API Keys 
- [X] Detect wrong items sent in offer
- [X] Detect offer sent to wrong partner
- [X] Detect offer declined by other party (withdrawer)
- [X] Detect offer canceled by party (depositor)
- [ ] Cancel trades based on expiry time


## Installation

`npm install steam-trade-offer-tracker`
or
`yarn add steam-trade-offer-tracker`

## Usage

```javascript
import SteamTradeOfferTracker from "steam-trade-offer-tracker"

const tracker = new SteamTradeOfferTracker({
    // ...
})

tracker.track("STEAM_API_KEY", [{
    partnerId: "188530139",
    assetsIds: ["25224414618", "25223442758"]
}])

tracker.on("compromisedApiKey", (data) => {
    // ...
})

tracker.on("wrongItem", (data) => {
    // ...
})

tracker.on("wrongPartner", (data) => {
    // ...
})

tracker.on("tradeSent", (data) => {
    // ...
})

// ...
```

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
    timeHistoricalCutOff?: number
}
```

## API

### track(steamApiKey, trades)

Method to track trades sent trades (depositor side)

| Params | Type | Required | Description |
| ------ | -- |-------- | ----------- |
| steamApiKey | string | Yes | The user's Steam API Key |
| trades | Trade[] | Yes | An array of trades to track |

```typescript
interface Trade { 
    /** A manually created id to keep track of trades */
    tradeId?: string | number;
    /** Offer partner id */
    partnerId: string;
    /** Itemss assets ids that should be in trade  */
    assetsIds: string[];
}
```

## Events

### compromisedApiKey
Emitted when a suspicious trade is detected, characterizing a phishing scam.

Trades are considered suspicious when they are identical to a previously canceled trade but are sent to another account other than the expected one.

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
    }
    /** The identical trade that was created and sent to another partner */
    suspiciousTrade: {
        partnerId: string;
        partnerSteamId: string;
        assetsIds: string[];
    }
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
    partnerId: string,
    /** The assets ids of the items present in the trade */
    assetsIds: string[],
}
```

### tradeCanceled

Emitted when the trade is canceled by the depositor

```typescript
interface TradeCanceledEvent {  
    /** Manually created id for reference purposes */
    tradeId?: string | number;
    /** The trade's partner id */
    partnerId: string,
    /** The assets ids of the items present in the trade */
    assetsIds: string[],
}
```

### tradeDeclined

Emitted when the trade is declined by the withdrawer

```typescript
interface TradeDeclinedEvent {  
    /** Manually created id for reference purposes */
    tradeId?: string | number;
    /** The trade's partner id */
    partnerId: string,
    /** The assets ids of the items present in the trade */
    assetsIds: string[],
}
```