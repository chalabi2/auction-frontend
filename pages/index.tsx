import { useEffect, useState } from "react";
import Head from "next/head";
import { useChain } from "@cosmos-kit/react";

import { auction } from "@chalabi/gravity-bridgejs/dist/codegen";
import { Auction } from "@chalabi/gravity-bridgejs/dist/codegen/auction/v1/auction";
import { getDenominationInfo, formatTokenAmount } from "../config/denoms";
import { createAuthEndpoint, DEFAULT_RPC_ENDPOINT } from "../config/auth";
import { FaSyncAlt } from "react-icons/fa";
import { HamburgerIcon } from "@chakra-ui/icons";

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
  VStack,
  Th,
  Thead,
  Tr,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
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
  Box,
  Input,
  StatNumber,
  Stat,
  StatLabel,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Spinner,
  Link,
  useColorModeValue,
  HStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { BsFillMoonStarsFill, BsFillSunFill } from "react-icons/bs";

import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { chainName } from "../config";
import { WalletSection } from "../components";

import { BsFillInfoCircleFill } from "react-icons/bs";

import { formatBidAmount, formatTotalBidCost } from "../utils/utils";

import { useTx } from "../hooks/useTx";
import { useFeeEstimation } from "../hooks/useFeeEstimation";
import { DrawerControlProvider } from "../components/react/useDrawerControl";

const gravitybridge = { auction };
const createRPCQueryClient =
  gravitybridge.auction.ClientFactory.createRPCQueryClient;

// Helper function to create RPC client with auth headers
const createAuthenticatedRPCClient = async (endpoint: string) => {
  console.log("Creating RPC client for endpoint:", endpoint);

  // If using the proxy, don't add auth headers (proxy handles it)
  const isUsingProxy =
    endpoint.includes("/api/rpc-proxy") ||
    endpoint.includes("localhost:3000/api/rpc-proxy");
  const endpointConfig = isUsingProxy ? endpoint : createAuthEndpoint(endpoint);

  console.log("Endpoint config:", endpointConfig);

  // Create the client with the endpoint configuration
  try {
    const client = await createRPCQueryClient({
      rpcEndpoint: endpointConfig,
    });
    console.log("RPC client created successfully");
    return client;
  } catch (error) {
    console.error("Failed to create RPC client:", error);
    throw error;
  }
};

export default function Home() {
  const { tx } = useTx("gravitybridge");

  const { colorMode, toggleColorMode } = useColorMode();

  const isMobile = useBreakpointValue({ base: true, md: false });
  const { address } = useChain(chainName);

  const [auctionData, setAuctionData] = useState<Auction[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(35);

  // State to store the remaining blocks and time
  const [auctionTimer, setAuctionTimer] = useState({
    remainingBlocks: 0,
    remainingTime: "",
  });
  const [auctionFeePrice, setAuctionFeePrice] = useState<bigint>(BigInt(0));
  const [cacheStatus, setCacheStatus] = useState<"HIT" | "MISS" | null>(null);

  // Function to fetch the current block height
  const fetchCurrentBlockHeight = async () => {
    const clientAuction = await createAuthenticatedRPCClient(
      DEFAULT_RPC_ENDPOINT
    );

    const currentHeightResponse =
      await clientAuction.cosmos.base.tendermint.v1beta1.getLatestBlock();
    return currentHeightResponse?.block?.header?.height || 0;
  };

  // Function to calculate and update the auction timer
  const fetchAuctionTimer = async () => {
    const clientAuction = await createAuthenticatedRPCClient(
      DEFAULT_RPC_ENDPOINT
    );
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
    const clientAuction = await createAuthenticatedRPCClient(
      DEFAULT_RPC_ENDPOINT
    );
    setIsLoading(true);
    try {
      const response = await clientAuction.auction.v1.auctions();

      if (response && response.auctions) {
        setAuctionData(response.auctions);
      }

      // Note: Cache status would be available if we were making direct HTTP requests
      // Since we're using the RPC client, we can't easily access response headers
      // In a real implementation, you might want to modify the RPC client or use a different approach
    } catch (error) {
      console.error("Failed to fetch auctions:", error);
    }
    setIsLoading(false);
    setTimer(35);
    fetchAuctionTimer();
  };

  useEffect(() => {
    fetchAuctions();

    // Reduced polling frequency since server caches for 30 seconds
    // Poll every 35 seconds to get fresh data after cache expires
    const interval = setInterval(() => {
      fetchAuctions();
    }, 35000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const countdown = setInterval(() => {
      // Update timer to reflect new 35-second interval
      setTimer((prev: number) => (prev > 0 ? prev - 1 : 35));
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

  const colorIcon = useColorModeValue(BsFillMoonStarsFill, BsFillSunFill);

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

  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();

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

  const headColor = useColorModeValue("gray.50", "gray.700");

  const renderMobileAuctionList = () => (
    <Box>
      {auctionData.map((auction, index) => (
        <Box
          key={index}
          p={4}
          borderWidth={1}
          borderRadius="md"
          mb={4}
          onClick={() => handleRowClick(auction)}
          _hover={{
            bg: hoverColor,
            cursor: "pointer",
          }}
        >
          <Flex justifyContent="space-between" alignItems="center" mb={2}>
            <Text fontWeight="bold">ID: {auction.id.toString()}</Text>
            <Text>{getDenominationInfo(auction.amount?.denom).symbol}</Text>
          </Flex>
          <Text fontSize="sm" mb={2}>
            Amount:{" "}
            {formatTokenAmount(auction.amount?.amount, auction.amount?.denom)}
          </Text>
          <Text fontSize="sm" mb={2}>
            Highest Bid:{" "}
            {auction.highestBid
              ? `${formatBidAmount(
                  auction.highestBid.bidAmount.toString()
                )} GRAV`
              : "No Bid"}
          </Text>
          <Text fontSize="sm" isTruncated>
            Bidder: {auction.highestBid?.bidderAddress || "N/A"}
          </Text>
        </Box>
      ))}
    </Box>
  );

  return (
    <Container maxW="container.xl" py={isMobile ? 4 : 0}>
      <Head>
        <title>Gravity Bridge Fee Auction</title>
        <meta name="description" content="Gravity Bridge Fee Auction App" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
      </Head>

      <Flex
        justify="space-between"
        align="center"
        flexDirection={isMobile ? "column" : "row"}
        mb={4}
      >
        <Flex
          justify="space-between"
          align="center"
          flexDir={isMobile ? "column" : "row"}
          gap={2}
          mb={isMobile ? 4 : 0}
        >
          <Image
            height={isMobile ? "40px" : "60px"}
            src={useColorModeValue("logolight.svg", "logodark.svg")}
            alt="Gravity Bridge Logo"
            display={useBreakpointValue({
              base: "none",
              sm: "none",
              md: "block",
              lg: "block",
            })}
          />
          <Heading
            as="h1"
            size={"xl"}
            fontWeight="thin"
            lineHeight="10"
            mt={isMobile ? 2 : -0.65}
            display={useBreakpointValue({
              md: "none",
              lg: "block",
            })}
          >
            Fee Auction
          </Heading>
        </Flex>

        {isMobile ? (
          <Button position="absolute" right={2} onClick={onDrawerOpen}>
            <HamburgerIcon />
          </Button>
        ) : (
          <HStack spacing={4}>
            <Button onClick={toggleColorMode}>
              <Icon as={colorIcon} />
            </Button>
            <WalletSection />
          </HStack>
        )}
      </Flex>

      {/* Mobile Drawer */}
      <DrawerControlProvider
        closeDrawer={onDrawerClose}
        onDrawerClose={onDrawerClose}
      >
        <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Menu</DrawerHeader>
            <DrawerBody>
              <VStack spacing={-10} justifyContent="center" alignItems="center">
                <Button onClick={toggleColorMode} width="100%">
                  <Icon
                    as={useColorModeValue(BsFillMoonStarsFill, BsFillSunFill)}
                    mr={2}
                  />
                  {colorMode === "light" ? "Dark Mode" : "Light Mode"}
                </Button>
                <WalletSection />
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </DrawerControlProvider>
      {/* Auction Timer and Information Section */}
      <Flex
        flexDir={isMobile ? "column" : "row"}
        justifyContent="space-between"
        align={isMobile ? "flex-start" : "center"}
        p={4}
        mb={4}
        borderWidth={1}
        borderRadius="md"
      >
        <Heading as="h3" size="md" mb={isMobile ? 2 : 0}>
          Auction Information
        </Heading>
        <Flex
          flexDirection={isMobile ? "column" : "row"}
          gap={4}
          mb={isMobile ? 2 : 0}
        >
          <Text fontSize="sm">
            Time Remaining: <strong>{auctionTimer.remainingTime}</strong>
          </Text>
          <Text fontSize="sm">
            Blocks Remaining: <strong>{auctionTimer.remainingBlocks}</strong>
          </Text>
        </Flex>
        <Flex align="center">
          <Tooltip label="Auction refetch timer">
            <CircularProgress
              value={(timer / 35) * 100}
              color="blue.400"
              size="35px"
            >
              <CircularProgressLabel>{timer}</CircularProgressLabel>
            </CircularProgress>
          </Tooltip>
        </Flex>
      </Flex>

      {/* Auction Table or List */}
      <Box
        borderWidth={1}
        borderColor={useColorModeValue("gray.200", "gray.700")}
        borderRadius="lg"
        overflow="hidden"
        boxShadow="lg"
      >
        {isMobile ? (
          <Box maxH="545px" overflowY="auto" p={4}>
            {renderMobileAuctionList()}
          </Box>
        ) : (
          <TableContainer maxH="545px" overflowY="auto">
            <Table variant="simple">
              <Thead position="sticky" top={0} zIndex={1} bg={headColor}>
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
                    <Td>{getDenominationInfo(auction.amount?.denom).symbol}</Td>
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
        )}
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
    </Container>
  );
}
