# Steam Trade Offer Tracker
A simple package for tracking Steam Trade Offers

## Description
This package is useful for tracking Steam Trade Offers, making sure trades are correctly sent. 

**NOTE: This package is not production ready yet**

## Features
- [X] Event driven architecture
- [X] Detects/Cancels offers that may have compromised API Keys 
- [X] Detects/Cancels wrong items sent in offer
- [X] Detects/Cancels offer sent to wrong partner
- [ ] Cancels trades based on expiry time
- [ ] Fully typed events

## Installation

`npm install steam-trade-offer-tracker`
or
`yarn add steam-trade-offer-tracker`

## Usage

```javascript
import SteamTradeOfferTracker from "steam-trade-offer-tracker"

const tracker = new SteamTradeOfferTracker()

tracker.track("STEAM_API_KEY", [{
    partnerId: "188530139",
    assetsIds: ["25224414618", "25223442758"]
}])

tracker.on("compromised_api_key", (data) => {
    // ...
})
```

## API
**WIP**


