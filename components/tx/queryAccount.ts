import { useEffect, useState } from 'react';
import { generateEndpointAccount } from '@gravity-bridge/provider'

export function useQueryAccount(address: string | undefined) {
    const [accountData, setAccountData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!address) {
            setError('Address is undefined.');
            setLoading(false);
            return;
        }

        const nodeUrl = 'https://nodes.chandrastation.com/gravity/rpc/';
        const queryEndpoint = `${nodeUrl}${generateEndpointAccount(address)}`;

        const fetchData = async () => {
            try {
                const restOptions = {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                }
                // Note that the node will return a 400 status code if the account does not exist.
                const rawResult = await fetch(
                    queryEndpoint,
                    restOptions,
                )
                const result = await rawResult.json()
                if (!result.ok) {
                    throw new Error('Failed to fetch account data');
                }
                console.log(result)
                setAccountData(result.account);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [address]);
    
    return { accountData, loading, error };
};

