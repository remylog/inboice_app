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
  title: "代理購入 請求・領収作成",
  description: "代理購入の請求書・領収書を作成し、共有できるアプリ"
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
