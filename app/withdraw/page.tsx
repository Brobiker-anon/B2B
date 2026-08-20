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
  ChevronRight
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
  };

  const handleMethodContinue = () => {
    if (selectedMethod === "crypto") {
      setModalStep("crypto");
    } else {
      setModalStep("bank");
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
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
      setBtcBalance((prev) => prev - amt);
    } else if (selectedAsset === "USDT") {
      setUsdtBalance((prev) => prev - amt);
    }

    // Generate record
    const refCode = "WD" + Math.floor(Math.random() * 90000 + 10000);
    const estimatedAud = usdVal * 1.5;

    const newRecord: WithdrawalRecord = {
      id: Date.now().toString(),
      date: "Just now",
      reference: refCode,
      method: selectedAsset,
      type: "Regular",
      amountVal: amt.toString(),
      amountAsset: selectedAsset,
      totalAud: `A$${estimatedAud.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`,
      status: "Pending"
    };

    setWithdrawalRecords((prev) => [newRecord, ...prev]);
    addToast(`Successfully requested withdrawal of ${amt} ${selectedAsset}`, "success");
    handleCloseModal();
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    
    if (isNaN(amt) || amt < 100) {
      addToast("Minimum bank withdrawal is $100", "error");
      return;
    }

    if (amt > usdtBalance) {
      addToast("Insufficient USD balance", "error");
      return;
    }

    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      addToast("Please fill in all bank transfer fields", "error");
      return;
    }

    setUsdtBalance((prev) => prev - amt);

    const refCode = "WD" + Math.floor(Math.random() * 90000 + 10000);
    const estimatedAud = amt * 1.5;

    const newRecord: WithdrawalRecord = {
      id: Date.now().toString(),
      date: "Just now",
      reference: refCode,
      method: "Bank",
      type: "Regular",
      amountVal: amt.toString(),
      amountAsset: "USD",
      totalAud: `A$${estimatedAud.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`,
      status: "Pending"
    };

    setWithdrawalRecords((prev) => [newRecord, ...prev]);
    addToast(`Bank transfer withdrawal request of $${amt} submitted!`, "success");
    handleCloseModal();
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
      className="max-w-7xl mx-auto space-y-8 text-slate-100 min-h-[80vh]"
    >
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
