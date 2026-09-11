import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "今日の和茶タイプ診断｜祇園茶寮 × タニタカフェ 柏の葉店",
  description:
    "6つの質問から、今日のあなたにぴったりの和茶タイプとおすすめの一杯が見つかります。約30秒・全6問。",
  robots: { index: false, follow: false },
  openGraph: {
    title: "今日の和茶タイプ診断",
    description: "6つの和茶から、今日のあなたにぴったりの一杯を。",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f3eee2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
