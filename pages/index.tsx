import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useChain } from '@cosmos-kit/react';

import BigNumber from 'bignumber.js';
import { auction} from '../node_modules/@chalabi/gravity-bridgejs/dist/codegen/index';
import { Auction } from '@chalabi/gravity-bridgejs/dist/codegen/auction/v1/auction';
import { getDenominationInfo, formatTokenAmount } from '../config/denoms';
import { FaSyncAlt } from 'react-icons/fa';

import { createTxRaw } from '@gravity-bridge/proto';
import {
  generateEndpointBroadcast,
  generatePostBodyBroadcast,
} from '@gravity-bridge/provider';

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
  Spacer
} from '@chakra-ui/react';
import { BsFillMoonStarsFill, BsFillSunFill } from 'react-icons/bs';
import {

  chainName,

} from '../config';


import {
  WalletSection,
  handleChangeColorModeValue,
} from '../components';


import Long from 'long';
import { createBidTransaction } from '../components/tx/bidOnAuctions';
import { useQueryAccount } from '../components/tx/queryAccount';


const gravitybridge = { auction };
const createRPCQueryClient = gravitybridge.auction.ClientFactory.createRPCQueryClient;



export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode();

  const { getSigningStargateClient, address, status, getRpcEndpoint } =
    useChain(chainName);

  const [auctionData, setAuctionData] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);

   // State to store the remaining blocks and time
   const [auctionTimer, setAuctionTimer] = useState({ remainingBlocks: 0, remainingTime: '' });

   // Function to fetch the current block height
   const fetchCurrentBlockHeight = async () => {
     const clientAuction = await createRPCQueryClient({ rpcEndpoint: 'https://nodes.chandrastation.com/rpc/gravity/' }); 
     const currentHeightResponse = await clientAuction.cosmos.base.tendermint.v1beta1.getLatestBlock();
     return currentHeightResponse?.block?.header?.height || 0;
   };
 
   // Function to calculate and update the auction timer
   const fetchAuctionTimer = async () => {
     const clientAuction = await createRPCQueryClient({ rpcEndpoint: 'https://nodes.chandrastation.com/rpc/gravity/' }); 
     const times = await clientAuction.auction.v1.auctionPeriod();
     const endBlockHeight = times.auctionPeriod?.endBlockHeight.toNumber() || 0;
     const currentBlockHeight = await fetchCurrentBlockHeight();
 
     const remainingBlocks = endBlockHeight - Number(currentBlockHeight);
     const seconds = remainingBlocks * 6; // Assuming each block takes an average of 6 seconds
     const formattedTime = new Date(seconds * 1000).toISOString().substr(11, 8);
 
     setAuctionTimer({ remainingBlocks, remainingTime: formattedTime });
   };
 
   useEffect(() => {
     fetchAuctionTimer(); // Call this function on component mount or when needed
   }, []);
   
  const fetchAuctions = async () => {
    const clientAuction = await createRPCQueryClient({ rpcEndpoint: 'https://nodes.chandrastation.com/rpc/gravity/' }); 
   
    setIsLoading(true);
    try {
      // Fetch auctions
      const response = await clientAuction.auction.v1.auctions();
      
      if (response && response.auctions) {
        setAuctionData(response.auctions);
      }
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
    }
    setIsLoading(false);
    setTimer(30); // Reset timer
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
      return amountInGraviton.toFormat(amountInGraviton.decimalPlaces() > 0 ? amountInGraviton.decimalPlaces() : 0);
    }
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
          const denomInfo = getDenominationInfo(auction.amount?.denom ?? '');
          const formattedAmount = formatTokenAmount(auction.amount?.amount || '0', auction.amount?.denom || '');
          const formatedBidAmount = formatBidAmount(auction.highestBid?.bidAmount || 0);
          return (
            <Tr key={index}
            _hover={{ 
              bg: colorMode === 'light' ? 'gray.100' : 'rgba(255,255,255,0.1)', 
              cursor: 'pointer' 
            }}
                onClick={() => handleRowClick(auction)}
                >
              <Td>{auction.id.low}</Td>
              <Td>{formattedAmount} {denomInfo.symbol}</Td>
              <Td>{auction.highestBid ? formatedBidAmount : 'No Bid'} {auction.highestBid ? 'GRAV' : ''}  </Td>
              <Td>{auction.highestBid?.bidderAddress} </Td>
            </Tr>
          );
        })}
        </Tbody>
      </Table>
    </TableContainer>
  );

  const renderAuctionModal = () => (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Auction Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedAuction && (
            <>
              <Text>ID: {selectedAuction.id.low}</Text>
              <Text>Amount: {selectedAuction.amount?.amount}</Text>
              <Text>Denom: {selectedAuction.amount?.denom}</Text>
              <Text>Highest Bid: {selectedAuction.highestBid?.bidAmount.toString()}</Text>
              <Text>Bidder: {selectedAuction.highestBid?.bidderAddress}</Text>
        
            </>
          )}
          <Button   colorScheme="blue" mt={4}>Bid</Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
  
  const { accountData, loading, error } = useQueryAccount(address);


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
  

  
  return (
    <Container maxW="8xl" py={0}>
      <Head>
        <title>Gravity Bridge Fee Auction App</title>
        <meta name="description" content="Gravity Bridge Fee Auction App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Image 
          height={"40px"}
          src={handleChangeColorModeValue(
            colorMode,
            "logolight.svg",
            "logodark.svg",
          )}
          alt="Gravity Bridge Logo"
        />
     
     <Heading

         as="h1"
         fontSize={{ base: '2xl', md: '2xl' }}
         fontWeight="light"
         letterSpacing={2}
       >
        FEE AUCTION
       </Heading>


 <WalletSection/>

         
          <Button  variant="outline" p={0} onClick={toggleColorMode}>

            <Icon
              as={handleChangeColorModeValue(
                colorMode,
                BsFillMoonStarsFill,
                BsFillSunFill
              )}
            />
          </Button>

      </Flex>


   
      <Container maxW="5xl" py={4}>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading as="h2" size="lg" fontWeight={"light"} letterSpacing="4">Auction Table</Heading>
        <Text>Time Remaining: {auctionTimer.remainingTime}</Text>
      <Text>Blocks Remaining: {auctionTimer.remainingBlocks}</Text>
        <Flex alignItems="center">
        <Tooltip label="Auction refetch timer" aria-label='A tooltip'>
          <CircularProgress value={(timer / 30) * 100} color="blue.400">
            <CircularProgressLabel>{timer}</CircularProgressLabel>
          </CircularProgress>
          </Tooltip>
          <Button onClick={fetchAuctions} bgColor="transparent" ml={3}>
            <Icon as={FaSyncAlt} />
          </Button>
        </Flex>
      </Flex>

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

      </Container>
 
    </Container>
  );
}
