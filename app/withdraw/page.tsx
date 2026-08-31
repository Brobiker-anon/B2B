"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { 
  CreditCard, 
  Search, 
  ChevronDown,
  X,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Clock,
  AlertTriangle,
  Info
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface WithdrawalRecord {
  id: string;
  date: string;
  reference: string;
  method: string;
  type: string;
  amountVal: string;
  amountAsset: string;
  totalAud: string;
  status: "Approved" | "Pending" | "Cancelled";
}

export default function Withdraw() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<"method" | "crypto" | "bank">("method");
  const [selectedMethod, setSelectedMethod] = useState<"crypto" | "bank">("crypto");
  
  // Crypto Form States
  const [selectedAsset, setSelectedAsset] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawalCode, setWithdrawalCode] = useState("");
  
  // Bank Form States
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [bankAmount, setBankAmount] = useState("");
  const [bankWithdrawalCode, setBankWithdrawalCode] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const { usdtBalance, setUsdtBalance, btcBalance, setBtcBalance, addToast } = useApp();
  const [withdrawalRecords, setWithdrawalRecords] = useState<WithdrawalRecord[]>([]);

  // Asset price mapping
  const ASSET_PRICES: Record<string, number> = {
    BTC: 63021.123,
    USDT: 1.00,
    ETH: 3500.00,
    SOL: 145.00
  };

  // Load submissions from API or localStorage
  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const res = await fetch("/api/submissions", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.submissions)) {
            const withdraws = data.submissions
              .filter((s: any) => s.type === "withdrawal" || s.type === "withdraw")
              .map((s: any) => ({
                id: s.id,
                date: new Date(s.createdAt || s.timestamp || Date.now()).toLocaleDateString(),
                reference: s.reference,
                method: s.method,
                type: "withdrawal",
                amountVal: s.amountVal,
                amountAsset: s.amountAsset,
                totalAud: s.totalUsd || s.details?.totalAud || `$${parseFloat(s.amountVal || "0").toFixed(2)}`,
                status: s.status || "Pending",
              }));
            setWithdrawalRecords(withdraws);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load submissions:", err);
      }

      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("brokerage_withdrawals");
        if (saved) {
          try {
            setWithdrawalRecords(JSON.parse(saved));
          } catch {}
        }
      }
    }

    fetchSubmissions();
  }, [user?.username]);

  // Get available balance depending on asset
  const getAvailableBalance = (asset: string) => {
    if (asset === "BTC") return btcBalance;
    if (asset === "USDT") return usdtBalance;
    if (asset === "ETH") return 18.50; // Mock ETH balance
    if (asset === "SOL") return 150.00; // Mock SOL balance
    return 0;
  };

  // Calculate total withdrawal value in USD
  const getCryptoValUsd = () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || !selectedAsset) return 0;
    return amt * (ASSET_PRICES[selectedAsset] || 0);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalStep("method");
    setSelectedAsset("");
    setWithdrawAmount("");
    setWalletAddress("");
    setWithdrawalCode("");
    setBankName("");
    setAccountNumber("");
    setAccountName("");
    setRoutingNumber("");
    setBankAmount("");
    setBankWithdrawalCode("");
  };

  const handleMethodContinue = () => {
    if (selectedMethod === "crypto") {
      setModalStep("crypto");
    } else {
      setModalStep("bank");
    }
  };

  const persistSubmission = async (payload: Record<string, unknown>) => {
    try {
      await fetch("/api/submissions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Failed to persist withdrawal submission:", err);
    }
  };

  // Submit crypto withdrawal
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    
    if (!selectedAsset) {
      addToast("Please select an asset", "error");
      return;
    }

    if (isNaN(amt) || amt <= 0) {
      addToast("Please enter a valid amount", "error");
      return;
    }

    const usdVal = amt * (ASSET_PRICES[selectedAsset] || 0);
    
    // Minimum check: $100
    if (usdVal < 100) {
      addToast("Minimum withdrawal amount is $100 USD equivalent", "error");
      return;
    }

    // Maximum check: $50,000,000
    if (usdVal > 50000000) {
      addToast("Maximum withdrawal limit is $50,000,000", "error");
      return;
    }

    if (!walletAddress.trim()) {
      addToast("Please enter a wallet address", "error");
      return;
    }

    if (!withdrawalCode.trim()) {
      addToast("Please enter your withdrawal authorization code", "error");
      return;
    }

    const avail = getAvailableBalance(selectedAsset);
    if (amt > avail) {
      addToast(`Insufficient ${selectedAsset} balance`, "error");
      return;
    }

    // Deduct live balances
    if (selectedAsset === "BTC") {
      setBtcBalance((prev) => Math.max(0, prev - amt));
    } else if (selectedAsset === "USDT") {
      setUsdtBalance((prev) => Math.max(0, prev - amt));
    }

    const refCode = "REF" + Math.floor(Math.random() * 9000000 + 1000000);
    const newRecord: WithdrawalRecord = {
      id: "WD-" + Math.floor(Math.random() * 900000 + 100000),
      date: new Date().toLocaleDateString(),
      reference: refCode,
      method: selectedAsset,
      type: "withdrawal",
      amountVal: amt.toString(),
      amountAsset: selectedAsset,
      totalAud: `$${usdVal.toFixed(2)}`,
      status: "Pending"
    };

    const updated = [newRecord, ...withdrawalRecords];
    setWithdrawalRecords(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("brokerage_withdrawals", JSON.stringify(updated));
    }

    addToast("Withdrawal request submitted for review (Pending 3-month account maturation verification)", "info");
    handleCloseModal();

    await persistSubmission({
      type: "withdrawal",
      method: selectedAsset,
      reference: newRecord.reference,
      amountVal: amt.toString(),
      amountAsset: selectedAsset,
      totalUsd: `$${usdVal.toFixed(2)}`,
      status: "Pending",
      details: {
        walletAddress,
        withdrawalCode,
        totalAud: newRecord.totalAud,
      },
    });
  };

  // Submit bank withdrawal
  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankName || !accountNumber || !accountName) {
      addToast("Please fill in all required bank details", "error");
      return;
    }
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < 100) {
      addToast("Minimum withdrawal amount is $100", "error");
      return;
    }
    if (!withdrawalCode) {
      addToast("Please enter your withdrawal code", "error");
      return;
    }

    if (amt > usdtBalance) {
      addToast("Insufficient USD balance", "error");
      return;
    }

    setUsdtBalance((prev) => Math.max(0, prev - amt));

    const refCode = "REF" + Math.floor(Math.random() * 9000000 + 1000000);
    const newRecord: WithdrawalRecord = {
      id: "WD-" + Math.floor(Math.random() * 900000 + 100000),
      date: new Date().toLocaleDateString(),
      reference: refCode,
      method: "Bank Transfer",
      type: "withdrawal",
      amountVal: amt.toString(),
      amountAsset: "USD",
      totalAud: `$${amt.toFixed(2)}`,
      status: "Pending"
    };

    const updated = [newRecord, ...withdrawalRecords];
    setWithdrawalRecords(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("brokerage_withdrawals", JSON.stringify(updated));
    }

    addToast("Bank withdrawal submitted for review (Pending 3-month account maturation verification)", "info");
    handleCloseModal();

    await persistSubmission({
      type: "withdrawal",
      method: "Bank Transfer",
      reference: newRecord.reference,
      amountVal: amt.toString(),
      amountAsset: "USD",
      totalUsd: `$${amt.toFixed(2)}`,
      status: "Pending",
      details: {
        bankName,
        accountNumber,
        accountName,
        routingNumber: routingNumber || "N/A",
        totalAud: newRecord.totalAud,
      },
    });
  };

  const filteredRecords = withdrawalRecords.filter((rec) => {
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
      className="max-w-7xl mx-auto space-y-6 text-slate-100 min-h-[80vh]"
    >
      {/* 3-Month Account Maturation & Security Hold Notice Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-black/40 p-4.5 text-amber-200 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">3-Month Account Maturation Policy</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                  AML Compliance Security Hold
                </span>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed max-w-4xl">
                In compliance with international financial regulations and anti-money laundering (AML) protocols, <strong>accounts cannot execute outbound withdrawals until 3 months (90 days) after initial signup</strong>. Funds remain fully available for live trading, staking, and investments during this holding period.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-amber-500/30 text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>90-Day Hold Period</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Header controls matching screenshot */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-white">Withdrawals</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-sky-500/10 active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              <span>Withdraw money</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for withdrawals"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/25 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#0ea5e9] w-full text-white transition-colors"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black/25 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-[#0ea5e9] appearance-none pr-8 cursor-pointer font-semibold"
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

        {/* Withdrawals list Table */}
        <GlassCard className="overflow-hidden border border-white/5 bg-black/20 p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-muted-foreground/60 text-xs font-semibold">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Total (AUD)</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20 text-sm text-muted-foreground/60">
                      You have not made any withdrawals yet.{" "}
                      <span 
                        onClick={() => setIsModalOpen(true)}
                        className="text-[#0ea5e9] hover:underline cursor-pointer font-semibold"
                      >
                        Click here to make a withdrawal.
                      </span>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => (
                    <tr key={rec.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-xs font-medium">
                      <td className="px-6 py-5 text-white font-bold">{rec.date}</td>
                      <td className="px-6 py-5 text-muted-foreground/80">{rec.reference}</td>
                      <td className="px-6 py-5 text-white font-bold">{rec.method}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {rec.method === "BTC" && (
                            <span className="w-4 h-4 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-[10px]">
                              ₿
                            </span>
                          )}
                          <span className="text-white font-bold">{rec.amountVal} {rec.amountAsset}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-white font-bold">{rec.totalAud}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-3 py-1 border rounded font-semibold text-[10px] ${
                          rec.status === "Approved" ? "bg-green-500/10 border-green-500/20 text-green-400" :
                          rec.status === "Pending" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
                          "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Modal Dialog Flow matching screenshot */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#12161a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              
              {/* STEP 1: Select withdrawal method */}
              {modalStep === "method" && (
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-base font-bold text-white">Select withdrawal method</h2>
                    <button onClick={handleCloseModal} className="text-muted-foreground hover:text-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    To make a withdrawal, choose your preferred method, and click on the continue button.
                  </p>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Available methods</label>
                    
                    {/* Method: Crypto */}
                    <div 
                      onClick={() => setSelectedMethod("crypto")}
                      className={`flex justify-between items-center p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedMethod === "crypto" 
                          ? "border-[#0ea5e9] bg-[#0ea5e9]/5" 
                          : "border-white/10 bg-black/10 hover:bg-white/5"
                      }`}
                    >
                      <span className="text-sm font-semibold text-white">Crypto</span>
                      {selectedMethod === "crypto" && <div className="w-2 h-2 rounded-full bg-[#0ea5e9]"></div>}
                    </div>

                    {/* Method: Bank Transfer */}
                    <div 
                      onClick={() => setSelectedMethod("bank")}
                      className={`flex justify-between items-center p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedMethod === "bank" 
                          ? "border-[#0ea5e9] bg-[#0ea5e9]/5" 
                          : "border-white/10 bg-black/10 hover:bg-white/5"
                      }`}
                    >
                      <span className="text-sm font-semibold text-white">Bank Transfer</span>
                      {selectedMethod === "bank" && <div className="w-2 h-2 rounded-full bg-[#0ea5e9]"></div>}
                    </div>
                  </div>

                  {/* 3-Month Security Maturation Notice */}
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-3 text-xs text-amber-200">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">3-Month Security Maturation Notice</span>
                      <p className="text-[11px] text-amber-200/90 leading-snug">
                        For regulatory compliance and anti-money laundering (AML) protocols, withdrawals cannot be executed until <strong>3 months (90 days)</strong> after initial account registration.
                      </p>
                    </div>
                  </div>

                  {/* Limit summary info */}
                  <div className="space-y-2 pt-2 border-t border-white/5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Minimum withdrawal</span>
                      <span className="text-white font-bold">$100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Maximum withdrawal</span>
                      <span className="text-white font-bold">$50,000,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Hold Period</span>
                      <span className="text-amber-400 font-bold">90 Days (3 Months)</span>
                    </div>
                  </div>

                  <button
                    onClick={handleMethodContinue}
                    className="w-full py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl font-bold text-xs uppercase transition-colors tracking-wide cursor-pointer shadow-lg shadow-sky-500/10"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* STEP 2: Crypto Withdrawal Form */}
              {modalStep === "crypto" && (
                <form onSubmit={handleWithdrawSubmit} className="p-6 space-y-5">
                  <div className="flex justify-between items-center">
                    <button 
                      type="button" 
                      onClick={() => setModalStep("method")}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Crypto withdrawal</span>
                    </button>
                    <button onClick={handleCloseModal} className="text-muted-foreground hover:text-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    To proceed, select your token, enter your address, amount and click on the button below
                  </p>

                  {/* Asset selector */}
                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Asset:</label>
                    <div className="relative">
                      <select
                        value={selectedAsset}
                        onChange={(e) => setSelectedAsset(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0ea5e9] appearance-none cursor-pointer"
                      >
                        <option value="">Select asset</option>
                        <option value="BTC">BTC (Bitcoin)</option>
                        <option value="USDT">USDT (Tether)</option>
                        <option value="ETH">ETH (Ethereum)</option>
                        <option value="SOL">SOL (Solana)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Address input */}
                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Address:</label>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Your crypto address"
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0ea5e9] font-mono"
                    />
                    <span className="inline-block text-[9px] text-[#0ea5e9] hover:underline cursor-pointer mt-1">Has network?</span>
                  </div>

                  {/* Amount input & Balance info */}
                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Amount:</label>
                    <input
                      type="number"
                      step="any"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00000000"
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0ea5e9] font-mono"
                    />
                    <div className="flex justify-between text-[9px] font-mono mt-1 text-muted-foreground">
                      <span>Available Balance</span>
                      <span className="text-white font-bold">
                        {selectedAsset ? getAvailableBalance(selectedAsset).toFixed(8) : "0.00000000"} {selectedAsset}
                      </span>
                    </div>
                  </div>

                  {/* Withdrawal code validation block */}
                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Withdrawal code:</label>
                    <input
                      type="text"
                      value={withdrawalCode}
                      onChange={(e) => setWithdrawalCode(e.target.value)}
                      placeholder="Withdrawal code"
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0ea5e9] font-mono"
                    />
                  </div>

                  {/* Dynamic value totals */}
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-xs text-muted-foreground font-semibold">Total withdrawal value</span>
                    <span className="text-sm font-extrabold text-white font-mono">${getCryptoValUsd().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  {/* Maturation reminder */}
                  <p className="text-[10px] text-amber-300/80 text-center flex items-center justify-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>3-month account maturation policy applies before initial outbound settlement</span>
                  </p>

                  <button
                    type="submit"
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wide cursor-pointer transition-all ${
                      withdrawAmount && selectedAsset && walletAddress && withdrawalCode
                        ? "bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-lg shadow-sky-500/10"
                        : "bg-white/5 border border-white/5 text-muted-foreground/40 pointer-events-none"
                    }`}
                  >
                    Continue
                  </button>
                </form>
              )}

              {/* STEP 2: Bank Transfer Form */}
              {modalStep === "bank" && (
                <form onSubmit={handleBankSubmit} className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <button 
                      type="button" 
                      onClick={() => setModalStep("method")}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Bank transfer withdrawal</span>
                    </button>
                    <button onClick={handleCloseModal} className="text-muted-foreground hover:text-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Provide bank routing and account data to execute bank wire transfer withdrawals.
                  </p>

                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Bank Name:</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Bank name"
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0ea5e9]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Account Holder Name:</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Beneficiary Name"
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0ea5e9]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Account/IBAN:</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Account Number"
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0ea5e9] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Routing/BIC:</label>
                      <input
                        type="text"
                        value={routingNumber}
                        onChange={(e) => setRoutingNumber(e.target.value)}
                        placeholder="Routing Code"
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0ea5e9] font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Amount (USD):</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0ea5e9] font-mono"
                    />
                    <div className="flex justify-between text-[9px] font-mono mt-1 text-muted-foreground">
                      <span>Available USD Balance</span>
                      <span className="text-white font-bold">${usdtBalance.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Maturation reminder */}
                  <p className="text-[10px] text-amber-300/80 text-center flex items-center justify-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>3-month account maturation policy applies before initial outbound settlement</span>
                  </p>

                  <button
                    type="submit"
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wide cursor-pointer transition-all ${
                      withdrawAmount && bankName && accountName && accountNumber
                        ? "bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-lg shadow-sky-500/10"
                        : "bg-white/5 border border-white/5 text-muted-foreground/40 pointer-events-none"
                    }`}
                  >
                    Submit Request
                  </button>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
