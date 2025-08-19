import { EncodeObject } from "@cosmjs/proto-signing";
import { GasPrice, calculateFee } from "@cosmjs/stargate";
import { useChain } from "@cosmos-kit/react";
import { useState } from "react";

import { getCoin } from "../utils/utils";

export const useFeeEstimation = (chainName: string) => {
  const { getSigningStargateClient, chain, address, status } =
    useChain(chainName);
  const [error, setError] = useState<string | null>(null);

  const gasPrice = chain?.fees?.fee_tokens?.[0]?.average_gas_price || 0.025;
  const coin = getCoin(chainName);

  const estimateFee = async (
    userAddress: string,
    messages: EncodeObject[],
    modifier: number = 1.5,
    memo: string = ""
  ) => {
    try {
      // Check if wallet is connected before proceeding
      if (!address || !userAddress || status !== "Connected") {
        throw new Error(
          "Wallet not connected. Please connect your wallet first."
        );
      }

      // Use manual fee estimation with authenticated client
      // (cosmos-kit's estimateFee has gas price configuration issues)

      try {
        const stargateClient = await getSigningStargateClient();
        if (!stargateClient) {
          throw new Error("Failed to get signing client");
        }

        const gasEstimation = await stargateClient.simulate(
          userAddress,
          messages,
          memo
        );

        if (!gasEstimation) {
          throw new Error("Gas estimation returned null");
        }

        const fee = calculateFee(
          Math.round(gasEstimation * modifier),
          GasPrice.fromString(gasPrice + coin.base)
        );

        return fee;
      } catch (simulationError) {
        console.warn(
          "Gas simulation failed, using standard fee:",
          simulationError
        );

        // Fallback to standard gas limit if simulation fails
        const standardGasLimit = 200000;
        const fee = calculateFee(
          standardGasLimit,
          GasPrice.fromString(gasPrice + coin.base)
        );

        return fee;
      }
    } catch (err: any) {
      setError(err?.message || err.toString());
      console.error("Fee Estimation Error:", err);
      throw err;
    }
  };

  return { estimateFee, error };
};
