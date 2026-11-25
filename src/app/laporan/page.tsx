"use client";

import React, { useState } from "react";
import {
  Landmark,
  TrendingUp,
  Gauge,
  LineChart,
  Wallet,
  BookOpen,
  CheckCircle2,
  CreditCard,
  Briefcase,
  Building2,
} from "lucide-react";
import { useAccounting } from "@/lib/accounting-context";
import { formatIDR } from "@/lib/accounting-data";

type ReportTab =
  | "NERACA"
  | "LABA_RUGI"
  | "CEK_KPI"
  | "FORECAST"
  | "ARUS_KAS"
  | "BUKU_BESAR";

export default function LaporanPage() {
  const { accounts, summary } = useAccounting();
  const [activeTab, setActiveTab] = useState<ReportTab>("NERACA");
  const [periodMode, setPeriodMode] = useState("Bulan");
  const [selectedMonth, setSelectedMonth] = useState("November 2026");

  // Forecast interactive inputs matching video 1:16 - 1:20
  const [adBudgetInput, setAdBudgetInput] = useState(10400000);
  const [fixedCostInput, setFixedCostInput] = useState(11144148);
  const [fulfillmentPerOrder, setFulfillmentPerOrder] = useState(0);
  const [forecastScenario, setForecastScenario] = useState<
    "Rendah" | "Normal" | "Tinggi"
  >("Normal");

  const cashAccounts = accounts.filter((a) => a.category === "ASSET_CASH");
  const recInvAccounts = accounts.filter(
    (a) => a.category === "ASSET_RECEIVABLE_INVENTORY"
  );
  const fixedAssetAccounts = accounts.filter(
    (a) => a.category === "ASSET_FIXED"
  );
  const liabilityAccounts = accounts.filter(
    (a) => a.category === "LIABILITY_SHORT"
  );
  const equityAccounts = accounts.filter((a) => a.category === "EQUITY");

  const subtotalCash = cashAccounts.reduce(
    (acc, a) => acc + a.closingBalance,
    0
  );
  const subtotalRecInv = recInvAccounts.reduce(
    (acc, a) => acc + a.closingBalance,
    0
  );

  // Forecast multiplier
  const mult =
    forecastScenario === "Rendah"
      ? 0.85
      : forecastScenario === "Tinggi"
      ? 1.25
      : 1.0;
  const projectedOmzet = Math.round(adBudgetInput * 2.0865 * mult);
  const projectedOrders = Math.round((projectedOmzet / 75874) * mult);
  const projectedFee = Math.round(projectedOmzet * 0.122);
  const projectedHpp = Math.round(projectedOmzet * 0.162);
  const projectedProfit =
    projectedOmzet -
    projectedFee -
    projectedHpp -
    adBudgetInput -
    fixedCostInput -
    projectedOrders * fulfillmentPerOrder;

  return (
    <div className="space-y-5">
      {/* Horizontal Scrollable Tab Bar matching video 1:01 - 1:15 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "NERACA", label: "Neraca", icon: Landmark },
          { id: "LABA_RUGI", label: "Laba Rugi", icon: TrendingUp },
          { id: "CEK_KPI", label: "Cek KPI", icon: Gauge },
          { id: "FORECAST", label: "Forecast", icon: LineChart },
          { id: "ARUS_KAS", label: "Arus Kas", icon: Wallet },
          { id: "BUKU_BESAR", label: "Buku Besar", icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportTab)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-50 text-[#15803d] border border-emerald-300 shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* KPI Traffic Light Pill Bar */}
      {(activeTab === "NERACA" ||
        activeTab === "LABA_RUGI" ||
        activeTab === "CEK_KPI") && (
        <div className="bg-white rounded-2xl px-4 py-3 border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-4 text-xs">
          <span className="font-bold text-slate-700">KPI:</span>
          <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            {activeTab === "LABA_RUGI" ? "5 hijau" : "4 hijau"}
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />0 kuning
          </span>
          <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            {activeTab === "LABA_RUGI" ? "0 merah" : "1 merah"}
          </span>
        </div>
      )}

      {/* Filter Card for Neraca & Laba Rugi matching video 1:01 */}
      {(activeTab === "NERACA" || activeTab === "LABA_RUGI") && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {["Bulan", "Kuartal", "Tahun", "Rentang Tanggal"].map((m) => (
              <button
                key={m}
                onClick={() => setPeriodMode(m)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  periodMode === m
                    ? "bg-[#15803d] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-medium bg-white"
          >
            <option value="November 2026">November 2026</option>
            <option value="Oktober 2026">Oktober 2026</option>
          </select>

          <button className="w-full py-2.5 rounded-xl bg-[#15803d] text-white font-semibold text-xs sm:text-sm">
            Terapkan
          </button>
        </div>
      )}

      {/* TAB 1: NERACA matching video 0:33 - 0:42 & 1:01 - 1:08 */}
      {activeTab === "NERACA" && (
        <div className="space-y-4">
          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Landmark className="w-4 h-4" />
                </span>
                <span>Aset</span>
              </div>
              <div className="text-base sm:text-xl font-bold text-slate-900">
                {formatIDR(summary.totalAssets)}
              </div>
              <div className="text-[11px] text-slate-400">
                Total aktiva · saldo akhir
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Awal</span>
                  <span className="font-mono font-medium">Rp237.264.616</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Berjalan</span>
                  <span className="font-mono font-medium">Rp50.227.814</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Akhir</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatIDR(summary.totalAssets)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </span>
                <span>Liabilitas</span>
              </div>
              <div className="text-base sm:text-xl font-bold text-slate-900">
                {formatIDR(summary.totalLiabilities)}
              </div>
              <div className="text-[11px] text-slate-400">
                Utang · saldo akhir
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Awal</span>
                  <span className="font-mono font-medium">Rp2.375.454</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Berjalan</span>
                  <span className="font-mono font-medium">Rp401.136</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Akhir</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatIDR(summary.totalLiabilities)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </span>
                <span>Ekuitas</span>
              </div>
              <div className="text-base sm:text-xl font-bold text-slate-900">
                {formatIDR(summary.totalEquity)}
              </div>
              <div className="text-[11px] text-slate-400">
                Modal & laba · saldo akhir
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Awal</span>
                  <span className="font-mono font-medium">Rp234.889.162</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Berjalan</span>
                  <span className="font-mono font-medium">Rp49.826.678</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Akhir</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatIDR(summary.totalEquity)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Neraca Seimbang Highlight Card matching video 1:06 */}
            <div className="bg-white rounded-2xl p-4 border-2 border-amber-400 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <span>Status Neraca</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-emerald-700 mt-3">
                  {summary.isBalanced ? "Seimbang ✓" : "Tidak Seimbang"}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Aset = Liabilitas + Ekuitas
                </div>
              </div>
              <div className="text-[11px] text-emerald-700 font-medium mt-3">
                Siap dibawa ke akuntan atau petugas pajak
              </div>
            </div>
          </div>

          {/* Detailed Aktiva Table matching video 0:34 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              <span>Subtotal Kas & Bank</span>
              <span className="font-mono">{formatIDR(subtotalCash)}</span>
            </div>

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-1">
              Piutang, Persediaan & Dibayar di Muka
            </div>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              {recInvAccounts.map((acc) => {
                const isPph22 = acc.code === "1218";
                return (
                  <div
                    key={acc.code}
                    className={`py-2.5 flex items-center justify-between ${
                      isPph22
                        ? "bg-amber-50/90 -mx-2 px-2 rounded-xl border border-amber-300"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-xs">
                        {acc.code}
                      </span>
                      <span className="font-medium text-slate-800">
                        {acc.name}
                      </span>
                    </div>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatIDR(acc.closingBalance)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>Subtotal Piutang, Persediaan & Dibayar di Muka</span>
              <span className="font-mono">{formatIDR(subtotalRecInv)}</span>
            </div>

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">
              Aset Tetap
            </div>
            {fixedAssetAccounts.map((acc) => (
              <div
                key={acc.code}
                className="py-2 flex items-center justify-between text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-xs">
                    {acc.code}
                  </span>
                  <span className="font-medium text-slate-800">{acc.name}</span>
                </div>
                <span className="font-mono font-semibold text-slate-900">
                  {formatIDR(acc.closingBalance)}
                </span>
              </div>
            ))}

            <div className="flex justify-between text-sm sm:text-base font-bold text-slate-900 pt-3 border-t-2 border-slate-200">
              <span>Total Aktiva</span>
              <span className="font-mono">{formatIDR(summary.totalAssets)}</span>
            </div>
          </div>

          {/* Detailed Pasiva & Modal Table matching video 0:41 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Pasiva & Modal
            </h3>

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Utang Jangka Pendek
            </div>
            {liabilityAccounts.map((acc) => (
              <div
                key={acc.code}
                className="py-2.5 flex items-center justify-between text-xs sm:text-sm bg-amber-50/70 -mx-2 px-2 rounded-xl border border-amber-300"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-xs">
                    {acc.code}
                  </span>
                  <span className="font-medium text-slate-800">{acc.name}</span>
                </div>
                <span className="font-mono font-semibold text-slate-900">
                  {formatIDR(acc.closingBalance)}
                </span>
              </div>
            ))}

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">
              Modal & Ekuitas
            </div>
            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              {equityAccounts.map((acc) => (
                <div
                  key={acc.code}
                  className="py-2.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-xs">
                      {acc.code}
                    </span>
                    <span className="font-medium text-slate-800">
                      {acc.name}
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatIDR(acc.closingBalance)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-sm sm:text-base font-bold text-slate-900 pt-3 border-t-2 border-slate-200">
              <span>Total Pasiva & Modal</span>
              <span className="font-mono">
                {formatIDR(summary.totalLiabilities + summary.totalEquity)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LABA RUGI matching video 1:03 */}
      {activeTab === "LABA_RUGI" && (
        <div className="grid grid-cols-2 gap-3.5">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="text-xs font-medium text-slate-600">Pendapatan</div>
            <div className="text-base sm:text-xl font-bold text-slate-900">
              {formatIDR(summary.netSales)}
            </div>
            <div className="text-[11px] text-slate-400">
              Penjualan bersih · periode pilihan
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Awal</span>
                <span>Rp86.793.173</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Berjalan</span>
                <span>{formatIDR(summary.netSales)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400 font-sans">Akhir</span>
                <span>{formatIDR(86793173 + summary.netSales)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="text-xs font-medium text-slate-600">Laba Kotor</div>
            <div className="text-base sm:text-xl font-bold text-slate-900">
              {formatIDR(summary.grossProfit)}
            </div>
            <div className="text-[11px] text-slate-400">
              Setelah HPP {formatIDR(summary.totalHpp)}
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Awal</span>
                <span>Rp72.767.917</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Berjalan</span>
                <span>{formatIDR(summary.grossProfit)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400 font-sans">Akhir</span>
                <span>{formatIDR(72767917 + summary.grossProfit)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="text-xs font-medium text-slate-600">Beban</div>
            <div className="text-base sm:text-xl font-bold text-slate-900">
              {formatIDR(summary.totalOperatingExpense)}
            </div>
            <div className="text-[11px] text-slate-400">
              Di luar HPP · periode pilihan
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-emerald-300 shadow-2xs space-y-2">
            <div className="text-xs font-medium text-emerald-800">
              Laba (Rugi) Bersih
            </div>
            <div className="text-base sm:text-xl font-bold text-[#15803d]">
              {formatIDR(summary.netIncome)}
            </div>
            <div className="text-[11px] text-slate-400">
              Pendapatan − HPP − beban
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CEK KPI matching video 1:13 - 1:14 */}
      {activeTab === "CEK_KPI" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="text-xs sm:text-sm font-bold text-slate-900">
              KPI Neraca ·{" "}
              <span className="font-normal text-slate-500">
                % dari total aset per 24 November 2026
              </span>
            </div>
            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="font-semibold">Kas & Bank ↑</span>
                <div className="text-right font-mono">
                  <div className="font-bold">{formatIDR(subtotalCash)}</div>
                  <div className="text-[11px] text-emerald-700">90,6%</div>
                </div>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-semibold">
                  Piutang (termasuk Saldo Penjual) ↓
                </span>
                <div className="text-right font-mono">
                  <div className="font-bold">
                    {formatIDR(summary.marketplaceFunds)}
                  </div>
                  <div className="text-[11px] text-emerald-700">1,5%</div>
                </div>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-semibold">Persediaan ↓</span>
                <div className="text-right font-mono">
                  <div className="font-bold">Rp5.553.161</div>
                  <div className="text-[11px] text-rose-600">1,9% (Kritis)</div>
                </div>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-semibold">
                  Beban & Pajak PPh 22 dibayar dimuka
                </span>
                <div className="text-right font-mono">
                  <div className="font-bold">
                    {formatIDR(summary.pph22Prepaid + 196861)}
                  </div>
                  <div className="text-[11px] text-emerald-700">0,4%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="text-xs sm:text-sm font-bold text-slate-900">
              KPI Laba Rugi ·{" "}
              <span className="font-normal text-slate-500">
                % dari Omzet (41xx)
              </span>
            </div>
            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="font-semibold">HPP ↓</span>
                <span className="font-mono font-bold text-emerald-700">
                  {formatIDR(summary.totalHpp)} (16,2%)
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-semibold">Margin Kotor ↑</span>
                <span className="font-mono font-bold text-emerald-700">
                  {formatIDR(summary.grossProfit)} (83,8%)
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-semibold">Fee/komisi marketplace ↓</span>
                <span className="font-mono font-bold">
                  Rp11.374.824 (12,2%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FORECAST matching video 1:15 - 1:20 */}
      {activeTab === "FORECAST" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              {["1 bln", "2 bln", "3 bln"].map((m) => (
                <button
                  key={m}
                  className={`px-3 py-1 rounded-lg ${
                    m === "1 bln"
                      ? "bg-[#15803d] text-white"
                      : "text-slate-600"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              {(["Rendah", "Normal", "Tinggi"] as const).map((sc) => (
                <button
                  key={sc}
                  onClick={() => setForecastScenario(sc)}
                  className={`px-3 py-1 rounded-lg cursor-pointer ${
                    forecastScenario === sc
                      ? "bg-[#15803d] text-white"
                      : "text-slate-600"
                  }`}
                >
                  {sc}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Omzet</div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                {formatIDR(projectedOmzet)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                1 bulan, setelah retur
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Order</div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                {projectedOrders}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {Math.round(projectedOrders * 1.56)} produk
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Laba</div>
              <div className="text-lg sm:text-xl font-bold text-[#15803d] mt-1">
                {formatIDR(projectedProfit)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {Math.round((projectedProfit / projectedOmzet) * 100)}% dari
                omzet
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">
                Kas terendah
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                Rp260,8 jt
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                akhir Rp273,7 jt
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Budget iklan (per 30 hari)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Budget iklan total (Rp)
                </label>
                <input
                  type="number"
                  value={adBudgetInput}
                  onChange={(e) => setAdBudgetInput(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Biaya tetap per 30 hari (Rp)
                </label>
                <input
                  type="number"
                  value={fixedCostInput}
                  onChange={(e) => setFixedCostInput(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Fulfillment per order (Rp)
                </label>
                <input
                  type="number"
                  value={fulfillmentPerOrder}
                  onChange={(e) =>
                    setFulfillmentPerOrder(Number(e.target.value))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ARUS KAS matching video 1:04 */}
      {activeTab === "ARUS_KAS" && (
        <div className="grid grid-cols-2 gap-3.5">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Saldo awal</span>
            </div>
            <div className="text-base sm:text-xl font-bold text-slate-900 mt-2">
              Rp199.014.118
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Per 2026-11-01
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>Operasi</span>
            </div>
            <div className="text-base sm:text-xl font-bold text-slate-900 mt-2">
              Rp57.329.982
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Masuk Rp74.455.000 · keluar Rp17.125.018
            </div>
          </div>

          <div className="col-span-2 bg-white rounded-2xl p-4 border border-emerald-300 shadow-2xs">
            <div className="text-xs font-medium text-slate-600">
              Saldo akhir Kas & Bank
            </div>
            <div className="text-xl font-bold text-[#15803d] mt-1">
              {formatIDR(summary.cashAndBank)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Per 2026-11-24
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: BUKU BESAR */}
      {activeTab === "BUKU_BESAR" && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Buku Besar (Chart of Accounts & Saldo Berjalan)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[11px]">
                  <th className="py-2 pr-2">Kode</th>
                  <th className="py-2 px-2">Nama Akun</th>
                  <th className="py-2 px-2 text-right">Saldo Awal</th>
                  <th className="py-2 px-2 text-right">Mutasi</th>
                  <th className="py-2 pl-2 text-right">Saldo Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc) => (
                  <tr key={acc.code}>
                    <td className="py-2.5 pr-2 font-mono font-semibold text-slate-600">
                      {acc.code}
                    </td>
                    <td className="py-2.5 px-2 font-medium text-slate-900">
                      {acc.name}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-500">
                      {formatIDR(acc.openingBalance)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-emerald-700">
                      {formatIDR(acc.runningMutation)}
                    </td>
                    <td className="py-2.5 pl-2 text-right font-mono font-bold text-slate-900">
                      {formatIDR(acc.closingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
