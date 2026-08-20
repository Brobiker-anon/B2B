import { LucideIcon } from "lucide-react";
import GlassCard from "./GlassCard";

interface StatWidgetProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
}

export default function StatWidget({ title, value, change, icon: Icon }: StatWidgetProps) {
  const isPositive = change >= 0;

  return (
    <GlassCard hoverEffect className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm font-medium">{title}</span>
        <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-brand" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className={`text-sm font-medium flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{change}%
          <span className="text-muted-foreground ml-1">vs last month</span>
        </div>
      </div>
    </GlassCard>
  );
}
