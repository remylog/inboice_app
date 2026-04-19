import type { Metadata } from "next";
import { Orbitron, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-display"
});

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Payment Log | 支払いログ",
  description: "お支払いをログで残すサービスです。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${orbitron.variable} ${notoSansJp.variable}`}>{children}</body>
    </html>
  );
}
