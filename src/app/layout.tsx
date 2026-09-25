import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  ),
  title: "Vestra — Bull vs. bear research for PreStocks",
  description: "Company headlines, PreStocks prices, and opposing AI analysis with evidence links and Solana market context.",
  icons: { icon: "/images/vestra-mark-v12.png", apple: "/images/vestra-mark-v12.png" },
  openGraph: {
    title: "Vestra — Bull vs. bear research for PreStocks",
    description: "Company headlines, PreStocks prices, and opposing AI analysis with evidence links and Solana market context.",
    siteName: "Vestra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vestra — Bull vs. bear research for PreStocks",
    description: "Company headlines, PreStocks prices, and opposing AI analysis with evidence links and Solana market context.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
