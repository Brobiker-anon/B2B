"use client";

import { useState, useEffect } from "react";
import { Search, Star, ChevronDown } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";

interface MarketAsset {
  id: string;
  name: string;
  type: string;
  symbol: string;
  basePriceAud: number;
  iconColor: string;
  initial: string;
}

const MARKET_ASSETS: MarketAsset[] = [
  // Mockup list expanded to over 50 popular assets (26 Crypto, 26 Stocks)
  { id: "BTC", name: "Bitcoin", type: "Crypto", symbol: "BTC", basePriceAud: 90853.9442, iconColor: "#F7931A", initial: "₿" },
  { id: "AAPL", name: "Apple", type: "Stocks", symbol: "AAPL", basePriceAud: 450.5174, iconColor: "#FFFFFF", initial: "" },
  { id: "ETH", name: "Ethereum", type: "Crypto", symbol: "ETH", basePriceAud: 5210.1245, iconColor: "#627EEA", initial: "Ξ" },
  { id: "MSFT", name: "Microsoft", type: "Stocks", symbol: "MSFT", basePriceAud: 642.5028, iconColor: "#F25022", initial: "M" },
  { id: "SOL", name: "Solana", type: "Crypto", symbol: "SOL", basePriceAud: 215.4296, iconColor: "#14F195", initial: "S" },
  { id: "NVDA", name: "NVIDIA", type: "Stocks", symbol: "NVDA", basePriceAud: 190.4562, iconColor: "#76B900", initial: "N" },
  { id: "BNB", name: "BNB", type: "Crypto", symbol: "BNB", basePriceAud: 860.2084, iconColor: "#F3BA2F", initial: "B" },
  { id: "AMZN", name: "Amazon", type: "Stocks", symbol: "AMZN", basePriceAud: 290.8032, iconColor: "#FF9900", initial: "A" },
  { id: "XRP", name: "Ripple", type: "Crypto", symbol: "XRP", basePriceAud: 0.8845, iconColor: "#23292F", initial: "✕" },
  { id: "GOOGL", name: "Alphabet (Google)", type: "Stocks", symbol: "GOOGL", basePriceAud: 260.2546, iconColor: "#4285F4", initial: "G" },
  { id: "ADA", name: "Cardano", type: "Crypto", symbol: "ADA", basePriceAud: 0.5823, iconColor: "#0033AD", initial: "₳" },
  { id: "META", name: "Meta Platforms", type: "Stocks", symbol: "META", basePriceAud: 742.1065, iconColor: "#0668E1", initial: "M" },
  { id: "DOGE", name: "Dogecoin", type: "Crypto", symbol: "DOGE", basePriceAud: 0.2241, iconColor: "#C2A633", initial: "Ð" },
  { id: "TSLA", name: "Tesla", type: "Stocks", symbol: "TSLA", basePriceAud: 370.5015, iconColor: "#CC0000", initial: "T" },
  { id: "AAVE", name: "AAVE", type: "Crypto", symbol: "AAVE", basePriceAud: 135.0965, iconColor: "#B6509E", initial: "A" },
  { id: "ABT", name: "Abbot Labs", type: "Stocks", symbol: "ABT", basePriceAud: 137.7713, iconColor: "#008A4B", initial: "AB" },
  { id: "ADBE", name: "Adobe", type: "Stocks", symbol: "ADBE", basePriceAud: 714.2227, iconColor: "#FF0000", initial: "AD" },
  { id: "ADI", name: "Analog Devices", type: "Stocks", symbol: "ADI", basePriceAud: 260.3196, iconColor: "#FFC20E", initial: "ADI" },
  { id: "AEMD", name: "Aethlon Medical", type: "Stocks", symbol: "AEMD", basePriceAud: 1.1252, iconColor: "#8B5CF6", initial: "AE" },
  { id: "AIG", name: "American International Group", type: "Stocks", symbol: "AIG", basePriceAud: 116.3281, iconColor: "#00A3E0", initial: "AI" },
  { id: "ALGO", name: "Algorand", type: "Crypto", symbol: "ALGO", basePriceAud: 0.2476, iconColor: "#10B981", initial: "AL" },
  { id: "AMC", name: "AMC Holdings", type: "Stocks", symbol: "AMC", basePriceAud: 7.5138, iconColor: "#EF4444", initial: "AM" },
  { id: "AMD", name: "AMD", type: "Stocks", symbol: "AMD", basePriceAud: 266.4763, iconColor: "#3B82F6", initial: "AM" },
  { id: "AMT", name: "American Tower", type: "Stocks", symbol: "AMT", basePriceAud: 283.4413, iconColor: "#EC4899", initial: "AM" },
  { id: "DOT", name: "Polkadot", type: "Crypto", symbol: "DOT", basePriceAud: 9.2045, iconColor: "#E6007A", initial: "P" },
  { id: "JPM", name: "JPMorgan Chase", type: "Stocks", symbol: "JPM", basePriceAud: 295.3045, iconColor: "#1F51B6", initial: "J" },
  { id: "MATIC", name: "Polygon", type: "Crypto", symbol: "MATIC", basePriceAud: 0.9562, iconColor: "#8247E5", initial: "P" },
  { id: "V", name: "Visa", type: "Stocks", symbol: "V", basePriceAud: 410.8034, iconColor: "#1A1F71", initial: "V" },
  { id: "LINK", name: "Chainlink", type: "Crypto", symbol: "LINK", basePriceAud: 22.8051, iconColor: "#375BD2", initial: "C" },
  { id: "WMT", name: "Walmart", type: "Stocks", symbol: "WMT", basePriceAud: 102.1584, iconColor: "#0071DC", initial: "W" },
  { id: "TRX", name: "TRON", type: "Crypto", symbol: "TRX", basePriceAud: 0.1865, iconColor: "#EF0000", initial: "T" },
  { id: "NFLX", name: "Netflix", type: "Stocks", symbol: "NFLX", basePriceAud: 980.4025, iconColor: "#E50914", initial: "N" },
  { id: "LTC", name: "Litecoin", type: "Crypto", symbol: "LTC", basePriceAud: 122.4061, iconColor: "#345D9D", initial: "Ł" },
  { id: "DIS", name: "Walt Disney", type: "Stocks", symbol: "DIS", basePriceAud: 152.6084, iconColor: "#003087", initial: "D" },
  { id: "SHIB", name: "Shiba Inu", type: "Crypto", symbol: "SHIB", basePriceAud: 0.0000325, iconColor: "#FFA500", initial: "S" },
  { id: "KO", name: "Coca-Cola", type: "Stocks", symbol: "KO", basePriceAud: 92.4065, iconColor: "#F40009", initial: "K" },
  { id: "AVAX", name: "Avalanche", type: "Crypto", symbol: "AVAX", basePriceAud: 48.5042, iconColor: "#E84142", initial: "A" },
  { id: "PEP", name: "PepsiCo", type: "Stocks", symbol: "PEP", basePriceAud: 250.8032, iconColor: "#004B87", initial: "P" },
  { id: "TON", name: "Toncoin", type: "Crypto", symbol: "TON", basePriceAud: 11.2065, iconColor: "#0088CC", initial: "T" },
  { id: "COST", name: "Costco", type: "Stocks", symbol: "COST", basePriceAud: 1220.1042, iconColor: "#005EA6", initial: "C" },
  { id: "NEAR", name: "NEAR Protocol", type: "Crypto", symbol: "NEAR", basePriceAud: 8.8042, iconColor: "#000000", initial: "N" },
  { id: "NKE", name: "Nike", type: "Stocks", symbol: "NKE", basePriceAud: 142.3045, iconColor: "#111111", initial: "N" },
  { id: "XLM", name: "Stellar", type: "Crypto", symbol: "XLM", basePriceAud: 0.1862, iconColor: "#000000", initial: "S" },
  { id: "ORCL", name: "Oracle", type: "Stocks", symbol: "ORCL", basePriceAud: 210.5032, iconColor: "#F80000", initial: "O" },
  { id: "ATOM", name: "Cosmos", type: "Crypto", symbol: "ATOM", basePriceAud: 12.5065, iconColor: "#2E3192", initial: "C" },
  { id: "CRM", name: "Salesforce", type: "Stocks", symbol: "CRM", basePriceAud: 410.2084, iconColor: "#00A1E0", initial: "S" },
  { id: "UNI", name: "Uniswap", type: "Crypto", symbol: "UNI", basePriceAud: 11.8032, iconColor: "#FF007A", initial: "U" },
  { id: "CSCO", name: "Cisco Systems", type: "Stocks", symbol: "CSCO", basePriceAud: 75.6042, iconColor: "#049FD9", initial: "C" },
  { id: "ETC", name: "Ethereum Classic", type: "Crypto", symbol: "ETC", basePriceAud: 42.5025, iconColor: "#32B97D", initial: "E" },
  { id: "CVX", name: "Chevron", type: "Stocks", symbol: "CVX", basePriceAud: 232.4061, iconColor: "#005691", initial: "C" },
  { id: "FIL", name: "Filecoin", type: "Crypto", symbol: "FIL", basePriceAud: 8.6015, iconColor: "#00C3FF", initial: "F" },
  { id: "XOM", name: "ExxonMobil", type: "Stocks", symbol: "XOM", basePriceAud: 172.5024, iconColor: "#ED1C24", initial: "X" }
];

export default function Markets() {
  const router = useRouter();
  const { btcBalance } = useApp();
  
  // Real-time ticking price simulator (AUD)
  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    MARKET_ASSETS.forEach(asset => {
      initial[asset.id] = asset.basePriceAud;
    });
    return initial;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        MARKET_ASSETS.forEach(asset => {
          const multiplier = asset.symbol === "SHIB" ? 0.002 : 0.0004;
          const change = (Math.random() - 0.5) * (asset.basePriceAud * multiplier);
          const precision = asset.symbol === "SHIB" ? 7 : 4;
          next[asset.id] = +(prev[asset.id] + change).toFixed(precision);
        });
        return next;
      });
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All assets");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(["BTC", "AAPL"]);

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(f => f !== id));
    } else {
      setFavorites(prev => [...prev, id]);
    }
  };

  const handleTrade = (symbol: string) => {
    router.push(`/trade?asset=${symbol}`);
  };

  const getWalletDisplay = (symbol: string) => {
    if (symbol === "BTC") {
      return `${btcBalance.toFixed(4)} BTC`;
    }
    return `0.00 ${symbol}`;
  };

  // Filtering Logic
  const filteredAssets = MARKET_ASSETS.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (selectedType === "All assets") {
      return matchesSearch;
    }
    if (selectedType === "Favorites") {
      return matchesSearch && favorites.includes(asset.id);
    }
    return matchesSearch && asset.type === selectedType;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-100 min-h-[85vh]">
      
      {/* Top Filter and Search Bar row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Markets</h1>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for assets" 
              className="w-full sm:w-64 bg-black/35 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#089981] text-white transition-colors"
            />
          </div>

          {/* Asset Type Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="flex items-center justify-between gap-2 bg-black/35 border border-white/10 rounded-lg px-4 py-2 text-xs font-bold text-slate-200 cursor-pointer min-w-[120px] select-none hover:bg-white/5 transition-colors"
            >
              <span>{selectedType}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {showTypeDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-[#12161a] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden text-xs">
                {(["All assets", "Crypto", "Stocks", "Favorites"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedType(t);
                      setShowTypeDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 transition-colors hover:bg-white/5 ${
                      selectedType === t ? "text-[#089981] font-bold bg-white/5" : "text-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Markets List Table Panel */}
      <GlassCard className="overflow-hidden p-0 bg-[#0c0f16] border border-white/5">
        <div className="overflow-x-auto max-h-[650px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0c0f16] z-10">
              <tr className="border-b border-white/5 text-muted-foreground font-bold text-[11px] uppercase tracking-wider">
                <th className="px-6 py-4 w-12 text-center"></th>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Current price (AUD)</th>
                <th className="px-6 py-4 text-right">In your wallet</th>
                <th className="px-6 py-4 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-xs text-muted-foreground">
                    No assets found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const isFav = favorites.includes(asset.id);
                  const displayPrice = prices[asset.id] || asset.basePriceAud;
                  const precision = asset.symbol === "SHIB" ? 7 : 4;
                  return (
                    <tr 
                      key={asset.id} 
                      className="border-b border-white/5 hover:bg-white/5 transition-colors font-medium text-xs align-middle"
                    >
                      {/* Favorite Toggle Star */}
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => toggleFavorite(asset.id)}
                          className="focus:outline-none cursor-pointer group"
                        >
                          <Star 
                            className={`w-4 h-4 transition-colors ${
                              isFav 
                                ? "text-yellow-500 fill-yellow-500" 
                                : "text-muted-foreground/60 hover:text-yellow-500"
                            }`} 
                          />
                        </button>
                      </td>

                      {/* Icon + Asset Name + Symbol */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm select-none"
                            style={{ 
                              backgroundColor: asset.iconColor + "15", 
                              border: `1.5px solid ${asset.iconColor}45`,
                              color: asset.iconColor === "#FFFFFF" ? "#E2E8F0" : asset.iconColor 
                            }}
                          >
                            {asset.initial}
                          </div>
                          <div>
                            <span className="font-bold text-white text-xs block leading-tight">{asset.name}</span>
                            <span className="text-[10px] text-muted-foreground block">{asset.symbol}</span>
                          </div>
                        </div>
                      </td>

                      {/* Type Column */}
                      <td className="px-6 py-4 text-muted-foreground">
                        {asset.type}
                      </td>

                      {/* Price in AUD Column */}
                      <td className="px-6 py-4 text-right font-mono font-bold text-white">
                        A${displayPrice.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })}/{asset.symbol}
                      </td>

                      {/* Wallet Balance Column */}
                      <td className="px-6 py-4 text-right text-slate-300 font-mono">
                        {getWalletDisplay(asset.symbol)}
                      </td>

                      {/* Trade Button Column */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleTrade(asset.symbol)}
                          className="px-4 py-1.5 bg-[#1e222d] border border-white/5 hover:bg-[#2a2e39] hover:border-white/10 text-slate-200 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

    </div>
  );
}
