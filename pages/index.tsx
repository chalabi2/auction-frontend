import { useEffect, useState } from "react";
import Head from "next/head";
import { useChain } from "@cosmos-kit/react";
import BigNumber from "bignumber.js";
import {
  auction,
  auctionAminoConverters,
  auctionProtoRegistry,
} from "@chalabi/gravity-bridgejs/dist/codegen";
import { Auction } from "@chalabi/gravity-bridgejs/dist/codegen/auction/v1/auction";
import { getDenominationInfo, formatTokenAmount } from "../config/denoms";
import { FaSyncAlt } from "react-icons/fa";
import { bidOnAuction } from "../components/tx/dead.bidOnAuction";
import { Registry } from "@cosmjs/proto-signing";
import {
  Heading,
  Text,
  Container,
  Button,
  Flex,
  Icon,
  useColorMode,
  Center,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Image,
  CircularProgress,
  CircularProgressLabel,
  useDisclosure,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tooltip,
  SkeletonText,
  Skeleton,
  Box,
  Input,
  StatNumber,
  Stat,
  StatLabel,
  useToast,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Spinner,
  Link,
  useMediaQuery,
} from "@chakra-ui/react";
import { BsFillMoonStarsFill, BsFillSunFill } from "react-icons/bs";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { chainName } from "../config";
import { WalletSection, handleChangeColorModeValue } from "../components";
import { Chain } from "@chain-registry/types";
import { SignerOptions } from "@cosmos-kit/core";
import { AminoTypes } from "@cosmjs/stargate";
import { BsFillInfoCircleFill } from "react-icons/bs";

const gravitybridge = { auction };
const createRPCQueryClient =
  gravitybridge.auction.ClientFactory.createRPCQueryClient;

export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode();

  const [isLessThan1000px] = useMediaQuery("(max-width: 1000px)");
  const { getSigningStargateClient, address, status, getRpcEndpoint } =
    useChain(chainName);

  const [auctionData, setAuctionData] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  // State to store the remaining blocks and time
  const [auctionTimer, setAuctionTimer] = useState({
    remainingBlocks: 0,
    remainingTime: "",
  });
  const [auctionFeePrice, setAuctionFeePrice] = useState<bigint>(BigInt(0));

  // Function to fetch the current block height
  const fetchCurrentBlockHeight = async () => {
    const clientAuction = await createRPCQueryClient({
      rpcEndpoint: "https://nodes.chandrastation.com/rpc/gravity/",
    });
    const currentHeightResponse =
      await clientAuction.cosmos.base.tendermint.v1beta1.getLatestBlock();
    return currentHeightResponse?.block?.header?.height || 0;
  };

  // Function to calculate and update the auction timer
  const fetchAuctionTimer = async () => {
    const clientAuction = await createRPCQueryClient({
      rpcEndpoint: "https://nodes.chandrastation.com/rpc/gravity/",
    });
    const times = await clientAuction.auction.v1.auctionPeriod();
    const params = await clientAuction.auction.v1.params();
    const auctionFeePrice = params.params.minBidFee;
    setAuctionFeePrice(auctionFeePrice);
    const endBlockHeight = times.auctionPeriod?.endBlockHeight.toString() || 0;
    const currentBlockHeight = await fetchCurrentBlockHeight();

    const remainingBlocks = Number(endBlockHeight) - Number(currentBlockHeight);
    const totalSeconds = remainingBlocks * 6; // Assuming each block takes an average of 6 seconds

    // Calculate hours, minutes, and seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Format the time
    const formattedTime = `~${hours}h ${minutes}m`;

    setAuctionTimer({ remainingBlocks, remainingTime: formattedTime });
  };

  useEffect(() => {
    fetchAuctionTimer(); // Call this function on component mount or when needed
  }, []);

  const fetchAuctions = async () => {
    const clientAuction = await createRPCQueryClient({
      rpcEndpoint: "https://nodes.chandrastation.com/rpc/gravity/",
    });

    setIsLoading(true);
    try {
      // Fetch auctions
      const response = await clientAuction.auction.v1.auctions();

      if (response && response.auctions) {
        setAuctionData(response.auctions);
      }
    } catch (error) {
      console.error("Failed to fetch auctions:", error);
    }
    setIsLoading(false);
    setTimer(30); // Reset timer
    fetchAuctionTimer();
  };

  useEffect(() => {
    fetchAuctions(); // Fetch on render

    const interval = setInterval(() => {
      fetchAuctions(); // Refetch every 30 seconds
    }, 30000);

    return () => clearInterval(interval); // Clear interval on unmount
  }, []);
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);

    return () => clearInterval(countdown); // Clear countdown on unmount
  }, []);

  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleRowClick = (auction: Auction) => {
    setSelectedAuction(auction);
    onOpen();
  };

  const [response, setResponse] = useState("");

  const signerOptions: SignerOptions = {
    signingStargate: (chain: Chain) => {
      const registry = new Registry(auctionProtoRegistry);
      const aminoTypes = new AminoTypes({
        ...auctionAminoConverters,
        "gravity/MsgBid": auctionAminoConverters["/auction.v1.MsgBid"],
      });
      return {
        aminoTypes: aminoTypes,
        registry: registry,
      };
    },
  };

  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [isError, setIsError] = useState(false);

  const toast = useToast();

  const handleBidClick =
    (auctionId: string, bidAmount: string, bidFeeAmount: string) =>
    async (event: {
      preventDefault: () => void;
      stopPropagation: () => void;
    }) => {
      event.preventDefault();
      event.stopPropagation();
      setIsSigning(true);
      setIsError(false);
      try {
        await bidOnAuction(
          getSigningStargateClient,
          signerOptions,
          setResponse,
          chainName ?? "",
          address ?? "",
          auctionId,
          bidAmount,
          bidFeeAmount,
          toast
        )();
        setIsSigning(false);
        setIsSigned(false);
      } catch (error) {
        setIsSigning(false);
        setIsError(true);
        console.error(error);
      }
    };

  const [bidAmountInput, setBidAmountInput] = useState("0");

  const handleInputChange = (event: { target: { value: string } }) => {
    // Extract the value from the event
    const inputValue = event.target.value;

    // Convert the input value to a number (handle both integer and decimal inputs)
    let inputNumber = Number(inputValue);

    // Check if the number is valid and non-negative
    if (!isNaN(inputNumber) && inputNumber >= 0) {
      // Multiply the number by 10^6 and convert to string
      let convertedNumber = (inputNumber * 1e6).toString();

      // Update the state with the converted number
      setBidAmountInput(convertedNumber);
    }
  };

  const formatBidAmount = (bidAmount: BigNumber.Value) => {
    // Convert the bid amount to BigNumber for precise calculations
    const amountInUgraviton = new BigNumber(bidAmount);

    // Convert ugraviton to graviton (1 graviton = 1,000,000 ugraviton)
    const amountInGraviton = amountInUgraviton.dividedBy(1000000);

    // If the amount is less than 1,000,000 ugraviton, format it with up to 5 decimal places
    if (amountInUgraviton.isLessThan(1000000)) {
      return amountInGraviton.toFormat();
    } else {
      // For amounts equal or above 1,000,000 ugraviton, show whole number or decimal if present
      return amountInGraviton.toFormat(
        amountInGraviton.decimalPlaces() || 0 > 0
          ? amountInGraviton.decimalPlaces() || 0
          : 0
      );
    }
  };

  const formatTotalBidCost = () => {
    // Convert bidAmountInput to a number
    const bidAmountNumber = Number(bidAmountInput);

    // Convert bidFeeAmount to a number
    const bidFeeAmountNumber = Number(bidFeeAmount);

    // Calculate the total bid cost in smaller units (ugraviton)
    const totalBidCostUgraviton = bidAmountNumber + bidFeeAmountNumber;

    // Convert the total bid cost back to graviton (1 graviton = 1,000,000 ugraviton)
    const totalBidCostGraviton = totalBidCostUgraviton / 1e6;

    // Format and return the total bid cost
    return totalBidCostGraviton.toFixed(6).toString() + " GRAVITON";
  };

  const renderAuctionTable = () => (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Amount</Th>
            <Th>Highest Bid</Th>
            <Th>Bidder</Th>
          </Tr>
        </Thead>
        <Tbody>
          {auctionData.map((auction, index) => {
            const denomInfo = getDenominationInfo(auction.amount?.denom ?? "");
            const formattedAmount = formatTokenAmount(
              auction.amount?.amount || "0",
              auction.amount?.denom || ""
            );
            const formatedBidAmount = formatBidAmount(
              auction.highestBid?.bidAmount.toString() || 0
            );
            return (
              <Tr
                key={index}
                _hover={{
                  bg:
                    colorMode === "light"
                      ? "gray.100"
                      : "rgba(255,255,255,0.1)",
                  cursor: "pointer",
                }}
                onClick={() => handleRowClick(auction)}
              >
                <Td>{auction.id.toString()}</Td>
                <Td>
                  {formattedAmount} {denomInfo.symbol}
                </Td>
                <Td>
                  {auction.highestBid ? formatedBidAmount : "No Bid"}{" "}
                  {auction.highestBid ? "GRAV" : ""}{" "}
                </Td>
                <Td>{auction.highestBid?.bidderAddress} </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );

  const bidFeeAmount = auctionFeePrice.toString();

  const renderAuctionModal = () => (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Auction Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isSigning && (
            <Center>
              <Spinner size="xl" />
            </Center>
          )}
          {isSigned && (
            <Alert status="success">
              <AlertIcon as={AiOutlineCheckCircle} />
              <AlertTitle mr={2}>Success!</AlertTitle>
              <AlertDescription>
                Your transaction has been signed.
              </AlertDescription>
            </Alert>
          )}
          {isError && (
            <Alert status="error">
              <AlertIcon as={AiOutlineCloseCircle} />
              <AlertTitle mr={2}>Error!</AlertTitle>
              <AlertDescription>
                An error occurred during the transaction.
              </AlertDescription>
            </Alert>
          )}
          {!isSigning && !isSigned && !isError && selectedAuction && (
            <Flex flexDir={"column"} gap={6}>
              <Stat>
                <StatLabel>ID</StatLabel>
                <StatNumber>{selectedAuction.id.toString()}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Amount</StatLabel>
                <StatNumber>
                  {formatTokenAmount(
                    selectedAuction.amount?.amount,
                    selectedAuction.amount?.denom
                  )}{" "}
                  {getDenominationInfo(selectedAuction.amount?.denom).symbol}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Highest Bid</StatLabel>
                {selectedAuction.highestBid ? (
                  <StatNumber>
                    {" "}
                    {formatBidAmount(
                      selectedAuction.highestBid?.bidAmount.toString()
                    )}{" "}
                    GRAVITON
                  </StatNumber>
                ) : (
                  <StatNumber>No Bid</StatNumber>
                )}
              </Stat>
              <Stat mb={4}>
                <StatLabel>Bidder</StatLabel>
                {selectedAuction.highestBid?.bidderAddress ? (
                  <Text fontWeight={"bold"} fontSize={"md"}>
                    {selectedAuction.highestBid?.bidderAddress}
                  </Text>
                ) : (
                  <StatNumber>No Bid</StatNumber>
                )}
              </Stat>
              <Flex mb={4} flexDir="row" align="center">
                <Stat>
                  <StatLabel>Bid Fee</StatLabel>
                  {bidFeeAmount ? (
                    <StatNumber>
                      {Number(formatBidAmount(bidFeeAmount))
                        .toFixed(6)
                        .toString()}{" "}
                      GRAVITON
                    </StatNumber>
                  ) : (
                    <StatNumber>No Bid</StatNumber>
                  )}
                </Stat>
                <Tooltip
                  placement="bottom"
                  label="The bid fee is non-refundable, the bid amount will be returned if you are outbid."
                >
                  <Box>
                    <BsFillInfoCircleFill size={"15px"} />
                  </Box>
                </Tooltip>
              </Flex>
            </Flex>
          )}

          <Flex
            mt={4}
            justifyContent="space-between"
            alignItems="center"
            gap={6}
          >
            <Input
              type="text"
              onChange={handleInputChange}
              placeholder="Enter amount"
              mb={6}
            />
            <Tooltip label={disabledTooltipMessage}>
              <Button
                isDisabled={!address || bidAmountInput === "0"}
                onClick={handleBidClick(
                  String(selectedAuction?.id),
                  bidAmountInput,
                  bidFeeAmount
                )}
                colorScheme="blue"
                mb={6}
              >
                Bid
              </Button>
            </Tooltip>
          </Flex>
          <Flex
            justifyContent="space-between"
            flexDir={"column"}
            alignItems="center"
            mb={4}
          >
            <Text fontWeight={"bold"} fontSize={"sm"}>
              Total Bid Cost
            </Text>
            <Text fontSize={"sm"} fontWeight={"bold"}>
              {formatTotalBidCost()}
            </Text>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

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

  const disabledTooltipMessage = !address
    ? "Connect your wallet to place a bid"
    : bidAmountInput === "0"
    ? "Bid amount must be greater than 0"
    : "";

  return (
    <Container maxW="8xl" py={0}>
      <Head>
        <title>Gravity Bridge Fee Auction</title>
        <meta name="description" content="Gravity Bridge Fee Auction App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Image
          mt={"10px"}
          height={"60px"}
          src={handleChangeColorModeValue(
            colorMode,
            "logolight.svg",
            "logodark.svg"
          )}
          alt="Gravity Bridge Logo"
        />
        <Flex
          alignItems="center"
          justifyContent="space-between"
          mr={"100px"}
          mt={"-10px"}
        >
          {!isLessThan1000px && (
            <>
              <Box paddingX={"90px"}>
                <WalletSection />
              </Box>

              <Button variant="outline" p={0} onClick={toggleColorMode}>
                {/* eslint-disable-next-line  */}
                <Icon
                  as={handleChangeColorModeValue(
                    colorMode,
                    // eslint-disable-next-line
                    BsFillMoonStarsFill,
                    BsFillSunFill
                  )}
                />
              </Button>
            </>
          )}
        </Flex>
      </Flex>
      <Container maxW="5xl" py={4}>
        {!isLessThan1000px && (
          <Flex justifyContent="space-between" alignItems="center">
            <Heading as="h2" size="lg" fontWeight={"light"} letterSpacing="4">
              Fee Auction
            </Heading>
            <Text fontWeight={"light"}>
              Time Remaining: {auctionTimer.remainingTime}
            </Text>
            <Text fontWeight={"light"}>
              Blocks Remaining: {auctionTimer.remainingBlocks}
            </Text>
            <Flex alignItems="center">
              <Tooltip label="Auction refetch timer" aria-label="A tooltip">
                <CircularProgress value={(timer / 30) * 100} color="blue.400">
                  <CircularProgressLabel>{timer}</CircularProgressLabel>
                </CircularProgress>
              </Tooltip>
              <Button onClick={fetchAuctions} bgColor="transparent" ml={3}>
                <Icon as={FaSyncAlt} />
              </Button>
            </Flex>
          </Flex>
        )}
        <Center mt={8} mb={16}>
          {renderAuctionModal()}
          {isLoading ? (
            <Skeleton mt="4" noOfLines={12}>
              <SkeletonText spacing={12} />
            </Skeleton>
          ) : isLessThan1000px ? (
            <Text color="gray.600" fontSize="lg" textAlign="center">
              This breakpoint is not supported, please either rotate to
              landscape or switch to a desktop.
            </Text>
          ) : (
            auctionData.length > 0 && renderAuctionTable()
          )}
        </Center>
        <Center mt={"-30px"}>
          <Text fontSize="sm" color="gray.500">
            Built by{" "}
            <Link href="https://chandrastation.com">Chandra Station</Link>
          </Text>
        </Center>
        <Center>
          <Text fontSize="xs" fontWeight={"light"} color="gray.500">
            Alpha v0.0.1
          </Text>
        </Center>
      </Container>
    </Container>
  );
}
