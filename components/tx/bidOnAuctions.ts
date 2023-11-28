import { MsgBidParams, createTxMsgBid} from '@gravity-bridge/gravityjs/packages/transactions/dist/messages/auction/bid'
import { TxContext } from '@gravity-bridge/transactions'
import { Chain, Fee, Sender } from '@gravity-bridge/transactions/dist/messages/common';
import { useQueryAccount } from './queryAccount';
  
export const createBidTransaction = (address: any, auctionId: { toString: () => any; }, bidAmount: { toString: () => any; }, bidFee: { toString: () => any; }, accountData: { base_account: { address: any; sequence: any; account_number: any; pub_key: { key: any; }; }; }) => {
    if (!address || !accountData) {
      console.error('Address or account data is missing');
      return null;
    }
  
    if (!address || !accountData) {
      console.error('Address or account data is missing');
      return null;
    }
  
    const chain: Chain = {
      chainId: 417834,
      cosmosChainId: 'gravity-bridge-3',
    };
  
    const sender: Sender = {
      accountAddress: accountData.base_account.address,
      sequence: accountData.base_account.sequence,
      accountNumber: accountData.base_account.account_number,
      pubkey: accountData.base_account.pub_key?.key, // Adjust based on actual data structure
    };
  
    const fee: Fee = {
      amount: '200000', // This should be adjusted based on actual requirements
      denom: 'ugraviton',
      gas: '200000',
    };
  
    const memo = ''; // Any memo you want to include
  
    const context: TxContext = {
      chain,
      sender,
      fee,
      memo,
    };
  
    const params: MsgBidParams = {
      auction_id: auctionId.toString(),
      amount: bidAmount.toString(),
      bid_fee: bidFee.toString(),
    };
  
    const tx = createTxMsgBid(context, params);

    return {tx, context}
  };
  