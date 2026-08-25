"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { 
  Eye, 
  EyeOff, 
  Search, 
  ChevronDown,
  MessageSquare,
  Wallet
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { ALL_ASSETS, COIN_COLORS } from "@/data/assets";

interface AssetRow {
  symbol: string;
  name: string;
  type: "Crypto" | "Stocks";
  priceStr: string;
  rawPrice: number;
  balanceStr: string;
  rawBalance: number;
  valStr: string;
  logo: string;
  color: string;
}

export default function Assets() {
  const { user, usdtBalance, btcBalance, addToast } = useApp();
  const router = useRouter();
  
  const [showBalance, setShowBalance] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const isMasterUser = user?.username?.toLowerCase() === "jjj";
  const btcPriceAud = 90395.73;
  const btcValAud = btcBalance * btcPriceAud;
  
  // Calculate total balance from all assets with balances
  const initialAssetsAudValue = ALL_ASSETS.reduce((sum, asset) => {
    let bal = isMasterUser ? asset.rawBalance : 0;
    if (asset.symbol === "BTC") bal = btcBalance;
    if (asset.symbol === "USDT") bal = usdtBalance;
    return sum + (bal * asset.rawPrice * 1.50);
  }, 0);

  const totalBalanceAud = initialAssetsAudValue;
  const cryptoPct = totalBalanceAud > 0 ? (btcValAud / totalBalanceAud) * 100 : 100;

  const activities = [
    { text: "You made a profit of 0.004 BTC", date: "06/06/2026" },
    { text: "You made a profit of 0.009 BTC", date: "06/06/2026" },
    { text: "You made a profit of 0.003 BTC", date: "02/06/2026" },
    { text: "You made a profit of 0.008 BTC", date: "25/05/2026" },
    { text: "You made a profit of 0.005 BTC", date: "23/05/2026" }
  ];

  // Map ALL_ASSETS to row formats
  const mappedCryptos: AssetRow[] = ALL_ASSETS.map((asset) => {
    let bal = isMasterUser ? asset.rawBalance : 0;
    if (asset.symbol === "BTC") bal = btcBalance;
    if (asset.symbol === "USDT") bal = usdtBalance;
    
    const audVal = bal * asset.rawPrice * 1.50;

    // Price formatting matching screenshot style
    let priceStr = `$${asset.rawPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}/${asset.symbol}`;
    if (asset.rawPrice >= 1000) {
      priceStr = `$${(asset.rawPrice / 1000).toFixed(3)}K/${asset.symbol}`;
    }

    // Wallet display matching screenshot
    let valStr = `A$${audVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (audVal >= 1000) {
      valStr = `A$${(audVal / 1000).toFixed(3)}K`;
    }

    let logo = asset.symbol[0];
    if (asset.symbol === "BTC") logo = "₿";
    if (asset.symbol === "ETH") logo = "Ξ";
    if (asset.symbol === "USDT") logo = "₮";

    return {
      symbol: asset.symbol,
      name: asset.name,
      type: "Crypto",
      priceStr,
      rawPrice: asset.rawPrice,
      balanceStr: `${bal.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${asset.symbol}`,
      rawBalance: bal,
      valStr,
      logo,
      color: COIN_COLORS[asset.symbol] || "#888888"
    };
  });

  // Apple AAPL Stock definition to match screenshot row 2
  const appleStock: AssetRow = {
    symbol: "AAPL",
    name: "Apple",
    type: "Stocks",
    priceStr: "$308.43/AAPL",
    rawPrice: 308.43,
    balanceStr: "0.00 AAPL",
    rawBalance: 0,
    valStr: "A$0.00",
    logo: "",
    color: "#ffffff"
  };

  // Construct consolidated lists: BTC first, AAPL second, AAVE third, then the rest.
  const btcRow = mappedCryptos.find((a) => a.symbol === "BTC");
  const aaveRow = mappedCryptos.find((a) => a.symbol === "AAVE");
  const otherCryptos = mappedCryptos.filter((a) => a.symbol !== "BTC" && a.symbol !== "AAVE");

  const combinedAssetsList: AssetRow[] = [];
  if (btcRow) combinedAssetsList.push(btcRow);
  combinedAssetsList.push(appleStock);
  if (aaveRow) combinedAssetsList.push(aaveRow);
  combinedAssetsList.push(...otherCryptos);

  // Filter list by search query and type filter dropdown
  const filteredAssets = combinedAssetsList.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || 
                        (typeFilter === "Crypto" && asset.type === "Crypto") ||
                        (typeFilter === "Stocks" && asset.type === "Stocks");
    return matchesSearch && matchesType;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-8 text-slate-100 min-h-[85vh] relative pb-16"
    >
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#38bdf8]" />
          <h1 className="text-xl font-bold text-white tracking-tight">Assets</h1>
        </div>
      </div>

      {/* Top Grid: Balance display & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Total Balance Card */}
        <GlassCard className="p-6 bg-black/20 border-white/5 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Total Balance</span>
              <button 
                onClick={() => setShowBalance(!showBalance)} 
                className="text-muted-foreground hover:text-white transition-colors cursor-pointer"
              >
                {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-3xl font-extrabold text-white">
              {showBalance 
                ? `A$${totalBalanceAud.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                : "A$•••••••"
              }
            </div>
          </div>

          <div className="space-y-4">
            {/* Split Progress Bar */}
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-[#0ea5e9] transition-all duration-500" 
                style={{ width: `${cryptoPct}%` }}
              ></div>
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${100 - cryptoPct}%` }}
              ></div>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></div>
                <span className="text-white font-bold">Crypto</span>
                <span className="text-muted-foreground font-mono">{cryptoPct.toFixed(0)}%</span>
              </div>
              {100 - cryptoPct > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-white font-bold">Fiat</span>
                  <span className="text-muted-foreground font-mono">{(100 - cryptoPct).toFixed(0)}%</span>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Recent Activity Card */}
        <GlassCard className="p-6 bg-black/20 border-white/5 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Activity</h2>
          
          <div className="space-y-3 font-medium text-xs">
            {activities.map((act, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                <span className="text-white font-semibold">{act.text}</span>
                <span className="text-muted-foreground/80 font-mono">{act.date}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Middle Drag/Separator dots grid icon */}
      <div className="flex justify-center text-white/20 select-none py-2">
        <span className="text-xl tracking-widest font-mono">:::</span>
      </div>

      {/* Bottom Section: All your assets */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h2 className="text-base font-bold text-white tracking-tight">All your assets</h2>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for assets"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/25 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#0ea5e9] w-full text-white transition-colors"
              />
            </div>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-black/25 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-[#0ea5e9] appearance-none pr-8 cursor-pointer font-semibold"
              >
                <option value="All">All assets</option>
                <option value="Crypto">Crypto</option>
                <option value="Stocks">Stocks</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Assets Table */}
        <GlassCard className="overflow-hidden border border-white/5 bg-black/20 p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-muted-foreground/60 text-xs font-semibold">
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Current price (USD)</th>
                  <th className="px-6 py-4">In your wallet</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors text-xs font-medium">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs select-none shadow-inner"
                          style={{ backgroundColor: asset.color + "22", border: `1.5px solid ${asset.color}44`, color: asset.color }}
                        >
                          {asset.logo}
                        </div>
                        <span className="text-white font-bold">{asset.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-muted-foreground/80">{asset.type}</td>
                    <td className="px-6 py-5 text-white font-bold font-mono">{asset.priceStr}</td>
                    <td className="px-6 py-5 font-mono">
                      <div className="font-bold text-white">{asset.balanceStr}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{asset.valStr}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => router.push("/deposit")}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded border border-white/5 font-semibold text-[10px] transition-colors cursor-pointer"
                        >
                          Deposit
                        </button>
                        <button
                          onClick={() => router.push("/withdraw")}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded border border-white/5 font-semibold text-[10px] transition-colors cursor-pointer"
                        >
                          Withdraw
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Floating Chat Support Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/chat"
          className="w-12 h-12 rounded-full bg-[#0066cc] text-white flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-blue-400/25"
          title="Open Live Chat"
        >
          <MessageSquare className="w-5 h-5 fill-white text-[#0066cc]" />
        </Link>
      </div>
    </motion.div>
  );
}
