"use client";

import React, { useState } from "react";
import { useAccounting } from "@/lib/accounting-context";
import { formatNumberID } from "@/lib/accounting-data";

export default function PerformaTokoPage() {
  const { storePerformance } = useAccounting();
  const [periodFilter, setPeriodFilter] = useState("7 hari");

  return (
    <div className="space-y-4">
      {/* Period Selector Pills matching video 1:09 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold gap-1">
          {["7 hari", "Bulan ini", "Bulan lalu", "Custom"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriodFilter(p)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodFilter === p
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="text-xs font-medium text-slate-500">
          18 Nov – 24 Nov 2026
        </div>
      </div>

      {/* Explanatory Note */}
      <p className="text-xs text-slate-500 px-1 leading-relaxed">
        Omzet order dihitung saat pesanan dibuat; laba kontribusi dihitung saat
        dana cair, jadi toko dengan banyak order belum cair bisa terlihat minus.
      </p>

      {/* Store Cards matching video 1:09 - 1:12 */}
      <div className="space-y-4">
        {storePerformance.map((store) => (
          <div
            key={store.storeId}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3"
          >
            <div className="flex items-baseline gap-2 border-b border-slate-100 pb-2.5">
              <h2 className="text-base font-bold text-slate-900">
                {store.storeName}
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {store.platform}
              </span>
            </div>

            {/* Section 1: TANGGAL ORDER */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tanggal Order
              </div>
              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">Order</span>
                  <span className="font-mono font-medium text-slate-900">
                    {formatNumberID(store.orderCount)}
                  </span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">Omzet order</span>
                  <span className="font-mono font-medium text-slate-900">
                    {formatNumberID(store.omzetOrder)}
                  </span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">Batal</span>
                  <span className="font-mono font-medium text-slate-900">
                    {formatNumberID(store.cancelledCount)}
                  </span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">Iklan</span>
                  <span className="font-mono font-medium text-slate-900">
                    {formatNumberID(store.adSpend)}
                  </span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">ROAS</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {formatNumberID(store.roas, 2)}×
                  </span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">ACOS</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatNumberID(store.acosPercent, 1)}%
                  </span>
                </div>
                {store.unbilledAdDebt > 0 && (
                  <div className="py-1.5 flex justify-between text-slate-400 text-xs">
                    <span>Utang iklan belum ditagih</span>
                    <span className="font-mono">
                      {formatNumberID(store.unbilledAdDebt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: TANGGAL CAIR */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tanggal Cair
              </div>
              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">Penjualan cair</span>
                  <span className="font-mono font-medium text-slate-900">
                    {formatNumberID(store.settledSales)}
                  </span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">AOV</span>
                  <span className="font-mono font-medium text-slate-900">
                    {formatNumberID(store.aov)}
                  </span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">Net/order</span>
                  <span className="font-mono font-medium text-slate-900">
                    {formatNumberID(store.netPerOrder)}
                  </span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">% Net</span>
                  <span className="font-mono font-medium text-slate-900">
                    {formatNumberID(store.netPercent, 1)}%
                  </span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">AOP</span>
                  <span className="font-mono font-medium text-slate-900">
                    {formatNumberID(store.aop, 2)}
                  </span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">Fee %</span>
                  <span className="font-mono font-medium text-slate-900">
                    {formatNumberID(store.feePercent, 1)}%
                  </span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-600">HPP</span>
                  <span className="font-mono font-medium text-slate-900">
                    {formatNumberID(store.hppTotal)}
                  </span>
                </div>
                <div className="py-2 flex justify-between font-bold text-slate-900">
                  <span>Laba kontribusi</span>
                  <span className="font-mono text-[#15803d]">
                    {formatNumberID(store.contributionMargin)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
