import Long from "long";
import { auction } from "@chalabi/gravity-bridgejs/dist/codegen";
import { MsgBid, MsgBidAminoMsg } from "@chalabi/gravity-bridgejs/dist/codegen/auction/v1/msgs";
import { SigningStargateClient, StdFee } from "@cosmjs/stargate";
import { ChainName, SignerOptions } from '@cosmos-kit/core';
import { Chain } from "@chain-registry/types";
import { assets, chains } from 'chain-registry';
import { EncodeObject } from "@cosmjs/proto-signing";



export const bidOnAuction = (
    getSigningAuctionClient: (signerOptions: SignerOptions) => Promise<SigningStargateClient>,
    signerOptions: SignerOptions,
    setResp: (resp: string) => any,
    chainName: string,
    address: string,
    auctionId: number, // or string if the ID is not a number
    bidAmount: number, // amount in ugraviton
    bidFeeAmount: number // fee amount in ugraviton
  ) => {
    return async () => {
        const stargateClient = await getSigningAuctionClient(signerOptions);
      if (!stargateClient || !address) {
        console.error('stargateClient undefined or address undefined.');
        return;
      }

      const {
        bid
     } = auction.v1.MessageComposer.fromPartial;

     const msg = bid({
       auctionId: BigInt(auctionId),
       bidder: address,
       amount: BigInt(bidAmount),
       bidFee: BigInt(bidFeeAmount),
     });

      const chain: Chain = chains.find(({ chain_name }) => chain_name === chainName) as Chain;

      const signingStargateClientOptions = signerOptions.signingStargate?.(chain);

      const aminoTypes = signingStargateClientOptions?.aminoTypes;
    
      const msgBid = aminoTypes?.toAmino({
        typeUrl: "/auction.v1.MsgBid",
        value:  { auctionId: (auctionId),
            bidder: address,
            amount: (bidAmount),
            bidFee: (bidFeeAmount),}
      })  ;
      
      const encodeObjectBid: EncodeObject = {
        typeUrl: "/auction.v1.MsgBid",
        value: {  auctionId: (auctionId),
            bidder: address,
            amount: (bidAmount),
            bidFee: (bidFeeAmount),},
      };

      const memo: string = 'Test'; 

      const fee: StdFee = {
        gas: '200000000',
        amount: [
          {
            amount: '5000000000000',
            denom: 'ugraviton',
          },
        ],
       
      };

      // Register the MsgBid type
      stargateClient.registry.register("/auction.v1.MsgBid", MsgBid as any);

      // ...
      const response = await stargateClient.signAndBroadcast(address, [encodeObjectBid], fee, memo);
      setResp(JSON.stringify(response, null, 2));
    };
  };