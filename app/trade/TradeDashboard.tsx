"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Maximize2,
  Settings,
  Star,
  Sparkles
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import dynamic from 'next/dynamic';

const TradingViewChart = dynamic(
  () => import('@/components/TradingViewChart'),
  { 
    ssr: false,
    loading: () => <div className="h-[480px] w-full bg-white/5 animate-pulse rounded-lg flex items-center justify-center text-muted-foreground text-sm">Loading advanced chart terminal...</div>
  }
);

const CandlestickChart = dynamic(
  () => import('@/components/CandlestickChart'),
  {
    ssr: false,
    loading: () => <div className="h-[480px] w-full bg-white/5 animate-pulse rounded-lg flex items-center justify-center text-muted-foreground text-sm">Loading AI candlestick terminal...</div>
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


interface CandleData {
  time: string;
  timestamp: number;
  open: number;
  close: number;
  high: number;
  low: number;
  wick: [number, number];
  body: [number, number];
  isBullish: boolean;
}

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

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

function generateInitialData(basePrice: number = 62707.240): CandleData[] {
  const data: CandleData[] = [];
  const now = Date.now();
  for (let i = 60; i >= 0; i--) {
    const timestamp = now - i * 60000;
    const alignedTimestamp = Math.floor(timestamp / 60000) * 60000;
    const open = basePrice + (Math.random() - 0.5) * 500;
    const close = open + (Math.random() - 0.5) * 300;
    const high = Math.max(open, close) + Math.random() * 100;
    const low = Math.min(open, close) - Math.random() * 100;
    data.push({
      time: formatTime(alignedTimestamp),
      timestamp: alignedTimestamp,
      open: Math.round(open),
      close: Math.round(close),
      high: Math.round(high),
      low: Math.round(low),
      wick: [Math.round(low), Math.round(high)],
      body: [Math.round(open), Math.round(close)],
      isBullish: close >= open
    });
  }
  return data;
}

// Candlestick Pattern States and Highcharts setup for Trade Dashboard

export default function Trade({ initialAsset = "BTC" }: { initialAsset?: string }) {
  const [tradeTab, setTradeTab] = useState<"Buy" | "Sell" | "Convert">("Buy");
  const [tradeType, setTradeType] = useState("Crypto");
  const [tradeAmount, setTradeAmount] = useState("100");
  const [convertTarget, setConvertTarget] = useState("USDT");
  const [selectedAsset, setSelectedAsset] = useState(() => {
    const upper = initialAsset.toUpperCase();
    if (["BTC", "ETH", "SOL", "AAPL"].includes(upper)) {
      return upper;
    }
    return "BTC";
  });
  const [leverage, setLeverage] = useState(5);
  const [useTpSl, setUseTpSl] = useState(false);
  const [duration, setDuration] = useState("2 minutes");
  const [chartEngine, setChartEngine] = useState<"candlestick" | "tradingview">("candlestick");
  const [tradesTab, setTradesTab] = useState<"All" | "Swaps" | "Auto">("All");
  const [openTradesExpanded, setOpenTradesExpanded] = useState(true);
  const [closedTradesExpanded, setClosedTradesExpanded] = useState(false);
  
  const [currentPrice, setCurrentPrice] = useState(62707.240);
  const [chartData, setChartData] = useState<CandleData[]>([]);

  const { 
    accountType,
    realBalance,
    demoBalance,
    setRealBalance,
    setDemoBalance,
    btcBalance, 
    setBtcBalance, 
    addToast,
    user
  } = useApp();

  const balance = accountType === "REAL" ? realBalance : demoBalance;
  const setBalance = accountType === "REAL" ? setRealBalance : setDemoBalance;
  
  // Persist trades in localStorage
  const [activeTrades, setActiveTrades] = useState<CustomTrade[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("brokerage_active_trades");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const [closedTrades, setClosedTrades] = useState<CustomTrade[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("brokerage_closed_trades");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("brokerage_active_trades", JSON.stringify(activeTrades));
      } catch {}
    }
  }, [activeTrades]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("brokerage_closed_trades", JSON.stringify(closedTrades));
      } catch {}
    }
  }, [closedTrades]);

  const wsRef = useRef<WebSocket | null>(null);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastWsMessageTimeRef = useRef<number>(0);

  const getStreamUrl = (symbol: string) => {
    const s = symbol.toLowerCase();
    if (s === "btc" || s === "eth" || s === "sol") {
      return `wss://stream.binance.com:9443/ws/${s}usdt@kline_1m`;
    }
    return null; // simulation
  };

  const updateChartData = (timestamp: number, open: number, high: number, low: number, close: number) => {
    setChartData((prev) => {
      if (prev.length === 0) return prev;
      const lastCandle = prev[prev.length - 1];
      
      const newCandle: CandleData = {
        time: formatTime(timestamp),
        timestamp,
        open: Math.round(open),
        close: Math.round(close),
        high: Math.round(high),
        low: Math.round(low),
        wick: [Math.round(low), Math.round(high)],
        body: [Math.round(open), Math.round(close)],
        isBullish: close >= open
      };

      if (lastCandle.timestamp === timestamp) {
        return [...prev.slice(0, prev.length - 1), newCandle];
      } else if (timestamp > lastCandle.timestamp) {
        return [...prev.slice(-99), newCandle];
      }
      return prev;
    });
  };

  const connectWebSocket = (symbol: string) => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    const url = getStreamUrl(symbol);
    if (!url) {
      lastWsMessageTimeRef.current = Date.now();
      return;
    }
    
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const kline = data.k;
        lastWsMessageTimeRef.current = Date.now();
        
        const open = parseFloat(kline.o);
        const high = parseFloat(kline.h);
        const low = parseFloat(kline.l);
        const close = parseFloat(kline.c);
        const timestamp = parseInt(kline.t);
        
        setCurrentPrice(close);
        updateChartData(timestamp, open, high, low, close);
      };
      
      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
      };
    } catch (err) {
      console.error("Failed to connect websocket", err);
    }
  };

  // Triggered on selectedAsset changes
  useEffect(() => {
    let basePrice = 62707.24;
    if (selectedAsset === "ETH") basePrice = 3542.10;
    else if (selectedAsset === "SOL") basePrice = 145.20;
    else if (selectedAsset === "AAPL") basePrice = 180.45;
    
    setCurrentPrice(basePrice);
    setChartData(generateInitialData(basePrice));
    connectWebSocket(selectedAsset);
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [selectedAsset]);

  // Tick fallback simulation
  useEffect(() => {
    const checkFallback = setInterval(() => {
      const timeSinceLastMessage = Date.now() - lastWsMessageTimeRef.current;
      const isSimulating = !getStreamUrl(selectedAsset);
      
      if ((timeSinceLastMessage > 4000 || isSimulating) && !fallbackIntervalRef.current) {
        fallbackIntervalRef.current = setInterval(() => {
          setCurrentPrice(prev => {
            const change = (Math.random() - 0.5) * (selectedAsset === "BTC" || selectedAsset === "ETH" ? 25 : 0.8);
            const nextPrice = +(prev + change).toFixed(selectedAsset === "AAPL" ? 2 : 3);
            
            setChartData((prevChart) => {
              if (prevChart.length === 0) return prevChart;
              const lastCandle = { ...prevChart[prevChart.length - 1] };
              const now = Date.now();
              const currentMinute = Math.floor(now / 60000) * 60000;
              
              if (lastCandle.timestamp === currentMinute) {
                lastCandle.close = Math.round(nextPrice);
                lastCandle.high = Math.max(lastCandle.high, Math.round(nextPrice));
                lastCandle.low = Math.min(lastCandle.low, Math.round(nextPrice));
                lastCandle.body = [lastCandle.open, Math.round(nextPrice)];
                lastCandle.isBullish = nextPrice >= lastCandle.open;
                return [...prevChart.slice(0, prevChart.length - 1), lastCandle];
              } else {
                const newCandle: CandleData = {
                  time: formatTime(currentMinute),
                  timestamp: currentMinute,
                  open: lastCandle.close,
                  close: Math.round(nextPrice),
                  high: Math.max(lastCandle.close, Math.round(nextPrice)),
                  low: Math.min(lastCandle.close, Math.round(nextPrice)),
                  wick: [Math.min(lastCandle.close, Math.round(nextPrice)), Math.max(lastCandle.close, Math.round(nextPrice))],
                  body: [lastCandle.close, Math.round(nextPrice)],
                  isBullish: nextPrice >= lastCandle.close
                };
                return [...prevChart.slice(-99), newCandle];
              }
            });
            
            return nextPrice;
          });
        }, 3000);
      } else if (timeSinceLastMessage <= 4000 && !isSimulating && fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
    }, 2000);

    return () => {
      clearInterval(checkFallback);
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
    };
  }, [selectedAsset]);

  const handlePlaceOrder = async () => {
    const amt = parseFloat(tradeAmount);
    if (isNaN(amt) || amt <= 0) {
      addToast("Please enter a valid amount", "error");
      return;
    }

    if (tradeTab === "Buy") {
      if (amt > balance) {
        addToast("Insufficient USD balance", "error");
        return;
      }
      setBalance((prev) => Math.max(0, prev - amt));
      if (selectedAsset === "BTC") {
        setBtcBalance((prev) => prev + amt / currentPrice);
      }

      const newTrade: CustomTrade = {
        id: "T-" + Math.floor(Math.random() * 9000 + 1000),
        type: "Buy",
        asset: selectedAsset,
        amount: amt,
        entryPrice: currentPrice,
        leverage,
        duration,
        timestamp: new Date().toLocaleTimeString(),
        status: "Open"
      };

      setActiveTrades((prev) => [newTrade, ...prev]);
      addToast(`Successfully opened Buy limit order for $${amt.toLocaleString()} USD of ${selectedAsset} at ${leverage}x leverage (${accountType})`, "success");
    } else if (tradeTab === "Sell") {
      if (selectedAsset === "BTC" && (amt / currentPrice) > btcBalance) {
        addToast("Insufficient BTC balance", "error");
        return;
      }
      if (selectedAsset === "BTC") {
        setBtcBalance((prev) => Math.max(0, prev - amt / currentPrice));
      }
      setBalance((prev) => prev + amt);

      const newTrade: CustomTrade = {
        id: "T-" + Math.floor(Math.random() * 9000 + 1000),
        type: "Sell",
        asset: selectedAsset,
        amount: amt,
        entryPrice: currentPrice,
        leverage,
        duration,
        timestamp: new Date().toLocaleTimeString(),
        status: "Open"
      };

      setActiveTrades((prev) => [newTrade, ...prev]);
      addToast(`Successfully placed Sell order for $${amt.toLocaleString()} USD of ${selectedAsset} (${accountType})`, "success");
    } else {
      // Convert tab execution
      if (selectedAsset === "BTC") {
        if ((amt / currentPrice) > btcBalance) {
          addToast("Insufficient BTC balance for conversion", "error");
          return;
        }
        setBtcBalance((prev) => Math.max(0, prev - amt / currentPrice));
        setBalance((prev) => prev + amt);
        addToast(`Converted ${(amt / currentPrice).toFixed(4)} BTC to $${amt.toFixed(2)} USD`, "success");
      } else {
        if (amt > balance) {
          addToast("Insufficient USD balance for conversion", "error");
          return;
        }
        setBalance((prev) => Math.max(0, prev - amt));
        if (convertTarget === "BTC") {
          setBtcBalance((prev) => prev + amt / currentPrice);
        }
        addToast(`Converted $${amt.toFixed(2)} USD to ${convertTarget}`, "success");
      }
    }
  };

  const handleCloseTrade = (tradeId: string) => {
    const trade = activeTrades.find((t) => t.id === tradeId);
    if (!trade) return;

    // Refund/Settle
    if (trade.type === "Buy") {
      setBalance((prev) => prev + trade.amount);
      if (trade.asset === "BTC") {
        setBtcBalance((prev) => Math.max(0, prev - trade.amount / currentPrice));
      }
    } else {
      if (trade.asset === "BTC") {
        setBtcBalance((prev) => prev + trade.amount / currentPrice);
      }
      setBalance((prev) => Math.max(0, prev - trade.amount));
    }

    setActiveTrades((prev) => prev.filter((t) => t.id !== tradeId));
    setClosedTrades((prev) => [
      { ...trade, status: "Closed", timestamp: new Date().toLocaleTimeString() },
      ...prev
    ]);
    addToast("Position closed successfully", "success");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-6 text-slate-100 min-h-[85vh]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Chart & My trades */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart Header Bar with Engine Selector */}
          <div className="flex flex-wrap justify-between items-center gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#089981]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Trading Terminal</span>
            </div>
            <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setChartEngine("candlestick")}
                className={`px-3 py-1 rounded font-semibold transition-all cursor-pointer ${
                  chartEngine === "candlestick"
                    ? "bg-[#089981] text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                AI Candlestick Terminal
              </button>
              <button
                onClick={() => setChartEngine("tradingview")}
                className={`px-3 py-1 rounded font-semibold transition-all cursor-pointer ${
                  chartEngine === "tradingview"
                    ? "bg-[#3b82f6] text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                TradingView Terminal
              </button>
            </div>
          </div>

          {chartEngine === "candlestick" ? (
            <CandlestickChart chartData={chartData} selectedAsset={selectedAsset} height={380} />
          ) : (
            <TradingViewChart symbol={getTradingViewSymbol(selectedAsset)} theme="dark" height={380} />
          )}

          {/* My trades Collapsible Accordions Panel */}
          <GlassCard className="p-6 space-y-4 bg-black/20 border-white/5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">My trades</h2>
              
              <div className="flex gap-2 bg-black/40 rounded-lg p-1 border border-white/5">
                {(["All", "Swaps", "Auto"] as const).map((t) => (
                  <button 
                    key={t}
                    onClick={() => setTradesTab(t)}
                    className={`px-3 py-1 text-xs rounded-md font-bold transition-all cursor-pointer ${
                      tradesTab === t 
                        ? "bg-[#089981] text-white shadow-sm shadow-[#089981]/25" 
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              
              {/* Accordion 1: Open Trades */}
              <div className="border border-white/5 rounded-lg overflow-hidden bg-black/10">
                <button
                  onClick={() => setOpenTradesExpanded(!openTradesExpanded)}
                  className="w-full px-4 py-3 flex justify-between items-center text-xs font-bold text-white hover:bg-white/5 transition-colors"
                >
                  <span>Open ({activeTrades.length})</span>
                  {openTradesExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                <AnimatePresence initial={false}>
                  {openTradesExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-white/5 text-xs"
                    >
                      {activeTrades.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No active positions open</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-white/5 text-muted-foreground/60 font-semibold text-[10px] uppercase">
                                <th className="px-4 py-2.5">Asset</th>
                                <th className="px-4 py-2.5">Type</th>
                                <th className="px-4 py-2.5">Leverage</th>
                                <th className="px-4 py-2.5">Amount (USD)</th>
                                <th className="px-4 py-2.5">Entry Price</th>
                                <th className="px-4 py-2.5 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeTrades.map((t) => (
                                <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors font-medium">
                                  <td className="px-4 py-3 text-white font-bold">{t.asset}</td>
                                  <td className={`px-4 py-3 font-bold ${t.type === "Buy" ? "text-green-400" : "text-red-400"}`}>{t.type}</td>
                                  <td className="px-4 py-3 text-white font-mono">{t.leverage}x</td>
                                  <td className="px-4 py-3 text-white font-mono">${t.amount.toLocaleString()}</td>
                                  <td className="px-4 py-3 text-muted-foreground font-mono">${t.entryPrice.toLocaleString()}</td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      onClick={() => handleCloseTrade(t.id)}
                                      className="px-2 py-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded transition-colors"
                                    >
                                      Close
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 2: Closed Trades */}
              <div className="border border-white/5 rounded-lg overflow-hidden bg-black/10">
                <button
                  onClick={() => setClosedTradesExpanded(!closedTradesExpanded)}
                  className="w-full px-4 py-3 flex justify-between items-center text-xs font-bold text-white hover:bg-white/5 transition-colors"
                >
                  <span>Closed ({closedTrades.length})</span>
                  {closedTradesExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                <AnimatePresence initial={false}>
                  {closedTradesExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-white/5 text-xs"
                    >
                      {closedTrades.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No historical trades logged</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-white/5 text-muted-foreground/60 font-semibold text-[10px] uppercase">
                                <th className="px-4 py-2.5">Asset</th>
                                <th className="px-4 py-2.5">Type</th>
                                <th className="px-4 py-2.5">Amount (USD)</th>
                                <th className="px-4 py-2.5">Settle Price</th>
                                <th className="px-4 py-2.5 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {closedTrades.map((t) => (
                                <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors font-medium">
                                  <td className="px-4 py-3 text-white font-bold">{t.asset}</td>
                                  <td className={`px-4 py-3 font-bold ${t.type === "Buy" ? "text-green-400" : "text-red-400"}`}>{t.type}</td>
                                  <td className="px-4 py-3 text-white font-mono">${t.amount.toLocaleString()}</td>
                                  <td className="px-4 py-3 text-muted-foreground font-mono">${t.entryPrice.toLocaleString()}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-muted-foreground text-[10px] font-semibold rounded">
                                      Closed
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </GlassCard>

        </div>

        {/* RIGHT COLUMN: Sidebar (Buy/Sell Trading Panel matching screenshot) */}
        <div className="space-y-6">
          <GlassCard className="p-6 space-y-4 flex flex-col">
            
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
                  <select
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                    className="h-full bg-black/20 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-xs text-white focus:outline-none focus:border-[#089981] font-bold appearance-none cursor-pointer"
                  >
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="SOL">SOL</option>
                    <option value="AAPL">AAPL</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Pricing details */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-muted-foreground">Current USD balance:</span>
                <span className="text-white font-semibold">{balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-muted-foreground">Current {selectedAsset} price:</span>
                <span className="text-green-400 font-semibold">${currentPrice.toLocaleString(undefined, { minimumFractionDigits: selectedAsset === "AAPL" ? 2 : 3, maximumFractionDigits: selectedAsset === "AAPL" ? 2 : 3 })}</span>
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

            {/* TP / SL Toggles */}
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
                type="button"
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
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#089981] appearance-none pr-8 cursor-pointer"
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
    </motion.div>
  );
}