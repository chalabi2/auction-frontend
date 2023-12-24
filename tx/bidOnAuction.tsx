import { auction } from "@chalabi/gravity-bridgejs/dist/codegen";
import { SigningStargateClient, StdFee } from "@cosmjs/stargate";
import { Box, Link, useToast, Text } from "@chakra-ui/react";

const showSuccessToast = (
  toast: ReturnType<typeof useToast>,
  txHash: string
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
  getSigningStargateClient: () => Promise<SigningStargateClient>,
  setResp: (resp: string) => any,
  address: string,
  auctionId: string,
  bidAmount: string,
  bidFeeAmount: string,
  toast: ReturnType<typeof useToast>
) => {
  return async () => {
    const stargateClient = await getSigningStargateClient();
    if (!stargateClient || !address) {
      console.error("stargateClient undefined or address undefined.");
      return;
    }

    const { bid } = auction.v1.MessageComposer.withTypeUrl;

    const msg = bid({
      auctionId: auctionId,
      bidder: address,
      amount: bidAmount,
      bidFee: bidFeeAmount,
    });

    const memo: string = "Submitted by The Gravity Bridge Fee Auction App";

    const fee: StdFee = {
      gas: "300000",
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
      showSuccessToast(toast, response.transactionHash);
    } catch (error) {
      console.error("Error signing and sending transaction:", error);
      if (error instanceof Error) {
        showErrorToast(toast, error.message);
      }
    }
  };
};
