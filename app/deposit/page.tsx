"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { 
  CreditCard, 
  Landmark, 
  Wallet, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  Lock, 
  Search, 
  MessageSquare,
  ArrowLeft,
  X,
  ChevronDown,
  RefreshCw
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface DepositRecord {
  id: string;
  date: string;
  reference: string;
  method: string;
  type: string;
  amountVal: string;
  amountAsset: string;
  totalUsd: string;
  status: "Approved" | "Pending" | "Cancelled";
}

const CRYPTO_OPTIONS: Record<string, { name: string; symbol: string; address: string; networks: string[]; qrImage?: string; warning: string }> = {
  BTC: {
    name: "BTC (Bitcoin)",
    symbol: "BTC",
    address: "bc1q8e7t6seq2unu2s75nhrlv0clpk9twcd0wj5zrq",
    networks: ["Bitcoin (Native SegWit)", "Bitcoin (Legacy)"],
    qrImage: "/images/btc-qr.png",
    warning: "Only send BTC (Bitcoin) to this address via the Bitcoin network. Sending any other asset will result in permanent loss.",
  },
  USDT: {
    name: "USDT (Tether)",
    symbol: "USDT",
    address: "TYB2k3c9xjL2p8vN7mQ4wS1dE5fG6hJ8kL",
    networks: ["TRC20 (Tron)", "ERC20 (Ethereum)", "BEP20 (BNB Smart Chain)", "Polygon"],
    warning: "Only send USDT to this address via the selected network. Sending any other asset will result in permanent loss.",
  },
  ETH: {
    name: "ETH (Ethereum)",
    symbol: "ETH",
    address: "0x71C8A6B3dF5b828bF97E720e1F0C9d72F4Bc1294",
    networks: ["ERC20 (Ethereum Mainnet)", "Arbitrum One", "Optimism"],
    warning: "Only send ETH or ERC-20 assets to this address via Ethereum network.",
  },
  SOL: {
    name: "SOL (Solana)",
    symbol: "SOL",
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    networks: ["Solana Mainnet"],
    warning: "Only send SOL to this address via Solana SPL network.",
  },
};

export default function Deposit() {
  const { user, kycLevel, setKycLevel, addToast } = useApp();
  const [viewMode, setViewMode] = useState<"history" | "form">("history");
  const [method, setMethod] = useState("crypto");
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [depositRecords, setDepositRecords] = useState<DepositRecord[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState(true);

  // Form states
  const [cryptoAsset, setCryptoAsset] = useState("BTC");
  const [selectedNetwork, setSelectedNetwork] = useState(CRYPTO_OPTIONS["BTC"].networks[0]);
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardAmount, setCardAmount] = useState("1000.00");
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  const currentCrypto = CRYPTO_OPTIONS[cryptoAsset] || CRYPTO_OPTIONS["BTC"];

  // Live Sync Deposit Records with Server DB
  const fetchDeposits = useCallback(async () => {
    if (!user?.username) {
      setLoadingDeposits(false);
      return;
    }
    try {
      const res = await fetch(`/api/submissions?username=${encodeURIComponent(user.username)}&type=deposit`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.submissions)) {
          const records: DepositRecord[] = data.submissions.map((s: any) => {
            let dateStr = "Just now";
            if (s.createdAt) {
              const diffMs = Date.now() - new Date(s.createdAt).getTime();
              const diffSec = Math.floor(diffMs / 1000);
              const diffMin = Math.floor(diffSec / 60);
              const diffHrs = Math.floor(diffMin / 60);
              const diffDays = Math.floor(diffHrs / 24);
              if (diffSec < 60) dateStr = `${Math.max(1, diffSec)} seconds ago`;
              else if (diffMin < 60) dateStr = `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
              else if (diffHrs < 24) dateStr = `${diffHrs} hour${diffHrs === 1 ? "" : "s"} ago`;
              else dateStr = `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
            }
            return {
              id: s.id,
              date: dateStr,
              reference: s.reference,
              method: s.method,
              type: s.details?.type || "Regular",
              amountVal: s.amountVal,
              amountAsset: s.amountAsset || s.method,
              totalUsd: s.totalUsd?.startsWith("$") ? s.totalUsd : `$${s.totalUsd}`,
              status: s.status || "Pending",
            };
          });
          setDepositRecords(records);
        }
      }
    } catch (err) {
      console.error("Failed to load user deposit records:", err);
    } finally {
      setLoadingDeposits(false);
    }
  }, [user?.username]);

  useEffect(() => {
    fetchDeposits();
    const interval = setInterval(fetchDeposits, 2500); // Continuous live sync with admin actions
    return () => clearInterval(interval);
  }, [fetchDeposits]);

  const handleCopy = (textToCopy?: string) => {
    const targetText = textToCopy || currentCrypto.address;
    navigator.clipboard.writeText(targetText);
    setCopied(true);
    addToast(`${currentCrypto.symbol} deposit address copied to clipboard!`, "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartVerification = () => {
    setKycLevel(2);
    addToast("KYC Level 2 Identity Verification Approved successfully!", "success");
  };

  const handleNewDepositSubmit = async (amount: string, methodType: string, assetSymbol: string = "BTC") => {
    if (!user?.username) {
      addToast("Please sign in to submit a deposit.", "error");
      return;
    }

    const rawAmt = amount || (assetSymbol === "BTC" ? "0.05" : "500.00");
    const refCode = "G1gH" + Math.floor(10000 + Math.random() * 90000);
    const usdVal = (parseFloat(rawAmt) * (assetSymbol === "BTC" ? 63000 : 1)).toFixed(2);
    const totalUsdStr = `$${usdVal}`;

    const newRecord: DepositRecord = {
      id: `temp-${Date.now()}`,
      date: "Just now",
      reference: refCode,
      method: methodType.toUpperCase(),
      type: "Regular",
      amountVal: rawAmt,
      amountAsset: assetSymbol.toUpperCase(),
      totalUsd: totalUsdStr,
      status: "Pending",
    };

    setDepositRecords((prev) => [newRecord, ...prev]);
    addToast("Deposit request submitted and currently pending approval!", "success");
    setViewMode("history");
    setSubmittingDeposit(true);

    try {
      await fetch("/api/submissions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          email: user.email || "",
          type: "deposit",
          reference: newRecord.reference,
          method: newRecord.method,
          amountVal: newRecord.amountVal,
          amountAsset: newRecord.amountAsset,
          totalUsd: newRecord.totalUsd,
          status: "Pending",
          details: { 
            type: newRecord.type, 
            submittedAt: new Date().toISOString(),
            methodCategory: method,
            depositAddress: currentCrypto.address,
            network: selectedNetwork,
          },
        }),
      });
      fetchDeposits();
    } catch (err) {
      console.error("Failed to persist deposit submission:", err);
    } finally {
      setSubmittingDeposit(false);
    }
  };

  const filteredRecords = depositRecords.filter((rec) => {
    const matchesSearch = rec.reference.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rec.method.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-8 text-slate-100 relative min-h-[80vh]"
    >
      <AnimatePresence mode="wait">
        {viewMode === "history" ? (
          <motion.div
            key="history-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Top Bar matching reference */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Deposits</h1>
                <p className="text-xs text-muted-foreground mt-1">Live synchronized deposit ledger and transaction records</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setViewMode("form")}
                  className="px-5 py-2.5 bg-[#00a3ff] hover:bg-[#0090e0] text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                >
                  <span>Deposit now</span>
                </button>
                <button
                  onClick={fetchDeposits}
                  title="Sync Deposits"
                  className="p-2.5 bg-[#0d0e12] border border-[#1e2028] hover:border-gray-500 rounded-lg text-muted-foreground hover:text-white transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingDeposits ? 'animate-spin' : ''}`} />
                </button>
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search for deposits"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0d0e12] border border-[#1e2028] rounded-lg pl-9 pr-4 py-2 text-base md:text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#0d0e12] border border-[#1e2028] rounded-lg px-4 py-2 text-base md:text-xs text-white focus:outline-none focus:border-gray-500 appearance-none pr-8 cursor-pointer font-medium"
                  >
                    <option value="All">All</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Deposits list Table matching layout */}
            <GlassCard className="overflow-hidden border border-[#1e2028] bg-black/40 p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1e2028] text-gray-400 text-xs font-normal">
                      <th className="px-6 py-4 font-normal">Date</th>
                      <th className="px-6 py-4 font-normal">Reference</th>
                      <th className="px-6 py-4 font-normal">Method</th>
                      <th className="px-6 py-4 font-normal">Type</th>
                      <th className="px-6 py-4 font-normal">Amount</th>
                      <th className="px-6 py-4 font-normal">Total (USD)</th>
                      <th className="px-6 py-4 font-normal">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-xs text-muted-foreground">
                          {loadingDeposits ? "Syncing deposit history..." : "No deposits found. Click \"Deposit now\" to initiate a deposit."}
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((rec) => (
                        <tr key={rec.id} className="border-b border-[#1e2028]/60 hover:bg-white/[0.02] transition-colors text-xs font-normal">
                          <td className="px-6 py-5 text-gray-400">{rec.date}</td>
                          <td className="px-6 py-5 text-gray-400 font-mono">{rec.reference}</td>
                          <td className="px-6 py-5 text-white font-medium">{rec.method}</td>
                          <td className="px-6 py-5 text-gray-300">{rec.type}</td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-[#f7931a] text-black font-bold flex items-center justify-center text-[10px]">
                                {rec.amountAsset === "BTC" ? "₿" : "$"}
                              </span>
                              <span className="text-white font-semibold">{rec.amountVal} {rec.amountAsset}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-gray-300 font-medium">{rec.totalUsd}</td>
                          <td className="px-6 py-5">
                            {rec.status === "Pending" ? (
                              <span className="px-3 py-1 bg-[#00a3ff]/10 border border-[#00a3ff]/20 text-[#00a3ff] rounded text-xs font-medium inline-block">
                                Pending
                              </span>
                            ) : rec.status === "Approved" ? (
                              <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded text-xs font-medium inline-block">
                                Approved
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-xs font-medium inline-block">
                                Cancelled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div
            key="form-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Go back header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode("history")}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs border border-white/5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to deposits list</span>
                </button>
                <h1 className="text-xl font-bold text-white">New Deposit</h1>
              </div>
              <button onClick={() => setViewMode("history")} className="text-muted-foreground hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Deposit selection layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: "crypto", icon: Wallet, title: "Crypto Deposit", desc: "Transfer from another wallet" },
                { id: "card", icon: CreditCard, title: "Bank Card", desc: "Instant deposit via Visa/Mastercard" },
                { id: "bank", icon: Landmark, title: "Bank Transfer", desc: "Wire transfer (1-3 business days)" }
              ].map((m) => (
                <GlassCard 
                  key={m.id} 
                  hoverEffect 
                  className={`cursor-pointer ${method === m.id ? 'border-brand box-glow bg-brand/5' : ''}`}
                  onClick={() => setMethod(m.id)}
                >
                  <div>
                    <m.icon className={`w-8 h-8 mb-4 ${method === m.id ? 'text-brand' : 'text-muted-foreground'}`} />
                    <h3 className="text-lg font-semibold text-white mb-1">{m.title}</h3>
                    <p className="text-sm text-muted-foreground">{m.desc}</p>
                  </div>
                </GlassCard>
              ))}
            </div>

            {method === "crypto" && (
              <GlassCard className="space-y-6">
                <h2 className="text-xl font-bold text-white">Crypto Deposit Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Select Asset</label>
                      <select 
                        value={cryptoAsset}
                        onChange={(e) => {
                          const assetKey = e.target.value;
                          setCryptoAsset(assetKey);
                          if (CRYPTO_OPTIONS[assetKey]) {
                            setSelectedNetwork(CRYPTO_OPTIONS[assetKey].networks[0]);
                          }
                        }}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-base md:text-sm text-white outline-none focus:border-brand transition-colors"
                      >
                        <option value="BTC">BTC (Bitcoin)</option>
                        <option value="USDT">USDT (Tether)</option>
                        <option value="ETH">ETH (Ethereum)</option>
                        <option value="SOL">SOL (Solana)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Select Network</label>
                      <select 
                        value={selectedNetwork}
                        onChange={(e) => setSelectedNetwork(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-base md:text-sm text-white outline-none focus:border-brand transition-colors"
                      >
                        {currentCrypto.networks.map((net) => (
                          <option key={net} value={net}>{net}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Expected Deposit Amount ({currentCrypto.symbol})</label>
                      <input
                        type="number"
                        placeholder={currentCrypto.symbol === "BTC" ? "e.g. 0.05" : "e.g. 500"}
                        value={cryptoAmount}
                        onChange={(e) => setCryptoAmount(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-base md:text-sm text-white outline-none focus:border-brand transition-colors"
                      />
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <p className="text-xs text-yellow-500 leading-relaxed">
                        <strong>Warning:</strong> {currentCrypto.warning}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={submittingDeposit}
                      onClick={() => handleNewDepositSubmit(cryptoAmount || (currentCrypto.symbol === "BTC" ? "0.05" : "500"), "Crypto", currentCrypto.symbol)}
                      className="w-full py-3 bg-[#00a3ff] hover:bg-[#0090e0] disabled:opacity-50 text-white rounded-lg font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                    >
                      {submittingDeposit ? "Submitting..." : "Confirm Payment & Submit Request"}
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center p-6 border border-white/10 rounded-lg bg-black/20">
                    <div className="bg-white p-4 rounded-xl mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center">
                      {currentCrypto.qrImage ? (
                        <img 
                          src={currentCrypto.qrImage} 
                          alt={`${currentCrypto.symbol} Deposit QR Code`}
                          className="w-44 h-44 object-contain rounded-lg"
                        />
                      ) : (
                        <QrCode className="w-40 h-40 text-black" />
                      )}
                    </div>
                    <div className="w-full">
                      <label className="block text-xs font-medium text-muted-foreground mb-1 text-center">
                        Deposit Address ({currentCrypto.symbol})
                      </label>
                      <div className="flex items-center gap-2 bg-black/40 p-3 rounded-lg border border-white/5">
                        <code className="text-xs sm:text-sm text-brand-glow break-all select-all flex-1 font-mono">
                          {currentCrypto.address}
                        </code>
                        <button 
                          onClick={() => handleCopy(currentCrypto.address)} 
                          className="text-muted-foreground hover:text-white transition-colors p-1 shrink-0 cursor-pointer"
                          title="Copy address"
                        >
                          {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {method !== "crypto" && kycLevel < 2 && (
              <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Fiat Verification Required</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  To deposit via bank card or wire transfer, you must complete KYC Level 2 identity verification.
                </p>
                <button onClick={handleStartVerification} className="px-6 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors box-glow">
                  Start Verification
                </button>
              </GlassCard>
            )}

            {method === "card" && kycLevel >= 2 && (
              <GlassCard className="space-y-6">
                <h2 className="text-xl font-bold text-white">Credit / Debit Card Deposit</h2>
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cardholder Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-base md:text-sm text-white outline-none focus:border-brand transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-base md:text-sm text-white outline-none focus:border-brand transition-colors" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-base md:text-sm text-white outline-none focus:border-brand transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">CVV</label>
                      <input 
                        type="password" 
                        placeholder="***" 
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-base md:text-sm text-white outline-none focus:border-brand transition-colors" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Amount (USD)</label>
                    <input 
                      type="number" 
                      placeholder="1000.00" 
                      value={cardAmount}
                      onChange={(e) => setCardAmount(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-base md:text-sm text-white outline-none focus:border-brand transition-colors" 
                    />
                  </div>
                  <button 
                    type="button"
                    disabled={submittingDeposit}
                    onClick={() => handleNewDepositSubmit(cardAmount || "1000.00", "Card", "USD")} 
                    className="w-full py-3 bg-[#00a3ff] hover:bg-[#0090e0] text-white rounded-lg font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50"
                  >
                    {submittingDeposit ? "Submitting..." : "Submit Deposit"}
                  </button>
                </div>
              </GlassCard>
            )}

            {method === "bank" && kycLevel >= 2 && (
              <GlassCard className="space-y-6">
                <h2 className="text-xl font-bold text-white">Bank Wire Transfer Details</h2>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Bank Name</p>
                      <p className="text-sm font-bold text-white">Silicon Valley International Bank</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Beneficiary Name</p>
                      <p className="text-sm font-bold text-white">ApexVeltrix Inc.</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Account Number (IBAN)</p>
                      <p className="text-sm font-bold text-brand-glow font-mono select-all">US76 SVIB 9903 1234 5678 90</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">SWIFT / BIC Code</p>
                      <p className="text-sm font-bold text-white font-mono select-all">SVIBUS33XXX</p>
                    </div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-2">
                    <p className="text-xs text-yellow-500 leading-relaxed">
                      <strong>Transfer Notice:</strong> Please include your ApexVeltrix username in the transfer reference memo. Transfers typically take 1-3 business days to credit to your account.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={submittingDeposit}
                    onClick={() => handleNewDepositSubmit("2500.00", "Bank Wire", "USD")}
                    className="w-full py-3 bg-[#00a3ff] hover:bg-[#0090e0] text-white rounded-lg font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50"
                  >
                    {submittingDeposit ? "Submitting..." : "I Have Initiated Wire Transfer"}
                  </button>
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Bubble Widget */}
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
