/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import Head from "next/head";
import { useChain } from "@cosmos-kit/react";

import { auction } from "@chalabi/gravity-bridgejs/dist/codegen";
import { Auction } from "@chalabi/gravity-bridgejs/dist/codegen/auction/v1/auction";
import { getDenominationInfo, formatTokenAmount } from "../config/denoms";
import { FaSyncAlt } from "react-icons/fa";

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
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  MenuIcon,
  VStack,
  useColorModeValue,
  SlideFade,
  HStack,
} from "@chakra-ui/react";
import {
  BsArrowDown,
  BsFillMoonStarsFill,
  BsFillSunFill,
} from "react-icons/bs";

import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { chainName } from "../config";
import { WalletSection } from "../components";

import { BsFillInfoCircleFill } from "react-icons/bs";

import { formatBidAmount, formatTotalBidCost } from "../utils/utils";

import { useTx } from "../hooks/useTx";
import { useFeeEstimation } from "../hooks/useFeeEstimation";

const gravitybridge = { auction };
const createRPCQueryClient =
  gravitybridge.auction.ClientFactory.createRPCQueryClient;

export default function Home() {
  const { tx } = useTx("gravitybridge");

  const { colorMode, toggleColorMode } = useColorMode();

  const [isLessThan1000px] = useMediaQuery("(max-width: 1000px)");
  const { address } = useChain(chainName);

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

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const formattedTime = `~${hours}h ${minutes}m`;

    setAuctionTimer({ remainingBlocks, remainingTime: formattedTime });
  };

  useEffect(() => {
    fetchAuctionTimer();
  }, []);

  const fetchAuctions = async () => {
    const clientAuction = await createRPCQueryClient({
      rpcEndpoint: "https://nodes.chandrastation.com/rpc/gravity/",
    });
    setIsLoading(true);
    try {
      const response = await clientAuction.auction.v1.auctions();

      if (response && response.auctions) {
        setAuctionData(response.auctions);
      }
    } catch (error) {
      console.error("Failed to fetch auctions:", error);
    }
    setIsLoading(false);
    setTimer(30);
    fetchAuctionTimer();
  };

  useEffect(() => {
    fetchAuctions();

    const interval = setInterval(() => {
      fetchAuctions();
    }, 30000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev: number) => (prev > 0 ? prev - 1 : 30));
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);

  const handleRowClick = (auction: Auction) => {
    setSelectedAuction(auction);
    onOpen();
  };

  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [isError, setIsError] = useState(false);

  const { bid } = auction.v1.MessageComposer.withTypeUrl;

  const { estimateFee } = useFeeEstimation("gravitybridge" ?? "");

  const handleBidClick = async () => {
    setIsSigning(true);
    const msg = bid({
      bidder: address ?? "",
      auctionId: selectedAuction?.id ?? BigInt(0),
      amount: BigInt(bidAmountInput),
      bidFee: auctionFeePrice ?? BigInt(0),
    });

    const fee = await estimateFee(address ?? "", [msg]);
    try {
      await tx([msg], {
        fee,
        onSuccess: () => {
          setIsSigning(false);
          setIsSigned(true);
        },
      });
    } catch (error) {
      setIsSigning(false);
      setIsError(true);
      console.error("Transaction Error:", error);
    } finally {
      setIsSigning(false);
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

  const bidFeeAmount = `${auctionFeePrice.toString()}`;

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
                  <StatNumber>No Bidder</StatNumber>
                )}
              </Stat>
              <Flex mb={4} flexDir="row" align="center">
                <Stat>
                  <StatLabel>Bid Fee</StatLabel>
                  {bidFeeAmount ? (
                    <StatNumber>
                      {formatBidAmount(bidFeeAmount).toString()} GRAVITON
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
                onClick={handleBidClick}
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
              {formatTotalBidCost(bidAmountInput, bidFeeAmount)}
            </Text>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  const disabledTooltipMessage = !address
    ? "Connect your wallet to place a bid"
    : bidAmountInput === "0"
    ? "Bid amount must be greater than 0"
    : "";

  const { isOpen, onOpen, onClose } = useDisclosure();

  const hoverColor = useColorModeValue("gray.100", "gray.700");

  return (
    <Container maxW="container.xl" py={8}>
      <Head>
        <title>Gravity Bridge Fee Auction</title>
        <meta name="description" content="Gravity Bridge Fee Auction App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!isLessThan1000px ? (
        <>
          <Flex justify="space-between" align="center">
            <Flex justify="space-between" align="center" flexDir="row" gap={2}>
              <Image
                height="60px"
                src={useColorModeValue("logolight.svg", "logodark.svg")}
                alt="Gravity Bridge Logo"
              />
              <Heading as="h1" size="xl" fontWeight="hairline" lineHeight="10">
                Fee Auction
              </Heading>
            </Flex>

            <HStack spacing={4}>
              <Button onClick={toggleColorMode}>
                <Icon
                  as={useColorModeValue(BsFillMoonStarsFill, BsFillSunFill)}
                />
              </Button>
              <WalletSection />
            </HStack>
          </Flex>

          {/* Auction Timer and Information Section */}
          <Flex
            flexDir={"row"}
            justifyContent={"space-between"}
            align="center"
            p={4}
            mb={1}
          >
            <Heading as="h3" size="md">
              Auction Information
            </Heading>
            <Flex flexDirection={"row"} justify={"space-between"} gap={4}>
              <Text fontSize="sm">
                Time Remaining: <strong>{auctionTimer.remainingTime}</strong>
              </Text>

              <Text fontSize="sm">
                Blocks Remaining:{" "}
                <strong>{auctionTimer.remainingBlocks}</strong>
              </Text>
            </Flex>

            <Flex align="center">
              <Tooltip label="Auction refetch timer">
                <CircularProgress
                  value={(timer / 30) * 100}
                  color="blue.400"
                  size="35px"
                >
                  <CircularProgressLabel>{timer}</CircularProgressLabel>
                </CircularProgress>
              </Tooltip>
              <Button
                size="55px"
                onClick={fetchAuctions}
                variant="ghost"
                ml={4}
              >
                <Icon as={FaSyncAlt} />
              </Button>
            </Flex>
          </Flex>

          {/* Auction Table */}
          <Box
            borderWidth={1}
            borderColor={useColorModeValue("gray.200", "gray.700")}
            borderRadius="lg"
            overflow="hidden"
            boxShadow="lg"
          >
            <TableContainer maxH="545px" overflowY="auto">
              <Table variant="simple">
                <Thead
                  position="sticky"
                  top={0}
                  zIndex={1}
                  bg={useColorModeValue("gray.50", "gray.700")}
                >
                  <Tr>
                    <Th>ID</Th>
                    <Th>Token</Th>
                    <Th>Amount</Th>
                    <Th>Highest Bid</Th>
                    <Th>Bidder</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {auctionData.map((auction, index) => (
                    <Tr
                      key={index}
                      onClick={() => handleRowClick(auction)}
                      _hover={{
                        bg: hoverColor,
                        cursor: "pointer",
                      }}
                    >
                      <Td>{auction.id.toString()}</Td>
                      <Td>
                        {getDenominationInfo(auction.amount?.denom).symbol}
                      </Td>
                      <Td>
                        {formatTokenAmount(
                          auction.amount?.amount,
                          auction.amount?.denom
                        )}
                      </Td>
                      <Td>
                        {auction.highestBid
                          ? `${formatBidAmount(
                              auction.highestBid.bidAmount.toString()
                            )} GRAV`
                          : "No Bid"}
                      </Td>
                      <Td>{auction.highestBid?.bidderAddress || "N/A"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>

          {renderAuctionModal()}
          <Box as="footer" mt={4} textAlign="center" py={4}>
            <Text fontSize="sm" color="gray.500">
              Built by{" "}
              <Link href="https://chandrastation.com">Chandra Station</Link>
            </Text>
            <Text fontSize="xs" color="gray.500">
              Alpha v0.2.0
            </Text>
          </Box>
        </>
      ) : (
        <Box background={"rgba(0,0,0,0.1)"} padding={4} borderRadius="md">
          <Text>
            This app is not optimized for mobile devices. Please switch to a
            desktop or laptop.
          </Text>
        </Box>
      )}
    </Container>
  );
}
