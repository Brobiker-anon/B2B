"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { Wallet, ShieldAlert, ArrowRight, QrCode, Smartphone, LogOut } from "lucide-react";
import { useApp } from "@/context/AppContext";

const wallets = [
  { id: "metamask", name: "MetaMask", desc: "Connect to your MetaMask wallet", recommended: true },
  { id: "walletconnect", name: "WalletConnect", desc: "Scan with WalletConnect to connect", recommended: false },
  { id: "coinbase", name: "Coinbase Wallet", desc: "Connect to your Coinbase Wallet", recommended: false },
  { id: "phantom", name: "Phantom", desc: "Connect to your Solana Phantom wallet", recommended: false },
  { id: "ledger", name: "Ledger", desc: "Connect your hardware wallet directly", recommended: false },
  { id: "trezor", name: "Trezor", desc: "Connect your hardware wallet directly", recommended: false },
];

export default function ConnectWallet() {
  const { walletConnected, walletAddress, connectWallet, disconnectWallet } = useApp();

  const handleConnectWallet = (walletName: string) => {
    connectWallet(walletName);
  };

  const handleScanQR = () => {
    connectWallet("WalletConnect");
  };

  const handleMobileApp = () => {
    connectWallet("ApexVeltrix App");
  };

  if (walletConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl mx-auto py-12 flex flex-col items-center text-slate-100"
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 box-glow text-emerald-400">
          <Wallet className="w-8 h-8" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Wallet Connected</h1>
        <p className="text-muted-foreground text-center mb-8">
          Your decentralized Web3 wallet is active and linked.
        </p>

        <GlassCard className="w-full p-6 text-center border-emerald-500/20 bg-emerald-500/5 mb-6">
          <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider font-semibold">Active Address</p>
          <code className="text-sm font-bold text-emerald-400 block truncate font-mono select-all bg-black/40 p-3 rounded-lg border border-white/5">
            {walletAddress}
          </code>
        </GlassCard>

        <button 
          onClick={disconnectWallet}
          className="flex items-center gap-2 px-6 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Disconnect Wallet
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto py-12 flex flex-col items-center text-slate-100"
    >
      <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 border border-brand/20 box-glow">
        <Wallet className="w-8 h-8 text-brand" />
      </div>
      
      <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Connect Your Wallet</h1>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        Securely connect your decentralized wallet to access Web3 features, direct deposits, and smart contract interactions.
      </p>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {wallets.map((wallet) => (
          <GlassCard
            key={wallet.id}
            hoverEffect
            onClick={() => handleConnectWallet(wallet.name)}
            className="cursor-pointer group relative overflow-hidden"
          >
            {wallet.recommended && (
              <div className="absolute top-0 right-0 bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                RECOMMENDED
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-brand/50 transition-colors">
                <span className="font-bold text-lg text-white">{wallet.name[0]}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white group-hover:text-brand transition-colors">{wallet.name}</h3>
                <p className="text-xs text-muted-foreground">{wallet.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-brand transform group-hover:translate-x-1 transition-all" />
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="w-full flex flex-col md:flex-row gap-4 mb-8">
        <GlassCard onClick={handleScanQR} className="flex-1 flex items-center gap-4 py-4 cursor-pointer hover:bg-white/5 transition-colors">
          <div className="p-3 bg-brand/10 rounded-lg text-brand">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-white">Scan QR Code</h4>
            <p className="text-xs text-muted-foreground">Connect mobile wallet</p>
          </div>
        </GlassCard>

        <GlassCard onClick={handleMobileApp} className="flex-1 flex items-center gap-4 py-4 cursor-pointer hover:bg-white/5 transition-colors">
          <div className="p-3 bg-brand/10 rounded-lg text-brand">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-white">Mobile App</h4>
            <p className="text-xs text-muted-foreground">Open in ApexVeltrix App</p>
          </div>
        </GlassCard>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3 w-full max-w-xl">
        <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-500/90 leading-relaxed">
          <strong>Security Notice:</strong> ApexVeltrix will never ask for your seed phrase or private keys. Do not share them with anyone, including our support staff. Only approve transactions you initiate.
        </p>
      </div>
    </motion.div>
  );
}
