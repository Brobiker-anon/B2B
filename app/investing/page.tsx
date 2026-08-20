"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { 
  TrendingUp, 
  Eye, 
  EyeOff, 
  Plus, 
  X, 
  ArrowRight
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface StockPosition {
  symbol: string;
  name: string;
  priceAud: number;
  change24h: string;
  isPositive: boolean;
  shares: number;
  valueAud: number;
}

interface RealEstatePosition {
  id: string;
  name: string;
  priceAud: number;
  change24h: string;
  isPositive: boolean;
  sharesValAud: number;
}

export default function Investing() {
  const [activeTab, setActiveTab] = useState<"stocks" | "realEstate">("stocks");
  const [showValue, setShowValue] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Buy Form States
  const [selectedStock, setSelectedStock] = useState("AAPL");
  const [selectedProperty, setSelectedProperty] = useState("villa");
  const [buyAmount, setBuyAmount] = useState("");

  const { usdtBalance, setUsdtBalance, addToast } = useApp();
  
  const [stockPositions, setStockPositions] = useState<StockPosition[]>([]);
  const [realEstatePositions, setRealEstatePositions] = useState<RealEstatePosition[]>([]);

  // Prices
  const STOCK_PRICES: Record<string, { name: string; priceAud: number; change24h: string; isPositive: boolean }> = {
    AAPL: { name: "Apple Inc.", priceAud: 282.40, change24h: "+1.8%", isPositive: true },
    GOOG: { name: "Alphabet Inc.", priceAud: 264.12, change24h: "+0.5%", isPositive: true },
    TSLA: { name: "Tesla Inc.", priceAud: 345.88, change24h: "-2.4%", isPositive: false },
    MSFT: { name: "Microsoft Corp.", priceAud: 638.20, change24h: "+1.1%", isPositive: true }
  };

  const PROPERTY_PRICES: Record<string, { name: string; priceAud: number; change24h: string; isPositive: boolean }> = {
    villa: { name: "Modern Luxury Villa (Gold Coast)", priceAud: 1450000, change24h: "+0.3%", isPositive: true },
    apartment: { name: "Downtown Sky Penthouse (Sydney)", priceAud: 2850000, change24h: "+0.8%", isPositive: true },
    commercial: { name: "Metro Retail Logistics Hub (Melbourne)", priceAud: 5200000, change24h: "-0.2%", isPositive: false }
  };

  const handleBuySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(buyAmount);

    if (isNaN(amt) || amt <= 0) {
      addToast("Please enter a valid amount", "error");
      return;
    }

    if (amt > usdtBalance) {
      addToast("Insufficient USD balance in wallet", "error");
      return;
    }

    // Deduct from hot wallet (1 USD = 1.5 AUD)
    setUsdtBalance((prev) => prev - amt);
    const amtAud = amt * 1.5;

    if (activeTab === "stocks") {
      const stockInfo = STOCK_PRICES[selectedStock];
      const sharesToBuy = amtAud / stockInfo.priceAud;

      setStockPositions((prev) => {
        const existing = prev.find((s) => s.symbol === selectedStock);
        if (existing) {
          return prev.map((s) => 
            s.symbol === selectedStock 
              ? { 
                  ...s, 
                  shares: s.shares + sharesToBuy, 
                  valueAud: s.valueAud + amtAud 
                } 
              : s
          );
        } else {
          return [
            ...prev,
            {
              symbol: selectedStock,
              name: stockInfo.name,
              priceAud: stockInfo.priceAud,
              change24h: stockInfo.change24h,
              isPositive: stockInfo.isPositive,
              shares: sharesToBuy,
              valueAud: amtAud
            }
          ];
        }
      });
      addToast(`Successfully bought ${sharesToBuy.toFixed(4)} shares of ${selectedStock}!`, "success");
    } else {
      const propInfo = PROPERTY_PRICES[selectedProperty];

      setRealEstatePositions((prev) => {
        const existing = prev.find((p) => p.id === selectedProperty);
        if (existing) {
          return prev.map((p) => 
            p.id === selectedProperty 
              ? { 
                  ...p, 
                  sharesValAud: p.sharesValAud + amtAud 
                } 
              : p
          );
        } else {
          return [
            ...prev,
            {
              id: selectedProperty,
              name: propInfo.name,
              priceAud: propInfo.priceAud,
              change24h: propInfo.change24h,
              isPositive: propInfo.isPositive,
              sharesValAud: amtAud
            }
          ];
        }
      });
      addToast(`Successfully invested A$${amtAud.toLocaleString()} in ${propInfo.name}!`, "success");
    }

    setBuyAmount("");
    setIsModalOpen(false);
  };

  // Compute total value in AUD
  const totalStocksValueAud = stockPositions.reduce((s, x) => s + x.valueAud, 0);
  const totalReValueAud = realEstatePositions.reduce((s, x) => s + x.sharesValAud, 0);
  const totalValueAud = activeTab === "stocks" ? totalStocksValueAud : totalReValueAud;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-8 text-slate-100 min-h-[85vh] relative"
    >
      {/* Title Header with Trending icon */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#38bdf8]" />
          <h1 className="text-xl font-bold text-white tracking-tight">Investing</h1>
        </div>
      </div>

      {/* Main tab selectors matching screenshot exactly */}
      <div className="space-y-4">
        <div className="flex gap-6 text-sm border-b border-white/5 pb-1">
          <button
            onClick={() => setActiveTab("stocks")}
            className={`pb-2.5 font-bold transition-all relative cursor-pointer ${
              activeTab === "stocks" ? "text-white" : "text-muted-foreground hover:text-white"
            }`}
          >
            Stocks
            {activeTab === "stocks" && (
              <motion.div layoutId="investing-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0ea5e9]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("realEstate")}
            className={`pb-2.5 font-bold transition-all relative cursor-pointer ${
              activeTab === "realEstate" ? "text-white" : "text-muted-foreground hover:text-white"
            }`}
          >
            Real Estate
            {activeTab === "realEstate" && (
              <motion.div layoutId="investing-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0ea5e9]" />
            )}
          </button>
        </div>

        {/* Thick Horizontal Arrow Separator Track */}
        <div className="flex items-center w-full text-white/20 select-none">
          <span className="text-xs mr-1">◀</span>
          <div className="flex-1 h-[2px] bg-white"></div>
          <span className="text-xs ml-1">▶</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-8"
        >
          {/* Portfolio value HUD panel */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Portfolio value</span>
              <button 
                onClick={() => setShowValue(!showValue)} 
                className="text-muted-foreground hover:text-white transition-colors cursor-pointer"
              >
                {showValue ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-3xl font-extrabold text-white">
              {showValue 
                ? `A$${totalValueAud.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` 
                : "A$•••••••"
              }
            </div>
          </div>

          {/* Sub-header block with Buy button */}
          <div className="flex justify-between items-center pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Positions</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-sky-500/10 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{activeTab === "stocks" ? "Buy stocks" : "Buy real estate"}</span>
            </button>
          </div>

          {/* Table rendering dynamically */}
          <GlassCard className="overflow-hidden border border-white/5 bg-black/20 p-0">
            <div className="overflow-x-auto">
              {activeTab === "stocks" ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-muted-foreground/60 text-xs font-semibold">
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4">Current Price</th>
                      <th className="px-6 py-4">24h change</th>
                      <th className="px-6 py-4">In your portfolio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockPositions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-20 text-xs text-muted-foreground/60">
                          You currently have no stocks in your portfolio
                        </td>
                      </tr>
                    ) : (
                      stockPositions.map((pos) => (
                        <tr key={pos.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors text-xs font-medium">
                          <td className="px-6 py-5 font-bold text-white">
                            {pos.name} ({pos.symbol})
                          </td>
                          <td className="px-6 py-5 text-white font-bold">
                            A${pos.priceAud.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className={`px-6 py-5 font-bold ${pos.isPositive ? "text-green-400" : "text-red-400"}`}>
                            {pos.change24h}
                          </td>
                          <td className="px-6 py-5 text-[#38bdf8] font-bold">
                            A${pos.valueAud.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({pos.shares.toFixed(2)} Shares)
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-muted-foreground/60 text-xs font-semibold">
                      <th className="px-6 py-4">Property</th>
                      <th className="px-6 py-4">Current Price</th>
                      <th className="px-6 py-4">24h change</th>
                      <th className="px-6 py-4">In your portfolio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {realEstatePositions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-20 text-xs text-muted-foreground/60">
                          You currently have no real estate in your portfolio
                        </td>
                      </tr>
                    ) : (
                      realEstatePositions.map((pos) => (
                        <tr key={pos.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-xs font-medium">
                          <td className="px-6 py-5 font-bold text-white">
                            {pos.name}
                          </td>
                          <td className="px-6 py-5 text-white font-bold">
                            A${pos.priceAud.toLocaleString()}
                          </td>
                          <td className={`px-6 py-5 font-bold ${pos.isPositive ? "text-green-400" : "text-red-400"}`}>
                            {pos.change24h}
                          </td>
                          <td className="px-6 py-5 text-[#38bdf8] font-bold">
                            A${pos.sharesValAud.toLocaleString(undefined, { minimumFractionDigits: 2 })} (Fractional)
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </GlassCard>

          {/* Thick Bottom Divider Line */}
          <div className="flex items-center w-full text-white/20 select-none pt-4">
            <span className="text-xs mr-1">◀</span>
            <div className="flex-1 h-[2px] bg-white"></div>
            <span className="text-xs ml-1">▶</span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Buy Investment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#12161a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative p-6 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-white">
                  {activeTab === "stocks" ? "Buy Stocks" : "Fractional Real Estate"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleBuySubmit} className="space-y-4">
                {activeTab === "stocks" ? (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Select Stock</label>
                    <select
                      value={selectedStock}
                      onChange={(e) => setSelectedStock(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#0ea5e9] appearance-none cursor-pointer"
                    >
                      {Object.keys(STOCK_PRICES).map((symbol) => (
                        <option key={symbol} value={symbol}>
                          {symbol} - {STOCK_PRICES[symbol].name} (A${STOCK_PRICES[symbol].priceAud})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Select Property</label>
                    <select
                      value={selectedProperty}
                      onChange={(e) => setSelectedProperty(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#0ea5e9] appearance-none cursor-pointer"
                    >
                      {Object.keys(PROPERTY_PRICES).map((id) => (
                        <option key={id} value={id}>
                          {PROPERTY_PRICES[id].name} (A${PROPERTY_PRICES[id].priceAud.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Amount to Invest (USD)</label>
                  <input
                    type="number"
                    step="any"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#0ea5e9] font-mono text-sm"
                  />
                  <div className="flex justify-between text-[9px] font-mono mt-1 text-muted-foreground">
                    <span>Hot Wallet Balance</span>
                    <span className="text-white font-bold">${usdtBalance.toLocaleString()} USD</span>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-[10px] text-yellow-500 leading-relaxed">
                  <strong>Notice:</strong> Purchase execution is instantaneous. Securities and equity rights will be registered to your profile ledger.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl font-bold text-xs uppercase tracking-wide cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <span>Confirm Purchase</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
