// @ts-ignore
// <MetaMaskButton
// onPublicKeyRetrieved={handlePublicKeyRetrieved}
// /> 

// type PublicKeyRetrievedHandler = (
//   publicKey: string,
//   ethAddress: string
// ) => void;

// interface MetaMaskButtonProps {
//   onPublicKeyRetrieved: PublicKeyRetrievedHandler;
// }

// const MetaMaskButton: React.FC<MetaMaskButtonProps> = ({
//   onPublicKeyRetrieved,
// }) => {
//   const handleButtonClick = async () => {
//     try {
//       const { compressedPublicKey, ethAddress } =
//         await getCompressedPublicKey();
//       // Call the callback function with the public key and address
//       onPublicKeyRetrieved(compressedPublicKey, ethAddress);
//     } catch (error: any) {
//       console.error("Error:", error.message);
//     }
//   };

//   return <Button onClick={handleButtonClick}>MetaMask</Button>;
// };

// const [publicKey, setPublicKey] = useState("");
// const [ethAddress, setEthAddress] = useState("");

// const handlePublicKeyRetrieved: PublicKeyRetrievedHandler = (pk, address) => {
//   setPublicKey(pk);
//   setEthAddress(address);
// };

// const gravAddress = ethToGravity(ethAddress);
// const { accountData } = useQueryAccount(gravAddress);
// const accountNumber =
//   accountData?.account?.account_number ?? "Default Account Number";
// const sequence = accountData?.account?.sequence ?? "Default Sequence";

// const eipTx = createBidTransaction(
//   ethAddress,
//   Number(selectedAuction?.id),
//   Number(bidAmountInput),
//   Number(bidFeeAmount),
//   accountData
// );

// const handleBidClick = async () => {
//   if (!selectedAuction) return;

//   // Call createBidTransaction to get the context and tx
//   const bidTransaction = createBidTransaction(
//     address,
//     selectedAuction.id.low,
//     3000000,  // replace with actual bid amount
//     2000000,  // replace with actual bid fee
//     accountData
//   );

//   if (!bidTransaction) {
//     console.error("Failed to create transaction");
//     return;
//   }

//   const { context, tx } = bidTransaction;

//   try {
//     // Sign the transaction using Keplr
//     const signResponse = await window.keplr?.signDirect(
//       context.chain.cosmosChainId,
//       context.sender.accountAddress,
//       {
//         bodyBytes: tx.signDirect.body.toBinary(),
//         authInfoBytes: tx.signDirect.authInfo.toBinary(),
//         chainId: context.chain.cosmosChainId,
//         accountNumber: new Long(context.sender.accountNumber),
//       },
//     );

//     if (!signResponse) throw new Error("Failed to sign the transaction");

//     const signatures = [
//       new Uint8Array(Buffer.from(signResponse.signature.signature, 'base64')),
//     ];

//     // Create the signed transaction
//     const signedTx = createTxRaw(
//       signResponse.signed.bodyBytes,
//       signResponse.signed.authInfoBytes,
//       signatures,
//     );

//     const nodeUrl = "https://gravitychain.io:1317"

//     const postOptions = {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: generatePostBodyBroadcast(signedTx),
//     }

//     const broadcastEndpoint = `${nodeUrl}${generateEndpointBroadcast()}`
//     const broadcastPost = await fetch(
//       broadcastEndpoint,
//       postOptions,
//     )

//     const response = await broadcastPost.json()
//     response()
//   } catch (error) {
//     console.error("Error during transaction signing or broadcasting:", error);
//     // ... error handling
//   }
// };

export {}