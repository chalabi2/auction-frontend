import Long from "long";
import { auction } from "@chalabi/gravity-bridgejs/dist/codegen";
import { MsgBid } from "@chalabi/gravity-bridgejs/dist/codegen/auction/v1/msgs";
import { SigningStargateClient, StdFee } from "@cosmjs/stargate";
import { ChainName, SignerOptions } from '@cosmos-kit/core';
import { Chain } from "@chain-registry/types";
import { assets, chains } from 'chain-registry';
import { EncodeObject } from "@cosmjs/proto-signing";

export const bidOnAuction = (
    getSigningStargateClient: (signerOptions: SignerOptions) => Promise<SigningStargateClient>,
    signerOptions: SignerOptions,
    setResp: (resp: string) => any,
    chainName: string,
    address: string,
    auctionId: number, // or string if the ID is not a number
    bidAmount: number, // amount in ugraviton
    bidFeeAmount: number // fee amount in ugraviton
  ) => {
    return async () => {
        const stargateClient = await getSigningStargateClient(signerOptions);
      if (!stargateClient || !address) {
        console.error('stargateClient undefined or address undefined.');
        return;
      }

      const {
        bid
     } = auction.v1.MessageComposer.encoded;

     const msg = bid({
        auctionId: Long.fromNumber(auctionId),
        bidder: address,
        amount: Long.fromNumber(bidAmount),
        bidFee: Long.fromNumber(bidFeeAmount),
      });

      const chain: Chain = chains.find(({ chain_name }) => chain_name === chainName) as Chain;

      const signingStargateClientOptions = signerOptions.signingStargate?.(chain);

      const aminoTypes = signingStargateClientOptions?.aminoTypes;
    
      const msgBid = aminoTypes?.toAmino({
        typeUrl: "/auction.v1.MsgBid",
        value:  { auctionId: Long.fromNumber(auctionId),
            bidder: address,
            amount: Long.fromNumber(bidAmount),
            bidFee: Long.fromNumber(bidFeeAmount),}
      });
      
      const encodeObjectBid: EncodeObject = {
        typeUrl: "/auction.v1.MsgBid",
        value: {  auctionId: Long.fromNumber(auctionId),
            bidder: address,
            amount: Long.fromNumber(bidAmount),
            bidFee: Long.fromNumber(bidFeeAmount),},
      };


      const fee: StdFee = {
        amount: [
          {
            denom: 'ugraviton',
            amount: '200000',
          },
        ],
        gas: '200000',
      };

      // Register the MsgBid type
      stargateClient.registry.register("/auction.v1.MsgBid", MsgBid);

      // Sign and broadcast the transaction
      const response = await stargateClient.signAndBroadcast(address, [encodeObjectBid], fee);
      setResp(JSON.stringify(response, null, 2));
    };
  };