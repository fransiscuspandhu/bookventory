import type { Metadata } from "next";
import "./globals.css";
import { AccountingProvider } from "@/lib/accounting-context";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Bookventory — Pembukuan Otomatis, HPP & Pajak Marketplace",
  description:
    "AI-Powered Double-Entry Accounting, Tax (PPh 22/PPN) & Perpetual Inventory Engine untuk Toko Online & UMKM.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <AccountingProvider>
          <AppShell>{children}</AppShell>
        </AccountingProvider>
      </body>
    </html>
  );
}
