import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import NavigationLogger from "@/components/layout/NavigationLogger";
import { AppProvider } from "@/context/AppContext";
import ToastContainer from "@/components/layout/ToastContainer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "ApexVeltrix",
  description: "ApexVeltrix - Premium fintech dashboard and modern trading platform",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
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


