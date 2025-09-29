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
    gravity0x30f271C9E86D2B7d00a6376Cd96A1cFBD5F0b9b3: {
        name: 'Decenter',
        denom: 'gravity0x30f271C9E86D2B7d00a6376Cd96A1cFBD5F0b9b3',
        symbol: 'DEC',
        coinId: 'decenter',
        decimals: 18,
        logoURI: 'https://assets.coingecko.com/coins/images/12681/thumb/UST.png?1601612407',
        priceDenom: 'dec'
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
    gravity0xEa5A82B35244d9e5E48781F00b11B14E627D2951: {
        name: 'ATOM-ETH',
        denom: 'gravity0xEa5A82B35244d9e5E48781F00b11B14E627D2951',
        symbol: 'ATOM-ETH',
        coinId: 'atom-eth',
        decimals: 18,
        logoURI: '', // Add logo URL if available
        priceDenom: 'atom-eth'
    },
    gravity0xd2877702675e6cEb975b4A1dFf9fb7BAF4C91ea9: {
        name: 'WLUNC',
        denom: 'gravity0xd2877702675e6cEb975b4A1dFf9fb7BAF4C91ea9',
        symbol: 'WLUNC',
        coinId: 'wlunc',
        decimals: 18,
        logoURI: '', // Add logo URL if available
        priceDenom: 'wlunc'
    },
    gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006: {
        name: 'pSTAKE',
        denom: 'gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006',
        symbol: 'pSTAKE',
        coinId: 'persistence',
        decimals: 18,
        logoURI: '',
        priceDenom: 'upstake'
    },
    gravity0x45804880De22913dAFE09f4980848ECE6EcbAf78: {
        name: 'PAXG',
        denom: 'gravity0x45804880De22913dAFE09f4980848ECE6EcbAf78',
        symbol: 'PAXG',
        coinId: 'pax-gold',
        decimals: 18,
        logoURI: 'https://assets.coingecko.com/coins/images/9519/thumb/paxg.PNG?1568542565',
        priceDenom: 'paxg'
    },
    gravity0xc0a4Df35568F116C370E6a6A6022Ceb908eedDaC: {
        name: 'UMEE',
        denom: 'gravity0xc0a4Df35568F116C370E6a6A6022Ceb908eedDaC',
        symbol: 'UMEE',
        coinId: 'umee',
        decimals: 6,
        logoURI: 'https://assets.coingecko.com/coins/images/21092/thumb/umee.png?1638316975',
        priceDenom: 'umee'
    },
    gravity0x2B89bF8ba858cd2FCee1faDa378D5cd6936968Be: {
      name: 'WSCRT',
      denom: 'gravity0x2B89bF8ba858cd2FCee1faDa378D5cd6936968Be',
      symbol: 'WSCRT',
      coinId: 'secret',
      decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/11038/thumb/Secret.png?1587715047',
      priceDenom: 'wscrt'
    },
    gravity0x44017598f2AF1bD733F9D87b5017b4E7c1B28DDE: {
        name: 'stkATOM',
        denom: 'gravity0x44017598f2AF1bD733F9D87b5017b4E7c1B28DDE',
        symbol: 'stkATOM',
        coinId: 'staked-atom',
        decimals: 6,
        logoURI: '', 
        priceDenom: 'stkatom'
    },
    gravity0x817bbDbC3e8A1204f3691d14bB44992841e3dB35: {
        name: 'CUDOS',
        denom: 'gravity0x817bbDbC3e8A1204f3691d14bB44992841e3dB35',
        symbol: 'CUDOS',
        coinId: 'cudos',
        decimals: 18,
        logoURI: 'https://assets.coingecko.com/coins/images/13745/thumb/CudosIconTransparent.png?1611195012',
        priceDenom: 'cudos'
    },
    gravity0x467719aD09025FcC6cF6F8311755809d45a5E5f3: {
        name: 'AXL',
        denom: 'gravity0x467719aD09025FcC6cF6F8311755809d45a5E5f3',
        symbol: 'AXL',
        coinId: 'axelar',
        decimals: 6,
        logoURI: '', 
        priceDenom: 'axl'
    },
    gravity0x77E06c9eCCf2E797fd462A92B6D7642EF85b0A44: {
        name: 'WTAO',
        denom: 'gravity0x77E06c9eCCf2E797fd462A92B6D7642EF85b0A44',
        symbol: 'WTAO',
        coinId: 'wrapped-tao',
        decimals: 18,
        logoURI: '',
        priceDenom: 'wtao'
    },
    gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e: {
      name: 'PAGE',
      denom: 'gravity0x60e683C6514Edd5F758A55b6f393BeBBAfaA8d5e',
      symbol: 'PAGE',
      coinId: 'pages',
      decimals: 8,
      logoURI: '',
      priceDenom: 'page'
    },
    gravity0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b: {
      name: 'Cronos',
      denom: 'gravity0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b',
      symbol: 'CRO',
      coinId: 'crypto-com-chain',
      decimals: 8,
      logoURI: 'https://assets.coingecko.com/coins/images/7310/thumb/cypto.png?1547043960',
      priceDenom: 'cro'
    },
    gravity0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55: {
      name: 'Band',
      denom: 'gravity0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55',
      symbol: 'BAND',
      coinId: 'band-protocol',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/9545/thumb/band-protocol.png?1568730326',
      priceDenom: 'band'
    },
    gravity0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE: {
        name: 'SHIB',
        denom: 'gravity0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
        symbol: 'SHIB',
        coinId: 'shiba-inu',
        decimals: 18,
        logoURI: 'https://assets.coingecko.com/coins/images/11939/thumb/shiba.png?1622619446',
        priceDenom: 'shib'
    },
    gravity0x35a532d376FFd9a705d0Bb319532837337A398E7: {
        name: 'WDOGE',
        denom: 'gravity0x35a532d376FFd9a705d0Bb319532837337A398E7',
        symbol: 'WDOGE',
        coinId: 'wrapped-dogecoin',
        decimals: 8,
        logoURI: 'https://assets.coingecko.com/coins/images/13720/thumb/wrapped-dogecoin.png?1611469007',
        priceDenom: 'wdoge'
    },
    gravity0x92D6C1e31e14520e676a687F0a93788B716BEff5: {
        name: 'DYDX',
        denom: 'gravity0x92D6C1e31e14520e676a687F0a93788B716BEff5',
        symbol: 'DYDX',
        coinId: 'dydx',
        decimals: 18,
        logoURI: '',
        priceDenom: 'dydx'
    },
    gravity0x93581991f68DBaE1eA105233b67f7FA0D6BDeE7b: {
        name: 'WEVMOS',
        denom: 'gravity0x93581991f68DBaE1eA105233b67f7FA0D6BDeE7b',
        symbol: 'WEVMOS',
        coinId: 'wrapped-evmos',
        decimals: 18,
        logoURI: '', // Add logo URL if available
        priceDenom: 'wevmos'
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
    gravity0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0: {
      name: 'Matic Token',
      denom: 'gravity0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      symbol: 'MATIC',
      coinId: 'matic-network',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/4713/thumb/matic___polygon.jpg?1612939050',
      priceDenom: 'matic'
    },
    gravity0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30: {
        name: 'Injective',
        denom: 'gravity0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30',
        symbol: 'INJ',
        coinId: 'injective',
        decimals: 18,
        logoURI: 'https://assets.coingecko.com/coins/images/825/thumb/BNB.png?1547034615',
        priceDenom: 'inj'
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
    gravity0xF411903cbC70a74d22900a5DE66A2dda66507255: {
      name: 'Vera',
      denom: 'gravity0xF411903cbC70a74d22900a5DE66A2dda66507255',
      symbol: 'VERA',
      coinId: 'vera',
      decimals: 18,
      logoURI: '',
      priceDenom: 'vera'
    },
    gravity0x4123a133ae3c521FD134D7b13A2dEC35b56c2463: {
      name: 'Qredo',
      denom: 'gravity0x4123a133ae3c521FD134D7b13A2dEC35b56c2463',
      symbol: 'QRDO',
      coinId: 'qrdo',
      decimals: 8,
      logoURI: '',
      priceDenom: 'qrdo'
    },
    gravity0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD: {
      name: 'ETH 2x Flexible Leverage Index',
      denom: 'gravity0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD',
      symbol: 'ETH2x-FLI',
      coinId: 'ETH2x-FLI',
      decimals: 18,
      logoURI: '',
      priceDenom: 'ETH2x-FLI'
    },
    gravity0xd3d2E2692501A5c9Ca623199D38826e513033a17: {
      name: 'Uniswap V2',
      denom: 'gravity0xd3d2E2692501A5c9Ca623199D38826e513033a17',
      symbol: 'UNI-V2',
      coinId: 'uni-v2',
      decimals: 18,
      logoURI: '',
      priceDenom: 'uni-v2'
    },
    gravity0x83F20F44975D03b1b09e64809B757c47f942BEeA: {
      name: 'Savings Dai',
      denom: 'gravity0x83F20F44975D03b1b09e64809B757c47f942BEeA',
      symbol: 'sDAI',
      coinId: 'sdai',
      decimals: 18,
      logoURI: '',
      priceDenom: 'sdai'
    },
    gravity0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85: {
      name: 'Fetch Token',
      denom: 'gravity0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
      symbol: 'FET',
      coinId: 'fet',
      decimals: 18,
      logoURI: '',
      priceDenom: 'fet'
    },
    'ibc/3DA3455A6E8EBE1C7EF5C83FDED825B94C13A9303A7FA54C098F13A091B00CE1': {
      name: 'AQLA Token',
      denom: '3DA3455A6E8EBE1C7EF5C83FDED825B94C13A9303A7FA54C098F13A091B00CE1',
      symbol: 'AQLA',
      coinId: 'aqla',
      decimals: 6,
      logoURI: '',
      priceDenom: 'aqla'
    },
    'ibc/97275C664907DF6ADEA732934510F64D0B4EB89886E4DC912AA27A24025E78CD': {
      name: 'Neutaro',
      denom: 'ibc/97275C664907DF6ADEA732934510F64D0B4EB89886E4DC912AA27A24025E78CD',
      symbol: 'NEUTARO',
      coinId: 'neautaro',
      decimals: 6,
      logoURI: '',
      priceDenom: 'neautaro'
    },
    'ibc/6BEE6DBC35E5CCB3C8ADA943CF446735E6A3D48B174FEE027FAB3410EDE6319C': {
        name: 'Kujira',
        denom: 'ibc/6BEE6DBC35E5CCB3C8ADA943CF446735E6A3D48B174FEE027FAB3410EDE6319C',
        symbol: 'KUJI',
        coinId: 'kujira',
        decimals: 6,
        logoURI: '',
        priceDenom: 'ukuji'
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
    'ibc/8A9D880B05E818FDB1BD2DCAA36FB48D51F4DE0F453DA22D7AD5A96E15185A53': {
      name: 'Ixo',
      denom: 'ibc/8A9D880B05E818FDB1BD2DCAA36FB48D51F4DE0F453DA22D7AD5A96E15185A53',
      symbol: 'IXO',
      coinId: 'ixo',
      decimals: 6,
      logoURI: '',
      priceDenom: 'uixo'
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
    'ibc/00F2B62EB069321A454B708876476AFCD9C23C8C9C4A5A206DDF1CD96B645057': {
      name: 'Mantle',
      denom: 'ibc/00F2B62EB069321A454B708876476AFCD9C23C8C9C4A5A206DDF1CD96B645057',
      symbol: 'MNTLE',
      coinId: 'mantle',
      decimals: 6,
      logoURI: '',
      priceDenom: 'umntle'
    },
    'ibc/E05A4DAEA5681A09067DC213F32464639D18007215C87964EC45FF876B5EE82B': {
        name: 'Archway',
        denom: 'ibc/E05A4DAEA5681A09067DC213F32464639D18007215C87964EC45FF876B5EE82B',
        symbol: 'ARCH',
        coinId: 'arch',
        decimals: 18,
        logoURI: '',
        priceDenom: 'aarch'
    },
    'ibc/0EB6D5E44D1587D12E222C1155181884098202F56263795259C53536D07C2E65': {
      name: 'Meme',
      denom: 'ibc/0EB6D5E44D1587D12E222C1155181884098202F56263795259C53536D07C2E65',
      symbol: 'MEME',
      coinId: 'memetic',
      decimals: 6,
      logoURI: '',
      priceDenom: 'umeme'
    },
    'ibc/D157AD8A50DAB0FC4EB95BBE1D9407A590FA2CDEE04C90A76C005089BF76E519': {
      name: 'Unification',
      denom: 'ibc/D157AD8A50DAB0FC4EB95BBE1D9407A590FA2CDEE04C90A76C005089BF76E519',
      symbol: 'FUND',
      coinId: 'unification',
      decimals: 9,
      logoURI: '',
      priceDenom: 'nund'
    },
    "ibc/AD355DD10DF3C25CD42B5812F34077A1235DF343ED49A633B4E76AE98F3B78BC": {
      name: 'USK',
      denom: 'ibc/AD355DD10DF3C25CD42B5812F34077A1235DF343ED49A633B4E76AE98F3B78BC',
      symbol: 'USK',
      coinId: 'usk',
      decimals: 6,
      logoURI: '',
      priceDenom: 'usk'
    },
    "ibc/5B7B34C07642FAEAC81C04C488D5D622D7900600A9B37426EB0FA0B4D30AA9CE": {
      name: 'ALTHEA',
      denom: 'ibc/5B7B34C07642FAEAC81C04C488D5D622D7900600A9B37426EB0FA0B4D30AA9CE',
      symbol: 'ALTHEA',
      coinId: 'althea',
      decimals: 18,
      logoURI: '',
      priceDenom: 'aalthea'
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