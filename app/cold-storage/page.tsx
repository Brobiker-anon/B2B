"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Plus, 
  X, 
  HelpCircle, 
  Lock,
  ArrowRight
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface ColdStorageAsset {
  symbol: string;
  name: string;
  amount: number;
  lockedAtPrice: number;
}

export default function ColdStorage() {
  const [activeTab, setActiveTab] = useState<"assets" | "howItWorks">("assets");
  const [showValue, setShowValue] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal Form States
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [lockAmount, setLockAmount] = useState("");

  const { usdtBalance, setUsdtBalance, btcBalance, setBtcBalance, addToast } = useApp();
  const [coldAssets, setColdAssets] = useState<ColdStorageAsset[]>([]);

  // Prices in AUD (Approx 1.5x USD)
  const ASSET_PRICES_AUD: Record<string, number> = {
    BTC: 94531.68,
    USDT: 1.50,
    ETH: 5250.00,
    SOL: 217.50
  };

  const getHotWalletBalance = (symbol: string) => {
    if (symbol === "BTC") return btcBalance;
    if (symbol === "USDT") return usdtBalance;
    return 0;
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(lockAmount);

    if (isNaN(amt) || amt <= 0) {
      addToast("Please enter a valid amount", "error");
      return;
    }

    const avail = getHotWalletBalance(selectedAsset);
    if (amt > avail) {
      addToast(`Insufficient ${selectedAsset} in hot wallet`, "error");
      return;
    }

    // Deduct from hot wallet
    if (selectedAsset === "BTC") {
      setBtcBalance((prev) => prev - amt);
    } else if (selectedAsset === "USDT") {
      setUsdtBalance((prev) => prev - amt);
    }

    // Add to cold storage
    setColdAssets((prev) => {
      const existing = prev.find((a) => a.symbol === selectedAsset);
      if (existing) {
        return prev.map((a) => 
          a.symbol === selectedAsset 
            ? { ...a, amount: a.amount + amt } 
            : a
        );
      } else {
        return [
          ...prev, 
          { 
            symbol: selectedAsset, 
            name: selectedAsset === "BTC" ? "Bitcoin" : "Tether", 
            amount: amt, 
            lockedAtPrice: ASSET_PRICES_AUD[selectedAsset] 
          }
        ];
      }
    });

    addToast(`Successfully transferred ${amt} ${selectedAsset} to cold storage custody`, "success");
    setLockAmount("");
    setIsModalOpen(false);
  };

  // Calculate total locked value in AUD
  const totalValueAud = coldAssets.reduce((s, a) => {
    return s + (a.amount * (ASSET_PRICES_AUD[a.symbol] || 0));
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-8 text-slate-100 min-h-[85vh] relative"
    >
      {/* Title Header with Snowflake block icon */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl text-[#38bdf8] font-bold">❄</span>
          <h1 className="text-xl font-bold text-white tracking-tight">Cold Storage</h1>
        </div>
      </div>

      {/* Main tab selectors */}
      <div className="space-y-4">
        <div className="flex gap-6 text-sm border-b border-white/5 pb-1">
          <button
            onClick={() => setActiveTab("assets")}
            className={`pb-2.5 font-bold transition-all relative cursor-pointer ${
              activeTab === "assets" ? "text-white" : "text-muted-foreground hover:text-white"
            }`}
          >
            Assets
            {activeTab === "assets" && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0ea5e9]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("howItWorks")}
            className={`pb-2.5 font-bold transition-all relative cursor-pointer ${
              activeTab === "howItWorks" ? "text-white" : "text-muted-foreground hover:text-white"
            }`}
          >
            How it works
            {activeTab === "howItWorks" && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0ea5e9]" />
            )}
          </button>
        </div>

        {/* Thick Horizontal Arrow Separator Track matching screenshot */}
        <div className="flex items-center w-full text-white/20 select-none">
          <span className="text-xs mr-1">◀</span>
          <div className="flex-1 h-[2px] bg-white"></div>
          <span className="text-xs ml-1">▶</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "assets" ? (
          <motion.div
            key="assets-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Value Secured HUD panel */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Cold Storage Value</span>
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

            {/* Sub-header block with Add asset button */}
            <div className="flex justify-between items-center pt-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Your assets</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-sky-500/10 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add asset</span>
              </button>
            </div>

            {/* Assets Table */}
            <GlassCard className="overflow-hidden border border-white/5 bg-black/20 p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-muted-foreground/60 text-xs font-semibold">
                      <th className="px-6 py-4">Asset</th>
                      <th className="px-6 py-4">Current Price</th>
                      <th className="px-6 py-4">In Wallet</th>
                      <th className="px-6 py-4">Current Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coldAssets.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-20 text-xs text-muted-foreground/60">
                          No cold storage assets found
                        </td>
                      </tr>
                    ) : (
                      coldAssets.map((asset) => (
                        <tr key={asset.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors text-xs font-medium">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 font-bold text-white">
                              {asset.symbol === "BTC" && (
                                <span className="w-4 h-4 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-[10px]">
                                  ₿
                                </span>
                              )}
                              <span>{asset.name} ({asset.symbol})</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-white font-bold">
                            A${(ASSET_PRICES_AUD[asset.symbol] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-5 text-white font-bold">
                            {asset.amount.toFixed(4)} {asset.symbol}
                          </td>
                          <td className="px-6 py-5 text-[#38bdf8] font-bold">
                            A${(asset.amount * (ASSET_PRICES_AUD[asset.symbol] || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* Thick Bottom Divider Line matching screenshot */}
            <div className="flex items-center w-full text-white/20 select-none pt-4">
              <span className="text-xs mr-1">◀</span>
              <div className="flex-1 h-[2px] bg-white"></div>
              <span className="text-xs ml-1">▶</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="how-it-works-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 max-w-4xl"
          >
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#38bdf8]" />
                <span>Deep Cold Storage Architecture</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cold storage transactions are protected by cryptographic key shards held in geographically dispersed secure vaults.
                Funds are transferred into offline custody protocols with hardware multi-signatures.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3 bg-black/20 rounded-lg border border-white/5">
                  <Lock className="w-4 h-4 text-brand mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Air-Gapped Environment</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Transactions are compiled offline and transfer data is relayed securely.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-black/20 rounded-lg border border-white/5">
                  <HelpCircle className="w-4 h-4 text-brand mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Time-Locked Security</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Custody module withdrawals require 48 hours for validation checks.</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Dialogue to add hot assets into cold storage */}
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
                <h2 className="text-base font-bold text-white">Transfer to Cold Storage</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddAsset} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Select Asset</label>
                  <select
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#0ea5e9] appearance-none cursor-pointer"
                  >
                    <option value="BTC">BTC (Bitcoin) - Balance: {btcBalance.toFixed(4)} BTC</option>
                    <option value="USDT">USDT (Tether) - Balance: ${usdtBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Transfer Amount</label>
                  <input
                    type="number"
                    step="any"
                    value={lockAmount}
                    onChange={(e) => setLockAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#0ea5e9]"
                  />
                  <div className="flex justify-between text-[9px] font-mono mt-1 text-muted-foreground">
                    <span>Hot Wallet Balance</span>
                    <span className="text-white font-bold">{getHotWalletBalance(selectedAsset)} {selectedAsset}</span>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-[10px] text-yellow-500 leading-relaxed">
                  <strong>Verification Notice:</strong> Moving assets to cold storage air-gaps them immediately. Transfer requires about 10-15 minutes of block confirmation time.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl font-bold text-xs uppercase tracking-wide cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <span>Lock in Vault</span>
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
