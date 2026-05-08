import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "MindSpace",
  description: "AI Destekli Kişisel Yaşam ve Planlama Dashboard'u",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={cn("font-sans dark", geist.variable)}
      suppressHydrationWarning
    >
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
