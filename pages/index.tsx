import { useEffect, useState } from "react";
import Head from "next/head";
import { useChain } from "@cosmos-kit/react";

import { auction } from "@chalabi/gravity-bridgejs/dist/codegen";
import { Auction } from "@chalabi/gravity-bridgejs/dist/codegen/auction/v1/auction";
import { getDenominationInfo, formatTokenAmount } from "../config/denoms";
import { FaSyncAlt } from "react-icons/fa";
import { bidOnAuction } from "../tx/bidOnAuction";

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
} from "@chakra-ui/react";
import { BsFillMoonStarsFill, BsFillSunFill } from "react-icons/bs";
import { MdMenu } from "react-icons/md";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { chainName } from "../config";
import { WalletSection, handleChangeColorModeValue } from "../components";

import { BsFillInfoCircleFill } from "react-icons/bs";

import { formatBidAmount, formatTotalBidCost } from "../utils/utils";
import { DrawerControlProvider } from "../components/react/useDrawerControl";
import getCompressedPublicKeyAndEthAddress from "../tx/metaMaskAccount";
import { ethToGravity } from "@gravity-bridge/address-converter";
import { createBidTransaction } from "../tx/eipSigning";
import { useQueryAccount } from "../utils/queryAccount";
import { TxContext } from "@gravity-bridge/transactions";
import { TxPayload } from "@gravity-bridge/transactions/dist/messages/common";

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
  const {
    isOpen: DrawerIsOpen,
    onOpen: DrawerOnOpen,
    onClose: DrawerOnClose,
  } = useDisclosure();

  const handleRowClick = (auction: Auction) => {
    setSelectedAuction(auction);
    onOpen();
  };

  const [response, setResponse] = useState("");

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
          setResponse,
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

  const renderAuctionTable = () => {
    return (
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Amount</Th>
              {!isLessThan1000px && <Th>Highest Bid</Th>}
              {!isLessThan1000px && <Th>Bidder</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {auctionData.map((auction, index) => {
              const denomInfo = getDenominationInfo(
                auction.amount?.denom ?? ""
              );
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
                  {!isLessThan1000px && (
                    <Td>
                      {auction.highestBid ? formatedBidAmount : "No Bid"}{" "}
                      {auction.highestBid ? "GRAV" : ""}{" "}
                    </Td>
                  )}
                  {!isLessThan1000px && (
                    <Td>{auction.highestBid?.bidderAddress} </Td>
                  )}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    );
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
                onClick={handleBidClick(
                  selectedAuction?.id.toString() ?? "",
                  bidAmountInput,
                  bidFeeAmount.toString()
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
  //         await getCompressedPublicKeyAndEthAddress();
  //       // Call the callback function with the public key and address
  //       onPublicKeyRetrieved(compressedPublicKey, ethAddress);
  //     } catch (error: any) {
  //       console.error("Error:", error.message);
  //     }
  //   };

  //   return <Button onClick={handleButtonClick}>MetaMask</Button>;
  // };

  // const [transaction, setTransaction] = useState<TxPayload | null>(null);
  // console.log(transaction);
  // const [txContext, setTxContext] = useState<TxContext | null>(null);
  // console.log(txContext);

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

  // const auctionId = Number(selectedAuction?.id); // Make sure this is a number
  // const bidAmount = Number(bidAmountInput); // Convert bidAmountInput to a number
  // const bidFee = Number(bidFeeAmount); // Convert bidFeeAmount to a number

  // if (!ethAddress || !accountData) {
  //   console.error("Ethereum address or account data is missing");
  //   return;
  // }

  // // Call createBidTransaction and check the result before destructuring
  // const result = createBidTransaction(
  //   ethAddress,
  //   auctionId,
  //   bidAmount,
  //   bidFee,
  //   accountData
  // );

  // if (result) {
  //   const { tx, context } = result;
  //   setTransaction(tx);
  //   setTxContext(context);
  // } else {
  //   console.error("Failed to create bid transaction");
  //   // Handle the error case where transaction creation failed
  // }

  return (
    <Container maxW="8xl" py={0}>
      <Head>
        <title>Gravity Bridge Fee Auction</title>
        <meta name="description" content="Gravity Bridge Fee Auction App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Image
          mt={{ base: "30px", md: "10px" }}
          height={{ base: "30px", md: "60px" }}
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
              <Flex
                alignItems={"center"}
                gap={16}
                flexDir={"row"}
                paddingX={"90px"}
              >
                <WalletSection />
              </Flex>

              <Button variant="outline" p={0} onClick={toggleColorMode}>
                <Icon
                  as={
                    colorMode === "light" ? BsFillMoonStarsFill : BsFillSunFill
                  }
                />
              </Button>
              {/* <MetaMaskButton onPublicKeyRetrieved={handlePublicKeyRetrieved} /> */}
            </>
          )}
          {isLessThan1000px && (
            <DrawerControlProvider closeDrawer={DrawerOnClose}>
              <>
                <Button top={"20px"} left={"60px"} onClick={DrawerOnOpen}>
                  <Icon name="menu" as={MdMenu} />
                </Button>

                <Drawer
                  isOpen={DrawerIsOpen}
                  placement="left"
                  onClose={DrawerOnClose}
                >
                  <DrawerOverlay zIndex={0} />
                  <DrawerContent zIndex={0}>
                    <DrawerHeader borderBottomWidth="1px">
                      <Image
                        height="40px"
                        src={handleChangeColorModeValue(
                          colorMode,
                          "logolight.svg",
                          "logodark.svg"
                        )}
                        alt="Gravity Bridge Logo"
                      />
                    </DrawerHeader>
                    <DrawerBody zIndex={0}>
                      <Flex
                        gap={-6}
                        flexDir={"column"}
                        justifyContent="space-between"
                        alignItems={"left"}
                      >
                        <Button
                          mt="40px"
                          variant="outline"
                          p={0}
                          onClick={toggleColorMode}
                        >
                          <Icon
                            as={
                              colorMode === "light"
                                ? BsFillMoonStarsFill
                                : BsFillSunFill
                            }
                          />
                        </Button>
                        <Box mr={"200px"}>
                          <WalletSection />
                        </Box>
                      </Flex>
                    </DrawerBody>
                  </DrawerContent>
                </Drawer>
              </>
            </DrawerControlProvider>
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
        {isLessThan1000px && (
          <Flex mt={"30px"} justifyContent="space-between" alignItems="center">
            <VStack alignItems={"left"}>
              <Heading as="h2" size="lg" fontWeight={"light"} letterSpacing="4">
                Fee Auction
              </Heading>
              <Text fontWeight={"light"}>
                Time Remaining: {auctionTimer.remainingTime}
              </Text>
            </VStack>
            <Flex alignItems="center">
              <Tooltip label="Auction refetch timer" aria-label="A tooltip">
                <CircularProgress value={(timer / 30) * 100} color="blue.400">
                  <CircularProgressLabel>{timer}</CircularProgressLabel>
                </CircularProgress>
              </Tooltip>
            </Flex>
          </Flex>
        )}
        <Center mt={8} mb={16}>
          {renderAuctionModal()}
          {isLoading ? (
            <Skeleton mt="4" noOfLines={12}>
              <SkeletonText spacing={12} />
            </Skeleton>
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
