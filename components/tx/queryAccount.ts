import { useEffect, useState } from 'react';

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
        const queryEndpoint = `${nodeUrl}cosmos/auth/v1beta1/accounts/${address}`;

        const fetchData = async () => {
            try {
                const response = await fetch(queryEndpoint, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch account data');
                }

                const result = await response.json();
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

