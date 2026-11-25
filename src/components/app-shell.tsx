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
  Building2,
  ChevronDown,
  UserCheck,
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
  const {
    companies,
    activeCompany,
    switchCompany,
    addCompany,
    summary,
  } = useAccounting();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);

  const [newCompName, setNewCompName] = useState("");
  const [newCompNpwp, setNewCompNpwp] = useState("01.992.441.8-011.000");
  const [newCompIndustry, setNewCompIndustry] = useState(
    "Retail & Marketplace (Shopee & TikTok)"
  );

  const currentNav =
    NAV_ITEMS.find((item) => item.href === pathname) || NAV_ITEMS[0];

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) return;
    addCompany({
      name: newCompName.trim(),
      taxIdNpwp: newCompNpwp.trim(),
      industry: newCompIndustry.trim(),
    });
    setNewCompName("");
    setShowAddCompanyModal(false);
    setCompanyDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f4] text-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200/80 z-30">
        {/* Multi-Company Switcher Header (1 Login = Multiple Companies) */}
        <div className="p-3.5 border-b border-slate-100 relative">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 px-1 mb-1.5">
            <span className="flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-emerald-700" />
              Akun: Pandhu (Multi-PT)
            </span>
            <span className="text-emerald-700 font-semibold">
              {companies.length} Perusahaan
            </span>
          </div>

          <button
            onClick={() => setCompanyDropdownOpen((o) => !o)}
            className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-emerald-600/50 bg-slate-50/70 flex items-center justify-between gap-2 transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#15803d] flex items-center justify-center text-white font-bold text-xs shadow-2xs shrink-0">
                {activeCompany.shortCode}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-xs truncate">
                  {activeCompany.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  NPWP: {activeCompany.taxIdNpwp}
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {/* Dropdown Menu for Switching Company */}
          {companyDropdownOpen && (
            <div className="absolute left-3.5 right-3.5 top-24 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pilih Perusahaan Aktif
              </div>
              {companies.map((comp) => {
                const isSelected = comp.id === activeCompany.id;
                return (
                  <button
                    key={comp.id}
                    onClick={() => {
                      switchCompany(comp.id);
                      setCompanyDropdownOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50 text-[#15803d] font-bold"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-emerald-700/10 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {comp.shortCode}
                      </span>
                      <div className="truncate">
                        <div className="truncate">{comp.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal truncate">
                          {comp.industry}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0" />
                    )}
                  </button>
                );
              })}
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setCompanyDropdownOpen(false);
                    setShowAddCompanyModal(true);
                  }}
                  className="w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-[#15803d] hover:bg-emerald-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Perusahaan Baru</span>
                </button>
              </div>
            </div>
          )}
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
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Kredit Pajak (PPh 22)
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Seimbang
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900 mt-1 font-mono">
            {formatIDR(summary.pph22Prepaid)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
            <span>●</span> {activeCompany.name}
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
          <div className="relative w-72 max-w-[82vw] bg-white h-full shadow-xl flex flex-col z-10">
            <div className="p-4 border-b border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Perusahaan Aktif (1 Login)
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <select
                value={activeCompany.id}
                onChange={(e) => switchCompany(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setShowAddCompanyModal(true);
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-emerald-50 text-[#15803d] text-xs font-semibold flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Perusahaan Baru</span>
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
        {/* Topbar matching the reference video + Active Company Selector */}
        <header className="sticky top-0 z-20 h-14 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-1.5 -ml-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight truncate">
              {currentNav.label}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Company Switcher Pill on Topbar */}
            <div className="flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/80 rounded-full px-2.5 py-1 text-xs">
              <Building2 className="w-3.5 h-3.5 text-[#15803d] shrink-0" />
              <select
                value={activeCompany.id}
                onChange={(e) => switchCompany(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[200px] truncate"
                title="Ganti Perusahaan Aktif (Multi-Company)"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

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

      {/* Modal Tambah Perusahaan Baru (Multi-Company per Account) */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCompany}
            className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#15803d]" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Tambah Perusahaan Baru (1 Akun Login)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCompanyModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nama Perusahaan (PT / CV / Brand)
                </label>
                <input
                  type="text"
                  required
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  placeholder="mis. PT Berkah Kosmetik Indonesia"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  NPWP Perusahaan
                </label>
                <input
                  type="text"
                  value={newCompNpwp}
                  onChange={(e) => setNewCompNpwp(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-mono focus:outline-none focus:border-[#15803d]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Kategori Bisnis & Channel Utama
                </label>
                <input
                  type="text"
                  value={newCompIndustry}
                  onChange={(e) => setNewCompIndustry(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-none focus:border-[#15803d]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCompanyModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white text-xs font-semibold cursor-pointer"
              >
                Buat & Aktifkan Perusahaan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
