"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  ListChecks,
  Package,
  FileSpreadsheet,
  Store,
  Sparkles,
  Menu,
  X,
  Search,
  Plus,
  Bell,
  CheckCircle2,
} from "lucide-react";
import { useAccounting } from "@/lib/accounting-context";
import { formatIDR } from "@/lib/accounting-data";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/import", label: "Import", icon: Upload },
  { href: "/antrian", label: "Antrian", icon: ListChecks, badgeKey: "pending" },
  { href: "/stok-gudang", label: "Stok Gudang", icon: Package },
  { href: "/laporan", label: "Laporan", icon: FileSpreadsheet },
  { href: "/performa-toko", label: "Performa Toko", icon: Store },
  { href: "/asisten-ai", label: "Asisten AI", icon: Sparkles },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { summary } = useAccounting();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentNav =
    NAV_ITEMS.find((item) => item.href === pathname) || NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-[#f5f6f4] text-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200/80 z-30">
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#15803d] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              TB
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm tracking-tight leading-none">
                Topherbal
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                Bookventory Engine
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Seimbang
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#15803d] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-white" : "text-slate-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badgeKey === "pending" && summary.pendingCount > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {summary.pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="text-xs font-medium text-slate-500">
            Kredit Pajak (PPh 22)
          </div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
            {formatIDR(summary.pph22Prepaid)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
            <span>●</span> Dipotong marketplace otomatis
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-xl flex flex-col z-10">
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#15803d] flex items-center justify-center text-white font-bold text-xs">
                  TB
                </div>
                <span className="font-bold text-sm text-slate-900">
                  Topherbal · Bookventory
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                      isActive
                        ? "bg-[#15803d] text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badgeKey === "pending" && summary.pendingCount > 0 && (
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {summary.pendingCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Topbar matching the reference video */}
        <header className="sticky top-0 z-20 h-14 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-1.5 -ml-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight">
              {currentNav.label}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/antrian"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              title="Cari Transaksi / Jurnal"
            >
              <Search className="w-5 h-5" />
            </Link>
            <Link
              href="/asisten-ai"
              className="p-2 rounded-lg text-[#15803d] hover:bg-emerald-50 transition-colors"
              title="Catat Cepat via AI"
            >
              <Plus className="w-5 h-5 stroke-[2.2]" />
            </Link>
            <Link
              href="/stok-gudang"
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              title="Peringatan Stok Kritis"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </Link>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 px-4 py-5 lg:px-8 lg:py-6 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
