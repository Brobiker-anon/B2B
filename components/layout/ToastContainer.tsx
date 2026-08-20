"use client";

import { useApp } from "@/context/AppContext";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = Info;
          let iconColor = "text-blue-400";
          let borderColor = "border-blue-500/30";
          let bgColor = "bg-blue-500/10";
          
          if (toast.type === "success") {
            Icon = CheckCircle;
            iconColor = "text-emerald-400";
            borderColor = "border-emerald-500/30";
            bgColor = "bg-emerald-500/10";
          } else if (toast.type === "error") {
            Icon = AlertTriangle;
            iconColor = "text-red-400";
            borderColor = "border-red-500/30";
            bgColor = "bg-red-500/10";
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`flex items-start gap-3 p-4 rounded-xl border ${borderColor} ${bgColor} backdrop-blur-md shadow-lg shadow-black/40`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-sm font-medium text-slate-100">{toast.message}</div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
