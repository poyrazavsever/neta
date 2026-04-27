import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mood Tracker MVP",
  description: "LocalStorage tabanli minimal mood dashboard uygulamasi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
