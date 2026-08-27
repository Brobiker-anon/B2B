"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Wallet, 
  MinusCircle,
  ShieldCheck, 
  TrendingUp, 
  PieChart, 
  Users, 
  LineChart, 
  Cpu, 
  ArrowRightLeft, 
  Building, 
  Crown, 
  Radio, 
  Lock, 
  Link as LinkIcon, 
  Settings, 
  MessageSquare,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useApp } from "@/context/AppContext";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Deposit", href: "/deposit", icon: Wallet },
  { name: "Withdraw", href: "/withdraw", icon: MinusCircle },
  { name: "Cold Storage", href: "/cold-storage", icon: ShieldCheck },
  { name: "Investing", href: "/investing", icon: TrendingUp },
  { name: "Assets", href: "/assets", icon: PieChart },
  { name: "Copy Trading", href: "/copy-trading", icon: Users },
  { name: "Markets", href: "/markets", icon: LineChart },
  { name: "Mining", href: "/mining", icon: Cpu },
  { name: "Trade", href: "/trade", icon: ArrowRightLeft },
  { name: "Real Estate", href: "/real-estate", icon: Building },
  { name: "Subscribe", href: "/subscribe", icon: Crown },
  { name: "Signals", href: "/signals", icon: Radio },
  { name: "Stake", href: "/stake", icon: Lock },
  { name: "Referrals", href: "/referrals", icon: LinkIcon },
];

const bottomNavItems = [
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isLoading } = useApp();

  if (
    isLoading || 
    !user || 
    pathname === "/signin" || 
    pathname === "/signup" || 
    pathname?.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-white/10 glass-panel h-screen sticky top-0 left-0">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand to-brand-glow flex items-center justify-center text-white font-bold group-hover:animate-pulse-glow">
            B
          </div>
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-glow transition-all">
            BrokerageX
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar flex flex-col gap-1">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
          Menu
        </div>
        {navItems.map((item) => {
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

      <div className="p-3 border-t border-white/10">
        {bottomNavItems.map((item) => {
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
    </aside>
  );
}
