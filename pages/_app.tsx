/* eslint-disable */
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChainProvider } from "@cosmos-kit/react";
import { ChakraProvider } from "@chakra-ui/react";
import { defaultTheme } from "../config";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as cosmostationWallets } from "@cosmos-kit/cosmostation";
import { wallets as leapWallets } from "@cosmos-kit/leap";

import { assets, chains } from "chain-registry";

import { MainWalletBase, SignerOptions } from "@cosmos-kit/core";
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
      chain: Chain
    ): SigningStargateClientOptions | undefined => {
      const registry = new Registry(auctionProtoRegistry);
      const aminoTypes = new AminoTypes(auctionAminoConverters);
      return {
        aminoTypes: aminoTypes,
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
              rpc: ["https://nodes.chandrastation.com/rpc/gravity/"],
              rest: ["https://nodes.chandrastation.com/api/gravity/"],
            },
          },
        }}
        chains={chains}
        assetLists={assets}
        wallets={
          [
            ...keplrWallets,
            ...cosmostationWallets,
            ...leapWallets,
          ] as unknown as MainWalletBase[]
        }
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
        signerOptions={signerOptions}
      >
        <Component {...pageProps} />
      </ChainProvider>
    </ChakraProvider>
  );
}

export default CreateCosmosApp;
