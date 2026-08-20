export interface AssetType {
  id: number;
  name: string;
  symbol: string;
  balance: string;
  price: string;
  rawPrice: number;
  rawBalance: number;
  change24h: string;
  isPositive: boolean;
}

export const COIN_COLORS: Record<string, string> = {
  BTC: "#F7931A", ETH: "#627EEA", USDT: "#26A17B", BNB: "#F3BA2F",
  SOL: "#9945FF", XRP: "#00AAE4", ADA: "#0033AD", DOGE: "#C2A633",
  LINK: "#2A5ADA", DOT: "#E6007A", MATIC: "#8247E5", AVAX: "#E84142",
  UNI: "#FF007A", ATOM: "#2E3148", LTC: "#BFBBBB", SHIB: "#FFA409",
  TRX: "#EB0029", NEAR: "#00EC97", ICP: "#29ABE2", FIL: "#0090FF",
  ALGO: "#00B4D8", VET: "#15BDFF", XLM: "#7D00FF", MANA: "#FF2D55",
  SAND: "#04ADEF", AXS: "#0055D5", THETA: "#2AB8E6", EOS: "#4E4E4E",
  AAVE: "#B6509E", CRO: "#002D74", FTM: "#1969FF", GRT: "#6747ED",
  ENJ: "#7866D5", ZEC: "#ECB244", DASH: "#008CE7", XMR: "#F26822",
  WAVES: "#0155FF", IOTA: "#888888", KAVA: "#FF564F", ONE: "#00AEE9",
  HBAR: "#666666", CELO: "#FCFF52", STX: "#5546FF", ROSE: "#BB77AA",
  FLOW: "#00EF8B", EGLD: "#1A2A6C", KSM: "#E8026D", HNT: "#474DFF",
  CHZ: "#CC2640", BAT: "#FF5000", ZIL: "#29CCC4", QTUM: "#2895D8",
  OMG: "#4444AA", ICX: "#31B8BB", COMP: "#00D395",
};

export const ALL_ASSETS: AssetType[] = [
  { id: 1,  name: "Bitcoin",           symbol: "BTC",   balance: "2.4500",      price: "60,000.00",  rawPrice: 60000,     rawBalance: 2.45,      change24h: "+2.4%",  isPositive: true  },
  { id: 2,  name: "Ethereum",          symbol: "ETH",   balance: "18.5000",     price: "3,500.00",   rawPrice: 3500,      rawBalance: 18.5,      change24h: "-1.2%",  isPositive: false },
  { id: 3,  name: "Tether",            symbol: "USDT",  balance: "100,000.00",  price: "1.00",       rawPrice: 1,         rawBalance: 100000,    change24h: "0.0%",   isPositive: true  },
  { id: 4,  name: "BNB",               symbol: "BNB",   balance: "32.0000",     price: "580.00",     rawPrice: 580,       rawBalance: 32,        change24h: "+1.8%",  isPositive: true  },
  { id: 5,  name: "Solana",            symbol: "SOL",   balance: "150.0000",    price: "145.00",     rawPrice: 145,       rawBalance: 150,       change24h: "+5.6%",  isPositive: true  },
  { id: 6,  name: "XRP",               symbol: "XRP",   balance: "8,500.0000",  price: "0.52",       rawPrice: 0.52,      rawBalance: 8500,      change24h: "+0.9%",  isPositive: true  },
  { id: 7,  name: "Cardano",           symbol: "ADA",   balance: "12,000.000",  price: "0.38",       rawPrice: 0.38,      rawBalance: 12000,     change24h: "-2.1%",  isPositive: false },
  { id: 8,  name: "Dogecoin",          symbol: "DOGE",  balance: "45,000.000",  price: "0.12",       rawPrice: 0.12,      rawBalance: 45000,     change24h: "+3.7%",  isPositive: true  },
  { id: 9,  name: "Chainlink",         symbol: "LINK",  balance: "500.0000",    price: "18.50",      rawPrice: 18.5,      rawBalance: 500,       change24h: "-3.4%",  isPositive: false },
  { id: 10, name: "Polkadot",          symbol: "DOT",   balance: "1,200.000",   price: "7.20",       rawPrice: 7.2,       rawBalance: 1200,      change24h: "+1.1%",  isPositive: true  },
  { id: 11, name: "Polygon",           symbol: "MATIC", balance: "9,000.000",   price: "0.85",       rawPrice: 0.85,      rawBalance: 9000,      change24h: "+4.2%",  isPositive: true  },
  { id: 12, name: "Avalanche",         symbol: "AVAX",  balance: "88.0000",     price: "35.40",      rawPrice: 35.4,      rawBalance: 88,        change24h: "+2.9%",  isPositive: true  },
  { id: 13, name: "Uniswap",           symbol: "UNI",   balance: "320.0000",    price: "9.80",       rawPrice: 9.8,       rawBalance: 320,       change24h: "-0.8%",  isPositive: false },
  { id: 14, name: "Cosmos",            symbol: "ATOM",  balance: "410.0000",    price: "10.20",      rawPrice: 10.2,      rawBalance: 410,       change24h: "+1.5%",  isPositive: true  },
  { id: 15, name: "Litecoin",          symbol: "LTC",   balance: "22.0000",     price: "82.00",      rawPrice: 82,        rawBalance: 22,        change24h: "-1.9%",  isPositive: false },
  { id: 16, name: "Shiba Inu",         symbol: "SHIB",  balance: "500,000,000", price: "0.0000085",  rawPrice: 0.0000085, rawBalance: 500000000, change24h: "+6.4%",  isPositive: true  },
  { id: 17, name: "TRON",              symbol: "TRX",   balance: "25,000.000",  price: "0.11",       rawPrice: 0.11,      rawBalance: 25000,     change24h: "+0.3%",  isPositive: true  },
  { id: 18, name: "NEAR Protocol",     symbol: "NEAR",  balance: "750.0000",    price: "6.50",       rawPrice: 6.5,       rawBalance: 750,       change24h: "+3.1%",  isPositive: true  },
  { id: 19, name: "Internet Computer", symbol: "ICP",   balance: "190.0000",    price: "12.30",      rawPrice: 12.3,      rawBalance: 190,       change24h: "-2.5%",  isPositive: false },
  { id: 20, name: "Filecoin",          symbol: "FIL",   balance: "280.0000",    price: "5.90",       rawPrice: 5.9,       rawBalance: 280,       change24h: "+0.7%",  isPositive: true  },
  { id: 21, name: "Algorand",          symbol: "ALGO",  balance: "6,500.000",   price: "0.18",       rawPrice: 0.18,      rawBalance: 6500,       change24h: "-1.3%",  isPositive: false },
  { id: 22, name: "VeChain",           symbol: "VET",   balance: "80,000.000",  price: "0.028",      rawPrice: 0.028,     rawBalance: 80000,     change24h: "+2.2%",  isPositive: true  },
  { id: 23, name: "Stellar",           symbol: "XLM",   balance: "18,000.000",  price: "0.11",       rawPrice: 0.11,      rawBalance: 18000,     change24h: "+0.5%",  isPositive: true  },
  { id: 24, name: "Decentraland",      symbol: "MANA",  balance: "3,200.000",   price: "0.42",       rawPrice: 0.42,      rawBalance: 3200,      change24h: "-4.1%",  isPositive: false },
  { id: 25, name: "The Sandbox",       symbol: "SAND",  balance: "2,800.000",   price: "0.38",       rawPrice: 0.38,      rawBalance: 2800,      change24h: "+1.8%",  isPositive: true  },
  { id: 26, name: "Axie Infinity",     symbol: "AXS",   balance: "145.0000",    price: "8.20",       rawPrice: 8.2,       rawBalance: 145,       change24h: "-2.7%",  isPositive: false },
  { id: 27, name: "Theta Network",     symbol: "THETA", balance: "1,100.000",   price: "1.45",       rawPrice: 1.45,      rawBalance: 1100,      change24h: "+3.5%",  isPositive: true  },
  { id: 28, name: "EOS",               symbol: "EOS",   balance: "2,400.000",   price: "0.78",       rawPrice: 0.78,      rawBalance: 2400,      change24h: "-0.6%",  isPositive: false },
  { id: 29, name: "Aave",              symbol: "AAVE",  balance: "28.0000",     price: "95.00",      rawPrice: 95,        rawBalance: 28,        change24h: "+2.0%",  isPositive: true  },
  { id: 30, name: "Cronos",            symbol: "CRO",   balance: "15,000.000",  price: "0.092",      rawPrice: 0.092,     rawBalance: 15000,     change24h: "+1.2%",  isPositive: true  },
  { id: 31, name: "Fantom",            symbol: "FTM",   balance: "4,200.000",   price: "0.72",       rawPrice: 0.72,      rawBalance: 4200,      change24h: "+5.1%",  isPositive: true  },
  { id: 32, name: "The Graph",         symbol: "GRT",   balance: "8,800.000",   price: "0.19",       rawPrice: 0.19,      rawBalance: 8800,      change24h: "-1.0%",  isPositive: false },
  { id: 33, name: "Enjin Coin",        symbol: "ENJ",   balance: "3,500.000",   price: "0.29",       rawPrice: 0.29,      rawBalance: 3500,      change24h: "+0.4%",  isPositive: true  },
  { id: 34, name: "Zcash",             symbol: "ZEC",   balance: "42.0000",     price: "28.00",      rawPrice: 28,        rawBalance: 42,        change24h: "-3.2%",  isPositive: false },
  { id: 35, name: "Dash",              symbol: "DASH",  balance: "35.0000",     price: "30.50",      rawPrice: 30.5,      rawBalance: 35,        change24h: "+0.8%",  isPositive: true  },
  { id: 36, name: "Monero",            symbol: "XMR",   balance: "12.0000",     price: "165.00",     rawPrice: 165,       rawBalance: 12,        change24h: "+1.7%",  isPositive: true  },
  { id: 37, name: "Waves",             symbol: "WAVES", balance: "620.0000",    price: "2.40",       rawPrice: 2.4,       rawBalance: 620,       change24h: "-2.3%",  isPositive: false },
  { id: 38, name: "IOTA",              symbol: "IOTA",  balance: "5,500.000",   price: "0.22",       rawPrice: 0.22,      rawBalance: 5500,      change24h: "+0.2%",  isPositive: true  },
  { id: 39, name: "Kava",              symbol: "KAVA",  balance: "1,800.000",   price: "0.68",       rawPrice: 0.68,      rawBalance: 1800,      change24h: "+4.6%",  isPositive: true  },
  { id: 40, name: "Harmony",           symbol: "ONE",   balance: "22,000.000",  price: "0.015",      rawPrice: 0.015,     rawBalance: 22000,     change24h: "-1.8%",  isPositive: false },
  { id: 41, name: "Hedera",            symbol: "HBAR",  balance: "30,000.000",  price: "0.072",      rawPrice: 0.072,     rawBalance: 30000,     change24h: "+2.6%",  isPositive: true  },
  { id: 42, name: "Celo",              symbol: "CELO",  balance: "1,400.000",   price: "0.65",       rawPrice: 0.65,      rawBalance: 1400,      change24h: "-0.9%",  isPositive: false },
  { id: 43, name: "Stacks",            symbol: "STX",   balance: "2,100.000",   price: "1.80",       rawPrice: 1.8,       rawBalance: 2100,      change24h: "+3.3%",  isPositive: true  },
  { id: 44, name: "Oasis Network",     symbol: "ROSE",  balance: "9,000.000",   price: "0.085",      rawPrice: 0.085,     rawBalance: 9000,      change24h: "+1.4%",  isPositive: true  },
  { id: 45, name: "Flow",              symbol: "FLOW",  balance: "1,200.000",   price: "0.72",       rawPrice: 0.72,      rawBalance: 1200,      change24h: "-2.0%",  isPositive: false },
  { id: 46, name: "MultiversX",        symbol: "EGLD",  balance: "58.0000",     price: "38.00",      rawPrice: 38,        rawBalance: 58,        change24h: "+2.8%",  isPositive: true  },
  { id: 47, name: "Kusama",            symbol: "KSM",   balance: "24.0000",     price: "28.50",      rawPrice: 28.5,      rawBalance: 24,        change24h: "-1.5%",  isPositive: false },
  { id: 48, name: "Helium",            symbol: "HNT",   balance: "180.0000",    price: "6.80",       rawPrice: 6.8,       rawBalance: 180,       change24h: "+3.9%",  isPositive: true  },
  { id: 49, name: "Chiliz",            symbol: "CHZ",   balance: "6,200.000",   price: "0.072",      rawPrice: 0.072,     rawBalance: 6200,      change24h: "+5.8%",  isPositive: true  },
  { id: 50, name: "Basic Attention",   symbol: "BAT",   balance: "4,500.000",   price: "0.22",       rawPrice: 0.22,      rawBalance: 4500,      change24h: "-0.5%",  isPositive: false },
  { id: 51, name: "Zilliqa",           symbol: "ZIL",   balance: "42,000.000",  price: "0.018",      rawPrice: 0.018,     rawBalance: 42000,     change24h: "+1.0%",  isPositive: true  },
  { id: 52, name: "Qtum",              symbol: "QTUM",  balance: "380.0000",    price: "3.20",       rawPrice: 3.2,       rawBalance: 380,       change24h: "-2.8%",  isPositive: false },
  { id: 53, name: "OMG Network",       symbol: "OMG",   balance: "920.0000",    price: "0.55",       rawPrice: 0.55,      rawBalance: 920,       change24h: "+0.6%",  isPositive: true  },
  { id: 54, name: "ICON",              symbol: "ICX",   balance: "2,600.000",   price: "0.20",       rawPrice: 0.2,       rawBalance: 2600,      change24h: "-1.1%",  isPositive: false },
  { id: 55, name: "Compound",          symbol: "COMP",  balance: "18.0000",     price: "55.00",      rawPrice: 55,        rawBalance: 18,        change24h: "+2.2%",  isPositive: true  },
];
