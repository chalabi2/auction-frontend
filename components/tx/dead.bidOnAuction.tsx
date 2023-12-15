import Long from "long";
import { auction } from "@chalabi/gravity-bridgejs/dist/codegen";
import {
  MsgBid,
  MsgBidAminoMsg,
} from "@chalabi/gravity-bridgejs/dist/codegen/auction/v1/msgs";
import { SigningStargateClient, StdFee } from "@cosmjs/stargate";
import { ChainName, SignerOptions } from "@cosmos-kit/core";
import { Chain } from "@chain-registry/types";
import { assets, chains } from "chain-registry";
import { EncodeObject } from "@cosmjs/proto-signing";
import { Box, Link, useToast, Text } from "@chakra-ui/react";

const showSuccessToast = (
  toast: ReturnType<typeof useToast>,
  txHash: string,
  chainName: ChainName
) => {
  const mintscanUrl = `https://www.mintscan.io/gravity-bridge/txs/${txHash}`;
  toast({
    position: "bottom-right",
    duration: 5000,
    isClosable: true,
    render: () => (
      <Box color="white" p={3} bg="green.500" borderRadius="md">
        <Text mb={1} fontWeight="bold">
          Transaction Successful
        </Text>
        <Link href={mintscanUrl} isExternal>
          View on Mintscan: {mintscanUrl}
        </Link>
      </Box>
    ),
  });
};

const showErrorToast = (
  toast: ReturnType<typeof useToast>,
  errorMsg: string
) => {
  toast({
    title: "Transaction Failed",
    description: `Error: ${errorMsg}`,
    status: "error",
    duration: 5000,
    isClosable: true,
    position: "bottom-right",
  });
};

export const bidOnAuction = (
  getSigningStargateClient: (
    signerOptions: SignerOptions
  ) => Promise<SigningStargateClient>,
  signerOptions: SignerOptions,
  setResp: (resp: string) => any,
  chainName: string,
  address: string,
  auctionId: string, // or string if the ID is not a number
  bidAmount: string, // amount in ugraviton
  bidFeeAmount: string, // fee amount in ugraviton
  toast: ReturnType<typeof useToast>
) => {
  return async () => {
    const stargateClient = await getSigningStargateClient(signerOptions);
    if (!stargateClient || !address) {
      console.error("stargateClient undefined or address undefined.");
      return;
    }

    const { bid } = auction.v1.MessageComposer.withTypeUrl;

    const msg = bid({
      auctionId: new Long(Number(auctionId)),
      bidder: address,
      amount: new Long(Number(bidAmount)),
      bidFee: new Long(Number(bidFeeAmount)),
    });

    const memo: string = "Submitted by Gravity Bridge Fee Auction App";

    const fee: StdFee = {
      gas: "1000000",
      amount: [
        {
          amount: "1000000",
          denom: "ugraviton",
        },
      ],
    };

    try {
      const response = await stargateClient.signAndBroadcast(
        address,
        [msg],
        fee,
        memo
      );
      setResp(JSON.stringify(response, null, 2));
      showSuccessToast(toast, response.transactionHash, chainName);
    } catch (error) {
      console.error("Error signing and sending transaction:", error);
      if (error instanceof Error) {
        showErrorToast(toast, error.message);
      }
    }
  };
};
