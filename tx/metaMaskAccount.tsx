// Declare the Ethereum property on the Window interface
declare global {
  interface Window {
    ethereum: any;
  }
}

import { hashMessage } from "@ethersproject/hash";
import { computePublicKey, recoverPublicKey } from "@ethersproject/signing-key";

interface PublicKeyResponse {
  compressedPublicKey: string;
  ethAddress: string;
}

async function getCompressedPublicKeyAndEthAddress(): Promise<PublicKeyResponse> {
  // Check if window.ethereum is available
  if (!window.ethereum) {
    throw new Error("Ethereum wallet is not available");
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // Handle errors if MetaMask fails to return any accounts.
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts returned from Ethereum wallet");
    }

    const message = "Verify Public Key";
    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [message, accounts[0], ""],
    });

    // Compress the key, since the client expects public keys to be compressed.
    const uncompressedPk = recoverPublicKey(hashMessage(message), signature);
    const hexPk = computePublicKey(uncompressedPk, true);
    const pk = Buffer.from(hexPk.replace("0x", ""), "hex").toString("base64");

    // Ethereum address
    const ethAddress = accounts[0];

    return {
      compressedPublicKey: pk,
      ethAddress: ethAddress,
    };
  } catch (error: any) {
    throw new Error(
      `Error in getting compressed public key and Ethereum address: ${error.message}`
    );
  }
}

export default getCompressedPublicKeyAndEthAddress;
