"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Landmark,
  Briefcase,
  CreditCard,
  ShoppingBag,
  Building2,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  ListChecks,
  Upload,
  Sparkles,
  Filter,
} from "lucide-react";
import { useAccounting } from "@/lib/accounting-context";
import { formatIDR, SourceChannel } from "@/lib/accounting-data";

const DAILY_SALES_CHART = [
  { day: "1", val: 2.8 },
  { day: "2", val: 3.1 },
  { day: "3", val: 2.9 },
  { day: "4", val: 3.8 },
  { day: "5", val: 4.5 },
  { day: "6", val: 5.2 },
  { day: "7", val: 4.9 },
  { day: "8", val: 5.6 },
  { day: "9", val: 5.4 },
  { day: "10", val: 3.2 },
  { day: "11", val: 5.3 },
  { day: "12", val: 3.6 },
  { day: "13", val: 3.9 },
  { day: "14", val: 4.4 },
  { day: "15", val: 3.7 },
  { day: "16", val: 3.8 },
  { day: "17", val: 4.1 },
  { day: "18", val: 3.5 },
  { day: "19", val: 3.9 },
  { day: "20", val: 3.3 },
  { day: "21", val: 4.0 },
  { day: "22", val: 3.6 },
  { day: "23", val: 2.7 },
  { day: "24", val: 1.9 },
];

const SOURCE_OPTIONS: { id: "ALL" | SourceChannel; label: string }[] = [
  { id: "ALL", label: "Semua Sumber (Overall)" },
  { id: "TikTok", label: "TikTok Shop" },
  { id: "Shopee", label: "Shopee" },
  { id: "Tokopedia", label: "Tokopedia" },
  { id: "POS / Custom", label: "POS / Custom Excel" },
];

export default function DashboardPage() {
  const {
    activeCompany,
    summary,
    selectedSourceFilter,
    setSelectedSourceFilter,
    sourceBreakdown,
  } = useAccounting();
  const [selectedMonth, setSelectedMonth] = useState("Nov 2026");

  return (
    <div className="space-y-5">
      {/* Header Row matching video 0:05 + Active Company Name */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Ringkasan posisi keuangan {activeCompany.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Diperbarui otomatis dari jurnal · NPWP {activeCompany.taxIdNpwp} ·
            Status Neraca:{" "}
            <span className="text-emerald-700 font-semibold">
              {summary.isBalanced ? "Seimbang (Debit = Kredit)" : "Selisih"}
            </span>
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="Nov 2026">Nov 2026</option>
            <option value="Okt 2026">Okt 2026</option>
          </select>
        </div>
      </div>

      {/* Filter Kategori Sumber Data (Overall vs TikTok vs Shopee vs Tokopedia vs Custom) */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Filter className="w-3.5 h-3.5 text-[#15803d]" />
          <span>Kategori Sumber Data:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {SOURCE_OPTIONS.map((opt) => {
            const isActive = selectedSourceFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedSourceFilter(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#15803d] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Action Banner if Drafts are Pending */}
      {summary.pendingCount > 0 && (
        <div className="bg-emerald-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="text-sm font-semibold">
                Ada {summary.pendingCount} Draft Jurnal menunggu persetujuan
                {selectedSourceFilter !== "ALL"
                  ? ` (Kategori: ${selectedSourceFilter})`
                  : ""}
              </div>
              <div className="text-xs text-emerald-200">
                Termasuk settlement TikTok & Shopee, PPh 22, HPP otomatis, dan
                input AI.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/import"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Import Excel
            </Link>
            <Link
              href="/antrian"
              className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold transition-colors flex items-center gap-1"
            >
              Tinjau Antrian
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 8 Financial Position Cards Grid matching video 0:05 and 1:21 */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
        <Link
          href="/laporan"
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-emerald-600/40 transition-all"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </span>
            <span>Total Aset (Overall PT)</span>
          </div>
          <div className="text-base sm:text-xl font-bold text-slate-900 mt-3 tracking-tight">
            {formatIDR(summary.totalAssets)}
          </div>
          <div className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-0.5">
            <span>↑ 21,2%</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 line-clamp-1">
            Kas, piutang, persediaan, aset tetap
          </div>
        </Link>

        <Link
          href="/laporan"
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-emerald-600/40 transition-all"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </span>
            <span>Total Modal (Overall PT)</span>
          </div>
          <div className="text-base sm:text-xl font-bold text-slate-900 mt-3 tracking-tight">
            {formatIDR(summary.totalEquity)}
          </div>
          <div className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-0.5">
            <span>↑ 21,2%</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 line-clamp-1">
            Modal disetor & laba ditahan
          </div>
        </Link>

        <Link
          href="/laporan"
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-emerald-600/40 transition-all"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </span>
            <span>Total Utang</span>
          </div>
          <div className="text-base sm:text-xl font-bold text-slate-900 mt-3 tracking-tight">
            {formatIDR(summary.totalLiabilities)}
          </div>
          <div className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-0.5">
            <span>↑ 16,9%</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 line-clamp-1">
            Terbesar: Iklan TikTok (GMV Pay)
          </div>
        </Link>

        <Link
          href="/performa-toko"
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-emerald-600/40 transition-all"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </span>
            <span>
              Dana di Marketplace{" "}
              {selectedSourceFilter !== "ALL"
                ? `(${selectedSourceFilter})`
                : ""}
            </span>
          </div>
          <div className="text-base sm:text-xl font-bold text-slate-900 mt-3 tracking-tight">
            {formatIDR(summary.marketplaceFunds)}
          </div>
          <div className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-0.5">
            <span>↓ 18,7%</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 line-clamp-1">
            Saldo Penjual + piutang pra-cut-off
          </div>
        </Link>

        <Link
          href="/laporan"
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-emerald-600/40 transition-all"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </span>
            <span>Kas & Bank</span>
          </div>
          <div className="text-base sm:text-xl font-bold text-slate-900 mt-3 tracking-tight">
            {formatIDR(summary.cashAndBank)}
          </div>
          <div className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-0.5">
            <span>↑ 28,8%</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 line-clamp-1">
            Kas dan rekening bank PT
          </div>
        </Link>

        <Link
          href="/laporan"
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-emerald-600/40 transition-all"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span>
              Penjualan Bersih{" "}
              {selectedSourceFilter !== "ALL"
                ? `(${selectedSourceFilter})`
                : "(Overall)"}
            </span>
          </div>
          <div className="text-base sm:text-xl font-bold text-slate-900 mt-3 tracking-tight">
            {formatIDR(summary.netSales)}
          </div>
          <div className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-0.5">
            <span>↑ 6,9%</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 line-clamp-1">
            November 2026 · setelah retur
          </div>
        </Link>

        <Link
          href="/laporan"
          className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-emerald-600/40 transition-all"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </span>
            <span>
              Laba (Rugi) Bersih{" "}
              {selectedSourceFilter !== "ALL"
                ? `(${selectedSourceFilter})`
                : "(Overall)"}
            </span>
          </div>
          <div className="text-base sm:text-xl font-bold text-slate-900 mt-3 tracking-tight">
            {formatIDR(summary.netIncome)}
          </div>
          <div className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-0.5">
            <span>↑ 42,8%</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            November 2026 · penjualan - HPP ({formatIDR(summary.totalHpp)}) -
            beban
          </div>
        </Link>

        <Link
          href="/laporan"
          className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-2xs hover:border-emerald-600/50 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span>
                  HPP & Pajak PPh 22{" "}
                  {selectedSourceFilter !== "ALL"
                    ? `(${selectedSourceFilter})`
                    : "(Overall)"}
                </span>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                Otomatis
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <div className="text-[11px] text-slate-500">Total HPP</div>
                <div className="text-sm font-bold text-slate-900">
                  {formatIDR(summary.totalHpp)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Kredit PPh 22</div>
                <div className="text-sm font-bold text-emerald-700">
                  {formatIDR(summary.pph22Prepaid)}
                </div>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-2">
            Lihat Breakdown Sumber Data di Laporan →
          </div>
        </Link>
      </div>

      {/* Ringkasan Kontribusi Per Kategori Sumber Data (TikTok vs Shopee vs Tokopedia vs Custom vs Overall) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Breakdown Per Kategori Sumber Data (Source Channel)
            </h3>
            <p className="text-xs text-slate-500">
              Perbandingan Penjualan Bersih, HPP, Fee Marketplace, Pajak PPh 22,
              dan Laba per sumber laporan vs Overall
            </p>
          </div>
          <Link
            href="/laporan"
            className="text-xs font-semibold text-[#15803d] hover:underline"
          >
            Buka Laporan Lengkap →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[11px]">
                <th className="py-2 pr-2">Sumber Data</th>
                <th className="py-2 px-2 text-right">Order</th>
                <th className="py-2 px-2 text-right">Penjualan Bersih</th>
                <th className="py-2 px-2 text-right">HPP (5101)</th>
                <th className="py-2 px-2 text-right">Fee & Iklan</th>
                <th className="py-2 px-2 text-right">PPh 22 (1218)</th>
                <th className="py-2 pl-2 text-right">Laba Bersih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sourceBreakdown.map((row) => (
                <tr
                  key={row.channel}
                  onClick={() => setSelectedSourceFilter(row.channel)}
                  className={`cursor-pointer transition-colors ${
                    selectedSourceFilter === row.channel
                      ? "bg-emerald-50/80 font-semibold"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <td className="py-2.5 pr-2 font-bold text-slate-900">
                    {row.channel}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono">
                    {row.orderCount}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono">
                    {formatIDR(row.netSales)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                    {formatIDR(row.hpp)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                    {formatIDR(
                      row.marketplaceFee + row.adExpense + row.operatingExpense
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-amber-800 font-semibold">
                    {formatIDR(row.pph22TaxCredit)}
                  </td>
                  <td
                    className={`py-2.5 pl-2 text-right font-mono font-bold ${
                      row.netProfit >= 0 ? "text-[#15803d]" : "text-rose-600"
                    }`}
                  >
                    {formatIDR(row.netProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr
                onClick={() => setSelectedSourceFilter("ALL")}
                className="border-t-2 border-slate-200 font-bold text-slate-900 bg-slate-50/80 cursor-pointer"
              >
                <td className="py-2.5 pr-2">OVERALL (SEMUA SUMBER)</td>
                <td className="py-2.5 px-2 text-right font-mono">
                  {sourceBreakdown.reduce((a, b) => a + b.orderCount, 0)}
                </td>
                <td className="py-2.5 px-2 text-right font-mono">
                  {formatIDR(
                    sourceBreakdown.reduce((a, b) => a + b.netSales, 0)
                  )}
                </td>
                <td className="py-2.5 px-2 text-right font-mono">
                  {formatIDR(sourceBreakdown.reduce((a, b) => a + b.hpp, 0))}
                </td>
                <td className="py-2.5 px-2 text-right font-mono">
                  {formatIDR(
                    sourceBreakdown.reduce(
                      (a, b) =>
                        a +
                        b.marketplaceFee +
                        b.adExpense +
                        b.operatingExpense,
                      0
                    )
                  )}
                </td>
                <td className="py-2.5 px-2 text-right font-mono text-amber-800">
                  {formatIDR(
                    sourceBreakdown.reduce((a, b) => a + b.pph22TaxCredit, 0)
                  )}
                </td>
                <td className="py-2.5 pl-2 text-right font-mono text-[#15803d]">
                  {formatIDR(
                    sourceBreakdown.reduce((a, b) => a + b.netProfit, 0)
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Penjualan Bulan Ini Bar Chart matching video 0:06 */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="text-xs font-medium text-slate-500">
              Penjualan Bulan Ini{" "}
              {selectedSourceFilter !== "ALL"
                ? `(Sumber: ${selectedSourceFilter})`
                : "(Overall Semua Sumber)"}
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {formatIDR(summary.netSales)}
            </div>
          </div>
          <div className="text-xs text-slate-500">{activeCompany.name}</div>
        </div>

        <div className="mt-6">
          <div className="flex items-end gap-1.5 h-36 pt-4 border-b border-slate-100">
            {DAILY_SALES_CHART.map((bar) => {
              const heightPct = Math.round((bar.val / 6.0) * 100);
              return (
                <div
                  key={bar.day}
                  className="flex-1 flex flex-col items-center gap-1 group"
                >
                  <div className="w-full bg-slate-100 rounded-t-md h-28 flex items-end overflow-hidden">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-[#10b981] group-hover:bg-[#15803d] rounded-t-md transition-all"
                      title={`Tanggal ${bar.day} Nov: Rp ${bar.val} jt`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {bar.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
