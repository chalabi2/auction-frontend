# Gravity Bridge Fee Auction Front End
This is a web app built to allow users to participate in the Gravity Bridge Fee Auction. Bootstrapped with [Create Cosmos App]() .

The auction process is straightforward: the list of auctions refreshes automatically every 30 seconds, providing users with the most current auction listings. Users have the option to bid on any auction within the list. By clicking on an individual auction, users can view its start and end times. Additionally, each auction displays the denomination of the token, the total amount, and the identity of the current highest bidder.

## Todo
- [ ] Add a "My Bids" section to the app, which displays the auctions that the user has bid on.
- [ ] Add EIP-712 support to the app, so that users can sign their bids with their Ethereum private keys.
- [ ] Add an analytics section for bid info and auction history.
- [X] Add mobile support message.
- [X] Add disable handling for tx and connect wallet buttons.
- [ ] Handle State Better
- [ ] Merge with analytics and bridge app