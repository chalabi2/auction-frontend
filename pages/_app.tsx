/* eslint-disable */
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChainProvider } from "@cosmos-kit/react";
import { ChakraProvider } from "@chakra-ui/react";
import {
  defaultTheme,
  createAuthEndpoint,
  DEFAULT_RPC_ENDPOINT,
  DEFAULT_REST_ENDPOINT,
} from "../config";
import { wallets } from "cosmos-kit";

import { assets, chain } from "chain-registry/mainnet/gravitybridge";

import { SignerOptions } from "@cosmos-kit/core";
import { Chain } from "@chain-registry/types";
import "@interchain-ui/react/styles";

import {
  auctionAminoConverters,
  auctionProtoRegistry,
} from "@chalabi/gravity-bridgejs/dist/codegen";
import { AminoTypes, SigningStargateClientOptions } from "@cosmjs/stargate";
import { Registry } from "@cosmjs/proto-signing";

function CreateCosmosApp({ Component, pageProps }: AppProps) {
  const signerOptions: SignerOptions = {
    //@ts-ignore
    signingStargate: (
      _chain: Chain
    ): SigningStargateClientOptions | undefined => {
      const registry = new Registry(auctionProtoRegistry);
      const aminoTypes = new AminoTypes(auctionAminoConverters);
      return {
        aminoTypes: aminoTypes,
        // @ts-ignore
        registry: registry,
      };
    },
  };

  return (
    <ChakraProvider theme={defaultTheme}>
      <ChainProvider
        endpointOptions={{
          endpoints: {
            gravitybridge: {
              rpc: [createAuthEndpoint(DEFAULT_RPC_ENDPOINT)],
              rest: [createAuthEndpoint(DEFAULT_REST_ENDPOINT)],
            },
          },
        }}
        chains={[chain]}
        logLevel="NONE"
        assetLists={[assets]}
        wallets={wallets as any}
        walletConnectOptions={{
          signClient: {
            projectId: "a8510432ebb71e6948cfd6cde54b70f7",
            relayUrl: "wss://relay.walletconnect.org",
            metadata: {
              name: "Gravity Bridge Fee App",
              description: "Gravity Bridge Fee Auction App",
              url: "https://auction.gravitypulse.app",
              icons: [],
            },
          },
        }}
        // @ts-ignore
        signerOptions={signerOptions}
      >
        {/* @ts-ignore */}
        <Component {...pageProps} />
      </ChainProvider>
    </ChakraProvider>
  );
}

export default CreateCosmosApp;
