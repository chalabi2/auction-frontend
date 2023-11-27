import BigNumber from "bignumber.js";

export const chainDenoms: ChainDenominations = {
    gravity0x6B175474E89094C44Da98b954EedeAC495271d0F: {
      name: 'Dai',
      denom: 'gravity0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      coinId: 'dai',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/9956/thumb/4943.png?1636636734',
      priceDenom: 'dai'
    },
    gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2: {
      name: 'Wrapped ETH',
      denom: 'gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'WETH',
      coinId: 'weth',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1628852295',
      priceDenom: 'weth'
    },
    gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48: {
      name: 'USD Coin',
      denom: 'gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      coinId: 'usd-coin',
      decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389',
      priceDenom: 'usdc'
    },
    gravity0xdAC17F958D2ee523a2206206994597C13D831ec7: {
      name: 'Tether',
      denom: 'gravity0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      coinId: 'tether',
      decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png?1598003707',
      priceDenom: 'tether'
    },
    gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599: {
      name: 'Wrapped Bitcoin',
      denom: 'gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      symbol: 'WBTC',
      coinId: 'wrapped-bitcoin',
      decimals: 8,
      logoURI: 'https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png?1548822744',
      priceDenom: 'wrapped-bitcoin'
    },
    gravity0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0: {
      name: 'Wrapped liquid staked Ether 2.0',
      denom: 'gravity0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
      symbol: 'wstETH',
      coinId: 'wsteth',
      decimals: 18,
      logoURI: '',
      priceDenom: 'wsteth'
    },
    'ibc/2E5D0AC026AC1AFA65A23023BA4F24BB8DDF94F118EDC0BAD6F625BFC557CDED': {
      name: 'Atom',
      denom: 'ibc/2E5D0AC026AC1AFA65A23023BA4F24BB8DDF94F118EDC0BAD6F625BFC557CDED',
      symbol: 'ATOM',
      coinId: 'cosmos',
      decimals: 6,
      logoURI: 'https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/coin_image/tokens/token-cosmos.svg',
      priceDenom: 'uatom'
    },
    'ibc/4F393C3FCA4190C0A6756CE7F6D897D5D1BE57D6CCB80D0BC87393566A7B6602': {
      name: 'Stargaze STARS',
      denom: 'ibc/4F393C3FCA4190C0A6756CE7F6D897D5D1BE57D6CCB80D0BC87393566A7B6602',
      symbol: 'STARS',
      coinId: 'stargaze',
      decimals: 6,
      logoURI: 'https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/coin_image/tokens/token-stargaze.svg',
      priceDenom: 'ustars'
    },
    'ibc/5012B1C96F286E8A6604A87037CE51241C6F1CA195B71D1E261FCACB69FB6BC2': {
      name: 'CHEQ',
      denom: 'ibc/5012B1C96F286E8A6604A87037CE51241C6F1CA195B71D1E261FCACB69FB6BC2',
      symbol: 'CHEQ',
      coinId: 'cheqd-network',
      decimals: 9,
      logoURI: '',
      priceDenom: 'ncheq'
    },
    'ibc/048BE20AE2E6BFD4142C547E04F17E5F94363003A12B7B6C084E08101BFCF7D1': {
      name: 'Chihuahua',
      denom: 'ibc/048BE20AE2E6BFD4142C547E04F17E5F94363003A12B7B6C084E08101BFCF7D1',
      symbol: 'HUAHUA',
      coinId: 'chihuahua-token',
      decimals: 6,
      logoURI: '',
      priceDenom: 'uhuahua'
    },
    'ibc/0C273962C274B2C05B22D9474BFE5B84D6A6FCAD198CB9B0ACD35EA521A36606': {
      name: 'NYM',
      denom: 'ibc/0C273962C274B2C05B22D9474BFE5B84D6A6FCAD198CB9B0ACD35EA521A36606',
      symbol: 'NYM',
      coinId: 'nym',
      decimals: 6,
      logoURI: '',
      priceDenom: 'unym'
    },
    'ibc/6B207CDA2448604B83A0674AADD830C490C1AAB7D568135E52589E96A00B6EEF': {
      name: 'Evmos',
      denom: 'ibc/6B207CDA2448604B83A0674AADD830C490C1AAB7D568135E52589E96A00B6EEF',
      symbol: 'EVMOS',
      coinId: 'evmos',
      decimals: 18,
      logoURI: '',
      priceDenom: 'aevmos'
    },
    'ibc/64BBBEB97DA04B6CF7A29A5454E43E101B29F506C117E800E128E0B32BA3FE3D': {
      name: 'Canto',
      denom: 'ibc/64BBBEB97DA04B6CF7A29A5454E43E101B29F506C117E800E128E0B32BA3FE3D',
      symbol: 'CANTO',
      coinId: 'canto',
      decimals: 18,
      logoURI: '',
      priceDenom: 'acanto'
    },
    'ibc/D157AD8A50DAB0FC4EB95BBE1D9407A590FA2CDEE04C90A76C005089BF76E519': {
      name: 'Unification',
      denom: 'ibc/D157AD8A50DAB0FC4EB95BBE1D9407A590FA2CDEE04C90A76C005089BF76E519',
      symbol: 'FUND',
      coinId: 'unification',
      decimals: 9,
      logoURI: '',
      priceDenom: 'nund'
    }
  };
  
  interface Denomination {
    name: string;
    denom: string;
    symbol: string;
    coinId: string;
    decimals: number;
    logoURI: string;
    priceDenom: string;
  }

  interface ChainDenominations {
    [key: string]: Denomination;
  }

  export function getDenominationInfo(denom: string): Denomination {
    return chainDenoms[denom] || { name: 'Unknown', symbol: 'Unknown', denom: '', coinId: '', decimals: 0, logoURI: '', priceDenom: '' };
  }
  

 export  function formatTokenAmount(amount: string, denom: string): string {
    const denominationInfo = getDenominationInfo(denom);
    const decimals = denominationInfo.decimals;
    const formattedAmount = new BigNumber(amount).dividedBy(new BigNumber(10).pow(decimals));
    return formattedAmount.toFixed(); // Adjust toFixed() as needed
  }