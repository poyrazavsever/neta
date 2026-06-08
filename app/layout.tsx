import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";
import { OfflineIndicator } from "@/components/ui/offline-indicator";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Revanios",
  description: "Self-hosted freelancer operating dashboard",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Revanios",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={cn("font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body>
        {children}
        <OfflineIndicator />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
