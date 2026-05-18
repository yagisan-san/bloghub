import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlogHub - 発信をひとつのホームに",
  description: "散らばった発信を、ひとつのホームに。無料ブログをサイトのように整理して見せるツール。",
  openGraph: {
    title: "BlogHub",
    description: "散らばった発信を、ひとつのホームに。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
