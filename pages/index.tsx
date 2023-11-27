import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useChain } from '@cosmos-kit/react';
import { StdFee } from '@cosmjs/amino';
import { SigningStargateClient } from '@cosmjs/stargate';
import BigNumber from 'bignumber.js';
import { auction } from '../node_modules/@chalabi/gravity-bridgejs/dist/codegen/index';
import { Auction } from '@chalabi/gravity-bridgejs/dist/codegen/auction/v1/auction';
import { getDenominationInfo, formatTokenAmount } from '../config/denoms';
import { FaRegClock, FaSyncAlt } from 'react-icons/fa';
import {
  Box,
  Divider,
  Grid,
  Heading,
  Text,
  Stack,
  Container,
  Link,
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
  Spinner,
  CircularProgress,
  CircularProgressLabel,
  useDisclosure,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react';
import { BsFillMoonStarsFill, BsFillSunFill } from 'react-icons/bs';
import {
  chainassets,
  chainName,
  coin,
  dependencies,
  products,
} from '../config';

import { WalletStatus } from '@cosmos-kit/core';
import {
  Product,
  Dependency,
  WalletSection,
  handleChangeColorModeValue,
} from '../components';
import { SendTokensCard } from '../components/react/send-tokens-card';

import { cosmos } from 'interchain';

const gravitybridge = { auction };
const createRPCQueryClient = gravitybridge.auction.ClientFactory.createRPCQueryClient;

const library = {
  title: 'Interchain',
  text: 'Interchain',
  href: 'https://github.com/cosmology-tech/interchain',
};

const sendTokens = (
  getSigningStargateClient: () => Promise<SigningStargateClient>,
  setResp: (resp: string) => any,
  address: string
) => {
  return async () => {
    const stargateClient = await getSigningStargateClient();
    if (!stargateClient || !address) {
      console.error('stargateClient undefined or address undefined.');
      return;
    }

    const { send } = cosmos.bank.v1beta1.MessageComposer.withTypeUrl;

    const msg = send({
      amount: [
        {
          denom: coin.base,
          amount: '1000',
        },
      ],
      toAddress: address,
      fromAddress: address,
    });

    const fee: StdFee = {
      amount: [
        {
          denom: coin.base,
          amount: '2000',
        },
      ],
      gas: '86364',
    };
    const response = await stargateClient.signAndBroadcast(address, [msg], fee);
    setResp(JSON.stringify(response, null, 2));
  };
};

export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode();

  const { getSigningStargateClient, address, status, getRpcEndpoint } =
    useChain(chainName);


  const [auctionData, setAuctionData] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  

  

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
          return (
            <Tr key={index}
            _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                onClick={() => handleRowClick(auction)}
                >
              <Td>{auction.id.low}</Td>
              <Td>{formattedAmount} {denomInfo.symbol}</Td>
              <Td>{auction.highestBid ? auction.highestBid.bidAmount.toString() : 'N/A'} </Td>
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
          <Button colorScheme="blue" mt={4}>Bid on this Auction</Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  return (
    <Container maxW="5xl" py={10}>
      <Head>
        <title>Gravity Bridge Fee Auction App</title>
        <meta name="description" content="Gravity Bridge Fee Auction App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Image 
          height={"40px"}
          src="https://github.com/Gravity-Bridge/Gravity-Bridge/raw/main/gravity-bridge.svg"
          alt="Gravity Bridge Logo"
        />

        <Heading
          as="h1"
          fontSize={{ base: '3xl', md: '5xl' }}
          fontWeight="bold"
        >
          Fee Auction
        </Heading>

       
         
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
   

      <Flex justifyContent="space-between" alignItems="center">
        <Heading as="h2" size="lg">Auction Table</Heading>
        <Flex alignItems="center">
          <CircularProgress value={(timer / 30) * 100} color="blue.400">
            <CircularProgressLabel>{timer}</CircularProgressLabel>
          </CircularProgress>
          <Button onClick={fetchAuctions} bgColor="transparent" ml={3}>
            <Icon as={FaSyncAlt} />
          </Button>
        </Flex>
      </Flex>

      <Center mt={8} mb={16}>
      {renderAuctionModal()}
        {isLoading ? (
          <Spinner /> // Replace with your spinner component
        ) : (
          auctionData.length > 0 && renderAuctionTable()
        )}
      </Center>

   
 
    </Container>
  );
}
