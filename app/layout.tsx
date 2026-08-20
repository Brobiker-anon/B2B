import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import NavigationLogger from "@/components/layout/NavigationLogger";
import { AppProvider } from "@/context/AppContext";
import ToastContainer from "@/components/layout/ToastContainer";

export const metadata: Metadata = {
  title: "B2B Brokerage Platform",
  description: "Premium fintech dashboard and modern brokerage platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans min-h-screen flex bg-[#06070a] text-white">
        <AppProvider>
          <NavigationLogger />
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <Topbar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}


