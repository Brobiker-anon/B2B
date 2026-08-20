"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Bell, Search, Menu, X, ChevronDown, LayoutDashboard, Wallet as WalletIcon, 
  ShieldCheck, TrendingUp, PieChart, Users, LineChart, Cpu, ArrowRightLeft, 
  Building, Crown, Radio, Lock, Link as LinkIcon, Settings, MessageSquare, 
  Globe, CreditCard, Clock, Plus, Minus, LogOut
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { useApp } from "@/context/AppContext";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Trade", href: "/trade", icon: ArrowRightLeft },
  { name: "Markets", href: "/markets", icon: LineChart },
  { name: "Assets", href: "/assets", icon: PieChart },
  { name: "Investing", href: "/investing", icon: TrendingUp },
  { name: "Deposit", href: "/deposit", icon: WalletIcon },
  { name: "Cold Storage", href: "/cold-storage", icon: ShieldCheck },
  { name: "Copy Trading", href: "/copy-trading", icon: Users },
  { name: "Mining", href: "/mining", icon: Cpu },
  { name: "Real Estate", href: "/real-estate", icon: Building },
  { name: "Stake", href: "/stake", icon: Lock },
  { name: "Signals", href: "/signals", icon: Radio },
  { name: "Subscribe", href: "/subscribe", icon: Crown },
  { name: "Referrals", href: "/referrals", icon: LinkIcon },
];

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const { 
    user, 
    isLoading, 
    logout, 
    addToast,
    accountType, 
    setAccountType, 
    realBalance, 
    demoBalance,
    setKycLevel 
  } = useApp();

  if (isLoading || !user || pathname === "/signin" || pathname === "/signup") {
    return null;
  }

  const userInitials = user?.username
    ? user.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "FB";

  return (
    <>
      <header className="h-16 border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 md:px-6">
        {/* Left side: Hamburger menu for mobile & Search input */}
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden p-2 text-muted-foreground hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden md:flex items-center relative">
            <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search markets, assets, or signals..." 
              className="bg-[#0d0e12] border border-[#1e2028] rounded-full pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-[#00a3ff] w-64 transition-all placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Right side controls matching screenshot */}
        <div className="flex items-center gap-2.5">
          {/* Globe button */}
          <button className="p-2 border border-[#1e2028] bg-[#0d0e12] hover:bg-[#16181d] text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer">
            <Globe className="w-4 h-4 text-white" />
          </button>

          {/* Account Balance Dropdown Pill ($0.00 REAL ▼) */}
          <div className="relative">
            <button
              onClick={() => {
                setAccountMenuOpen(!accountMenuOpen);
                setProfileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 border border-[#1e2028] bg-[#0d0e12] hover:bg-[#16181d] rounded-lg text-sm font-bold text-white transition-colors cursor-pointer select-none"
            >
              <span>${(accountType === "REAL" ? realBalance : demoBalance).toFixed(2)}</span>
              <span className="text-[#00a3ff] font-extrabold text-xs tracking-wide">{accountType}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white ml-0.5" />
            </button>

            {/* Account Type Popup Menu */}
            <AnimatePresence>
              {accountMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setAccountMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 mt-2 w-60 rounded-xl border border-[#252830] bg-[#16181d] p-2.5 shadow-2xl z-50 space-y-2"
                  >
                    {/* Real Account */}
                    <div
                      onClick={() => {
                        setAccountType("REAL");
                        setAccountMenuOpen(false);
                        addToast("Switched to Real Account", "info");
                      }}
                      className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                        accountType === "REAL" ? "bg-[#1f222a]" : "hover:bg-[#1f222a]/60"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-[#00a3ff]">Real account</div>
                        <div className="text-sm font-bold text-white">${realBalance.toFixed(2)}</div>
                      </div>
                      <div className={`p-2.5 rounded-lg flex items-center justify-center ${accountType === "REAL" ? "bg-[#00a3ff]" : "bg-[#22252c]"}`}>
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Demo Account */}
                    <div
                      onClick={() => {
                        setAccountType("DEMO");
                        setAccountMenuOpen(false);
                        addToast("Switched to Demo Account", "info");
                      }}
                      className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                        accountType === "DEMO" ? "bg-[#1f222a]" : "hover:bg-[#1f222a]/60"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-[#00a3ff]">Demo account</div>
                        <div className="text-sm font-bold text-white">${demoBalance.toFixed(2)}</div>
                      </div>
                      <div className={`p-2.5 rounded-lg flex items-center justify-center ${accountType === "DEMO" ? "bg-[#00a3ff]" : "bg-[#22252c]"}`}>
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Notification Bell button */}
          <button 
            onClick={() => addToast("No new notifications", "info")}
            className="relative p-2 border border-[#1e2028] bg-[#0d0e12] hover:bg-[#16181d] text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer"
          >
            <Bell className="w-4 h-4 text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00a3ff] rounded-full"></span>
          </button>

          {/* User Profile Avatar Badge (FB) */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileMenuOpen(!profileMenuOpen);
                setAccountMenuOpen(false);
              }}
              className="relative border border-[#1e2028] bg-[#0d0e12] hover:bg-[#16181d] px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#00a3ff] transition-colors flex items-center gap-1 cursor-pointer select-none"
            >
              <span>{userInitials}</span>
              <span className="w-1.5 h-1.5 bg-[#00a3ff] rotate-45 inline-block"></span>
            </button>

            {/* Profile Dropdown Popup Menu */}
            <AnimatePresence>
              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setProfileMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 mt-2 w-[420px] max-w-[90vw] rounded-xl border border-[#252830] bg-[#16181d] p-5 shadow-2xl z-50 text-white"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      {/* Left Column: User details & Account Summary */}
                      <div className="md:col-span-7 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#22252c] border border-white/10 flex items-center justify-center font-bold text-[#00a3ff] text-sm">
                            {userInitials}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-base leading-tight">
                              {user.username}
                            </div>
                            <button
                              onClick={() => {
                                setKycLevel(2);
                                addToast("KYC Verification Status updated", "success");
                              }}
                              className="text-emerald-400 hover:underline text-xs font-medium flex items-center gap-1 mt-0.5 cursor-pointer"
                            >
                              Verify your account &gt;
                            </button>
                          </div>
                        </div>

                        {/* Tier & Upgrade bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-[#0d0e12] border border-[#1e2028] rounded-lg px-3 py-2 text-xs flex items-center justify-between text-white font-medium">
                            <span>Starter ◆</span>
                            <span className="text-gray-400">1%</span>
                          </div>
                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              router.push("/subscribe");
                            }}
                            className="bg-[#00a3ff] hover:bg-[#0090e0] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                          >
                            UPGRADE
                          </button>
                        </div>

                        {/* Account Summary section */}
                        <div className="pt-2 space-y-2">
                          <h4 className="text-xs font-semibold text-white tracking-wide">Account Summary</h4>
                          <div className="text-xs space-y-2 text-gray-300">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total Deposits</span>
                              <span className="font-semibold text-white">${realBalance.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total Withdrawals</span>
                              <span className="font-semibold text-white">$0.00</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total Profits</span>
                              <span className="font-semibold text-white">$0.00</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total trades</span>
                              <span className="font-semibold text-white">0</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Navigation Action Menu */}
                      <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-[#252830] pt-4 md:pt-0 md:pl-4 flex flex-col justify-between space-y-4 text-xs font-medium">
                        <div className="space-y-3.5">
                          <Link
                            href="/deposit"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-400" />
                            <span>Add funds</span>
                          </Link>

                          <Link
                            href="/withdraw"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-400" />
                            <span>Withdraw</span>
                          </Link>

                          <Link
                            href="/settings"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                          >
                            <Settings className="w-4 h-4 text-gray-400" />
                            <span>Settings</span>
                          </Link>

                          <button
                            onClick={() => addToast("No new notifications", "info")}
                            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors cursor-pointer text-left w-full"
                          >
                            <Bell className="w-4 h-4 text-gray-400" />
                            <span>Notifications</span>
                          </button>
                        </div>

                        <div className="pt-6">
                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              logout();
                            }}
                            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors cursor-pointer w-full text-left"
                          >
                            <LogOut className="w-4 h-4 text-gray-400" />
                            <span>Log out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#16181d] border-r border-[#252830] z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between h-16 px-6 border-b border-[#252830]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand to-brand-glow flex items-center justify-center text-white font-bold">
                    B
                  </div>
                  <span className="text-lg font-bold tracking-tight text-white">
                    BrokerageX
                  </span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-muted-foreground hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto" onClick={() => setIsMobileMenuOpen(false)}>
                 <MobileNavItems />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileNavItems() {
  const pathname = usePathname();
  const allItems = [
    ...navItems,
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Settings", href: "/settings", icon: Settings },
  ];
  return (
    <div className="flex flex-col gap-1 p-3">
      {allItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
              isActive 
                ? "bg-brand/10 text-brand box-glow" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <Icon className={cn("w-5 h-5", isActive ? "text-brand" : "group-hover:text-brand-glow transition-colors")} />
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
