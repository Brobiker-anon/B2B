"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Grid, 
  Plus, 
  ChevronRight,
  Maximize2,
  Sparkles,
  Filter
} from "lucide-react";
import StatWidget from "@/components/ui/StatWidget";
import GlassCard from "@/components/ui/GlassCard";
import { useApp } from "@/context/AppContext";
import { ALL_ASSETS } from "@/data/assets";
import dynamic from 'next/dynamic';
import LoginForm from "@/components/auth/LoginForm";

const TradingViewChart = dynamic(
  () => import('@/components/TradingViewChart'),
  { 
    ssr: false,
    loading: () => <div className="h-[320px] w-full bg-white/5 animate-pulse rounded-lg flex items-center justify-center text-muted-foreground text-sm">Loading advanced chart terminal...</div>
  }
);

const getTradingViewSymbol = (asset: string) => {
  switch (asset) {
    case "BTC":
      return "BINANCE:BTCUSDT";
    case "ETH":
      return "BINANCE:ETHUSDT";
    case "SOL":
      return "BINANCE:SOLUSDT";
    case "AAPL":
      return "NASDAQ:AAPL";
    default:
      return "BINANCE:BTCUSDT";
  }
};


const generatePortfolioData = () => {
  const now = Date.now();
  return Array.from({ length: 32 }).map((_, i) => {
    const timestamp = now - (32 - i) * 3600000;
    const open = 62000 + Math.sin(i * 0.18) * 800 + i * 20 + Math.random() * 200;
    const close = open + (Math.random() - 0.45) * 600;
    const high = Math.max(open, close) + Math.random() * 150;
    const low = Math.min(open, close) - Math.random() * 150;
    const isBullish = close >= open;
    const change = ((close - open) / open) * 100;
    return {
      name: `D${i + 1}`,
      timestamp,
      open: Math.round(open),
      close: Math.round(close),
      high: Math.round(high),
      low: Math.round(low),
      isBullish,
      change,
      wick: [Math.round(low), Math.round(high)],
      body: [Math.round(open), Math.round(close)]
    };
  });
};

const COIN_ICONS: Record<string, string> = {
  BTC: "₿",
  ETH: "Ξ",
  SOL: "◎",
  AAPL: ""
};

const COIN_COLORS: Record<string, string> = {
  BTC: "#F7931A", 
  ETH: "#627EEA", 
  SOL: "#9945FF", 
  AAPL: "#A2AAAD"
};

interface CustomTrade {
  id: string;
  type: string;
  asset: string;
  amount: number;
  entryPrice: number;
  leverage: number;
  duration: string;
  timestamp: string;
  status: "Open" | "Closed";
}

export default function Dashboard() {
  const { user, isLoading, addToast, accountType, realBalance, demoBalance, setRealBalance, setDemoBalance, btcBalance, setBtcBalance, stakedBalance } = useApp();
  const [mounted, setMounted] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [btcPrice, setBtcPrice] = useState(63021.123);
  const priceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Trade form states
  const [tradeTab, setTradeTab] = useState<"Buy" | "Sell" | "Convert">("Buy");
  const [tradeType, setTradeType] = useState("Crypto");
  const [tradeAmount, setTradeAmount] = useState("100");
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [leverage, setLeverage] = useState(5);
  const [useTpSl, setUseTpSl] = useState(false);
  const [duration, setDuration] = useState("2 minutes");

  // Accordion state
  const [openTradesExpanded, setOpenTradesExpanded] = useState(true);
  const [closedTradesExpanded, setClosedTradesExpanded] = useState(false);
  const [tradesList, setTradesList] = useState<CustomTrade[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("brokerage_active_trades");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });
  const [tradesTab, setTradesTab] = useState<"All" | "Swaps" | "Auto">("All");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("brokerage_active_trades", JSON.stringify(tradesList));
      } catch {}
    }
  }, [tradesList]);

  useEffect(() => {
    setMounted(true);
    setChartData(generatePortfolioData());

    // Dynamic price variation mimicking tick movement
    priceIntervalRef.current = setInterval(() => {
      setBtcPrice((prev) => {
        const delta = (Math.random() - 0.5) * 12.5;
        return +(prev + delta).toFixed(3);
      });
    }, 3000);

    return () => {
      if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);
    };
  }, []);

  if (!user && !isLoading) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center bg-black px-4 text-slate-100">
        <LoginForm />
      </div>
    );
  }

  const activeBalance = accountType === "REAL" ? realBalance : demoBalance;
  const setActiveBalance = accountType === "REAL" ? setRealBalance : setDemoBalance;

  const handlePlaceOrder = () => {
    const amt = parseFloat(tradeAmount);
    if (isNaN(amt) || amt <= 0) {
      addToast("Please enter a valid amount", "error");
      return;
    }

    if (tradeTab === "Buy") {
      if (amt > activeBalance) {
        addToast("Insufficient USD balance", "error");
        return;
      }
      setActiveBalance((prev) => Math.max(0, prev - amt));
      if (selectedAsset === "BTC") {
        setBtcBalance((prev) => prev + amt / btcPrice);
      }
      addToast(`Successfully opened Buy limit order for $${amt.toLocaleString()} USD of ${selectedAsset} at 5x leverage (${accountType})`, "success");
    } else {
      if (selectedAsset === "BTC" && amt / btcPrice > btcBalance) {
        addToast("Insufficient BTC balance", "error");
        return;
      }
      if (selectedAsset === "BTC") {
        setBtcBalance((prev) => Math.max(0, prev - amt / btcPrice));
      }
      setActiveBalance((prev) => prev + amt);
      addToast(`Successfully placed Sell order for $${amt.toLocaleString()} USD of ${selectedAsset} (${accountType})`, "success");
    }

    // Add to trades list
    const newTrade: CustomTrade = {
      id: "T-" + Math.floor(Math.random() * 9000 + 1000),
      type: tradeTab,
      asset: selectedAsset,
      amount: amt,
      entryPrice: btcPrice,
      leverage,
      duration,
      timestamp: new Date().toLocaleTimeString(),
      status: "Open"
    };

    setTradesList((prev) => [newTrade, ...prev]);
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-6 text-slate-100"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Middle Content (Total Balance, Top Assets, Chart, My Trades) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Total Balance HUD matching Topbar balance */}
          <GlassCard className="p-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Total Balance ({accountType})
                </span>
                <div className="text-3xl font-extrabold text-white mt-1">
                  ${activeBalance.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => addToast("Depositing funds...", "info")} 
                  className="px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer shadow-lg shadow-brand/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Move money</span>
                </button>
                <button 
                  onClick={() => addToast("Customizing layout panels...", "info")} 
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-colors cursor-pointer"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontally aligned Top Assets section */}
            <div className="mt-8 border-t border-white/5 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Top Assets</h3>
                <span className="text-xs text-brand hover:underline cursor-pointer" onClick={() => window.location.href = "/assets"}>
                  View all assets
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { symbol: "BTC", name: "Bitcoin", price: btcPrice, bal: btcBalance, value: btcBalance * btcPrice },
                  { symbol: "ETH", name: "Ethereum", price: 3500, bal: 0, value: 0 },
                  { symbol: "SOL", name: "Solana", price: 145, bal: 0, value: 0 },
                  { symbol: "AAPL", name: "Apple", price: 180, bal: 0, value: 0 }
                ].map((asset) => {
                  const color = COIN_COLORS[asset.symbol] || "#888888";
                  const icon = COIN_ICONS[asset.symbol] || "?";
                  return (
                    <div 
                      key={asset.symbol} 
                      className="bg-black/25 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all cursor-pointer group"
                      onClick={() => setSelectedAsset(asset.symbol)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-inner"
                          style={{ backgroundColor: color + "22", border: `1.5px solid ${color}66`, color }}
                        >
                          {icon}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{asset.name}</div>
                          <div className="text-[10px] text-muted-foreground">{asset.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right mt-2">
                        <div className="text-xs font-semibold text-white">
                          ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {asset.bal.toFixed(4)} {asset.symbol}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>

          {/* Chart Header Bar */}
          <div className="flex flex-wrap justify-between items-center gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#089981]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Market Overview Chart</span>
            </div>
          </div>

          {/* TradingView Chart Only */}
          <GlassCard className="p-0 overflow-hidden">
            {mounted ? (
              <TradingViewChart symbol={getTradingViewSymbol(selectedAsset)} theme="dark" height={400} />
            ) : (
              <div className="h-[400px] w-full bg-white/5 animate-pulse rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                Loading chart...
              </div>
            )}
          </GlassCard>

          {/* My Trades Collapsible Sections */}
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <h2 className="text-base font-bold text-white">My trades</h2>
              <div className="flex gap-2 bg-white/5 rounded-lg p-1">
                {(["All", "Swaps", "Auto"] as const).map((t) => (
                  <button 
                    key={t}
                    onClick={() => setTradesTab(t)}
                    className={`px-3 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${tradesTab === t ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion headers */}
            <div className="space-y-3">
              {/* Open Trades Accordion */}
              <div>
                <button 
                  onClick={() => setOpenTradesExpanded(!openTradesExpanded)} 
                  className="w-full flex justify-between items-center py-2 text-xs font-bold text-muted-foreground uppercase hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ChevronDown className={`w-4 h-4 transform transition-transform ${openTradesExpanded ? "" : "-rotate-90"}`} />
                    <span>Open ({tradesList.filter(t => t.status === "Open").length})</span>
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {openTradesExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2"
                    >
                      {tradesList.filter(t => t.status === "Open").length === 0 ? (
                        <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-white/10 rounded-lg">
                          No open trades. Fill out the Buy panel on the right to place a trade!
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {tradesList.filter(t => t.status === "Open").map((t) => (
                            <div key={t.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition-colors">
                              <div>
                                <span className={`font-bold uppercase ${t.type === "Buy" ? "text-green-400" : "text-red-400"}`}>{t.type}</span>
                                <span className="text-white font-semibold ml-2">{t.asset}</span>
                                <span className="text-muted-foreground ml-2">@{t.leverage}x</span>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-bold">${t.amount.toLocaleString()}</div>
                                <div className="text-[10px] text-muted-foreground">{t.timestamp} | {t.duration}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Closed Trades Accordion */}
              <div>
                <button 
                  onClick={() => setClosedTradesExpanded(!closedTradesExpanded)} 
                  className="w-full flex justify-between items-center py-2 text-xs font-bold text-muted-foreground uppercase hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ChevronDown className={`w-4 h-4 transform transition-transform ${closedTradesExpanded ? "" : "-rotate-90"}`} />
                    <span>Closed ({tradesList.filter(t => t.status === "Closed").length})</span>
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {closedTradesExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2"
                    >
                      <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-white/10 rounded-lg">
                        No closed trades.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </GlassCard>

        </div>

        {/* RIGHT COLUMN: Sidebar (Weight breakdown + Buy/Sell Trading Panel) */}
        <div className="space-y-6">
          
          {/* Widget 1: Categories, Trading Progress, Signal Strength */}
          <GlassCard className="p-6 space-y-6">
            
            {/* Categories */}
            <div>
              <h3 className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-3">Categories</h3>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden mb-4">
                <div className="bg-[#3b82f6] h-full rounded-full" style={{ width: "100%" }}></div>
              </div>
              <div className="grid grid-cols-2 gap-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>
                  <div>
                    <span className="block text-[10px] text-muted-foreground">Crypto</span>
                    <span className="text-xs font-extrabold text-white">100%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]"></span>
                  <div>
                    <span className="block text-[10px] text-muted-foreground">Stocks</span>
                    <span className="text-xs font-extrabold text-white">0%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]"></span>
                  <div>
                    <span className="block text-[10px] text-muted-foreground">Fiat</span>
                    <span className="text-xs font-extrabold text-white">0%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                  <div>
                    <span className="block text-[10px] text-muted-foreground">Real Estate</span>
                    <span className="text-xs font-extrabold text-white">0%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trading Progress */}
            <div className="pt-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Trading progress</span>
                <span className="text-xs font-extrabold text-white">0%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#089981] h-full rounded-full" style={{ width: "0%" }}></div>
              </div>
            </div>

            {/* Signal Strength */}
            <div className="pt-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Signal strength</span>
                <span className="text-xs font-extrabold text-[#ef4444]">0%</span>
              </div>
              {/* Row of 11 discrete segments/blocks */}
              <div className="flex gap-1 justify-between">
                {Array.from({ length: 11 }).map((_, idx) => (
                  <div key={idx} className="flex-1 h-2 rounded-sm bg-[#ef4444]/20 border border-[#ef4444]/40"></div>
                ))}
              </div>
            </div>

          </GlassCard>

          {/* Widget 2: Buy / Sell / Convert Trading Form */}
          <GlassCard className="p-6 space-y-4">
            
            {/* Tabs */}
            <div className="flex p-0.5 bg-black/40 rounded-lg border border-white/5">
              {(["Buy", "Sell", "Convert"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTradeTab(tab)}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    tradeTab === tab 
                      ? "bg-[#089981] text-white shadow-lg shadow-brand/10" 
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Trade Type Selection */}
            <div>
              <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Trade type</label>
              <div className="relative">
                <select
                  value={tradeType}
                  onChange={(e) => setTradeType(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#089981] appearance-none cursor-pointer"
                >
                  <option value="Crypto">Crypto</option>
                  <option value="Stocks">Stocks</option>
                  <option value="Fiat">Fiat</option>
                  <option value="Real Estate">Real Estate</option>
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Amount & Asset Dropdown */}
            <div>
              <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Amount</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#089981] font-mono"
                  placeholder="0.00"
                />
                <div className="relative flex-shrink-0">
                  <div className="flex items-center gap-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white cursor-pointer select-none">
                    <span className="text-yellow-500 font-bold">₿</span>
                    <span className="font-bold">{selectedAsset}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing details */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-muted-foreground">Current USD balance:</span>
                <span className="text-white font-semibold">{activeBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-muted-foreground">Current BTC price:</span>
                <span className="text-green-400 font-semibold">${btcPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Leverage Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Leverage</label>
                <span className="text-[10px] font-extrabold bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white">{leverage}x</span>
              </div>
              <div className="relative pt-2 pb-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={leverage}
                  onChange={(e) => setLeverage(parseInt(e.target.value))}
                  className="w-full accent-[#089981] bg-white/10 rounded-lg appearance-none h-1 cursor-pointer"
                />
                {/* Tick labels */}
                <div className="flex justify-between text-[8px] text-muted-foreground font-mono mt-1">
                  <span>0x</span>
                  <span>25x</span>
                  <span>50x</span>
                  <span>75x</span>
                  <span>100x</span>
                </div>
              </div>
            </div>

            {/* TP / SL toggles */}
            <div className="flex justify-between items-center pt-2">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useTpSl}
                  onChange={(e) => setUseTpSl(e.target.checked)}
                  className="rounded border-white/10 bg-black/20 text-[#089981] focus:ring-[#089981]"
                />
                <span>Use TP/SL</span>
              </label>
              <button 
                onClick={() => addToast("Optimizing risk thresholds using AI models...", "info")}
                className="text-[9px] px-2.5 py-1 rounded-full font-bold border border-purple-500/50 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-all cursor-pointer"
              >
                Set with AI
              </button>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Duration</label>
              <div className="relative">
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#089981] appearance-none cursor-pointer"
                >
                  <option value="2 minutes">2 minutes</option>
                  <option value="5 minutes">5 minutes</option>
                  <option value="15 minutes">15 minutes</option>
                  <option value="1 hour">1 hour</option>
                  <option value="1 day">1 day</option>
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handlePlaceOrder}
              className="w-full py-3 bg-[#089981] hover:bg-[#07856f] text-white rounded-lg font-bold text-xs uppercase transition-colors tracking-wide cursor-pointer shadow-lg shadow-brand/10 mt-2"
            >
              {tradeTab}
            </button>

          </GlassCard>

        </div>

      </div>

      {/* Bottom quick stats */}
      <div className="grid w-100 grid-cols-1 jus gap-4">
        <GlassCard className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">{user?.username || "Verified Account"}</h4>
            <p className="text-[10px] text-green-400 font-semibold cursor-pointer hover:underline" onClick={() => window.location.href = "/settings"}>
              Verify your account
            </p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">Signal Strength</h4>
            <p className="text-[10px] text-muted-foreground">AI matching optimization: 98% positive accuracy.</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">Cold Storage Active</h4>
            <p className="text-[10px] text-muted-foreground">Hardened multisig wallet security safeguards enabled.</p>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
