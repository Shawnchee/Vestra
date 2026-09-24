import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vestra — Evidence-led private market research",
  description: "A source-linked research desk for PreStocks on Solana.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
