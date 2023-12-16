import { MsgBidParams, createTxMsgBid, TxContext } from '@gravity-bridge/transactions'

export interface Fee {
    amount: string;
    denom: string;
    gas: string;
}

export interface Sender {
  accountAddress: string;
  sequence: number;
  accountNumber: number;
  pubkey: string;
}
export interface Chains {
    chainId: number;
    cosmosChainId: string;
}
  
export const createBidTransaction = (
    address: string, 
    auctionId: number, 
    bidAmount: number, 
    bidFee: number, 
    accountData: {
        base_account: {
            address: string;
            sequence: number;
            account_number: number;
            pub_key?: { key: string };
        }
    }
) => {
    if (!address || !accountData) {
        console.error('Address or account data is missing');
        return null;
    }
  
    const chain: Chains = {
        chainId: 417834,
        cosmosChainId: 'gravity-bridge-3',
    };
  
    const sender: Sender = {
        accountAddress: accountData?.base_account?.address,
        sequence: accountData?.base_account?.sequence,
        accountNumber: accountData?.base_account?.account_number,
        pubkey: accountData.base_account?.pub_key?.key || '',
    };
  
    const fee: Fee = {
        amount: '200000', // Adjust as required
        denom: 'ugraviton',
        gas: '200000',
    };
  
    const memo = ''; // Include any memo if needed
  
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

    return { tx, context };
};
