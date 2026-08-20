import { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverEffect?: boolean;
}

export default function GlassCard({ children, className, hoverEffect = false, ...props }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "glass rounded-xl p-6 transition-all duration-300",
        hoverEffect && "hover:bg-white/10 hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.15)] hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

