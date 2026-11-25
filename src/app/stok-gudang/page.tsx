"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Box,
  AlertCircle,
  ShoppingCart,
  TrendingUp,
  Layers,
  FlaskConical,
  Package,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { useAccounting } from "@/lib/accounting-context";
import { formatIDR } from "@/lib/accounting-data";

export default function StokGudangPage() {
  const { inventory, recordStockPurchase } = useAccounting();
  const [subTab, setSubTab] = useState<"SALDO" | "FORMULA" | "PRODUK">("SALDO");
  const [txType, setTxType] = useState("Pembelian");
  const [txDate, setTxDate] = useState("2026-11-24");
  const [invoiceNo, setInvoiceNo] = useState("INV-0912");
  const [supplier, setSupplier] = useState("Toko Botol Jaya");
  const [selectedSku, setSelectedSku] = useState("BTL");
  const [qty, setQty] = useState(1000);
  const [itemPrice, setItemPrice] = useState(1950);
  const [shippingCost, setShippingCost] = useState(60000);
  const [createdNotice, setCreatedNotice] = useState<string | null>(null);

  const totalInventoryValue = 5553161;
  const criticalItems = inventory.filter((i) => i.critical);

  const handleSaveStockTx = (e: React.FormEvent) => {
    e.preventDefault();
    const draft = recordStockPurchase({
      date: txDate,
      invoiceNo,
      supplier,
      itemSku: selectedSku,
      qty: Number(qty),
      itemPrice: Number(itemPrice),
      shippingCost: Number(shippingCost),
    });
    setCreatedNotice(
      `Draft jurnal stok "${draft.title}" berhasil dibuat di Antrian!`
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Sub-Navigation Pills matching video 0:44 */}
      <div className="inline-flex rounded-2xl bg-white p-1.5 border border-slate-200/80 shadow-2xs gap-1">
        <button
          onClick={() => setSubTab("SALDO")}
          className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            subTab === "SALDO"
              ? "bg-emerald-50 text-[#15803d] border border-emerald-200"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Saldo</span>
        </button>
        <button
          onClick={() => setSubTab("FORMULA")}
          className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            subTab === "FORMULA"
              ? "bg-emerald-50 text-[#15803d] border border-emerald-200"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Formula</span>
        </button>
        <button
          onClick={() => setSubTab("PRODUK")}
          className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            subTab === "PRODUK"
              ? "bg-emerald-50 text-[#15803d] border border-emerald-200"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Produk</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards matching video 0:45 - 0:47 */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Box className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium text-slate-600 mt-2.5">
            Jumlah SKU
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            11
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Produk di daftar stok
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium text-slate-600 mt-2.5">
            Item kritis
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 mt-0.5">
            9
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Hari tersisa ≤ lead time
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium text-slate-600 mt-2.5">
            Perlu order
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            0
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Segera order (kuning)
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-300 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium text-slate-600 mt-2.5">
            Nilai persediaan
          </div>
          <div className="text-base sm:text-xl font-bold text-slate-900 mt-0.5">
            {formatIDR(totalInventoryValue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Jumlah nilai semua produk (Sama dengan Neraca)
          </div>
        </div>
      </div>

      {subTab === "SALDO" && (
        <>
          {/* Transaksi Stok Form matching video 0:46 - 0:48 */}
          <form
            onSubmit={handleSaveStockTx}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Transaksi Stok
                </h2>
                <p className="text-xs text-slate-500">
                  Pembelian, produksi, rusak, retur, stock opname, sampel
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Jenis
              </label>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-medium bg-white"
              >
                <option value="Pembelian">Pembelian (Bahan Baku / Kemasan)</option>
                <option value="Produksi">Produksi (Konversi Formula BOM ke Barang Jadi)</option>
                <option value="Stock Opname">Stock Opname</option>
                <option value="Rusak">Barang Rusak / Sampel</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Satu nota bisa berisi beberapa barang; ongkir dibagi ke harga
                barang (Weighted Average HPP). Jurnal:{" "}
                <span className="font-mono text-slate-600">
                  Dr Persediaan / Cr akun pembayaran
                </span>
                .
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  No. nota/voucher
                </label>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="mis. INV-0912"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Pemasok
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="mis. Toko Botol Jaya"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Item / SKU
                </label>
                <select
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white"
                >
                  {inventory.map((item) => (
                    <option key={item.sku} value={item.sku}>
                      {item.sku} — {item.name} ({item.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Kuantitas
                </label>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Harga Satuan (Rp)
                </label>
                <input
                  type="number"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Ongkir/biaya lain (Rp) — otomatis dialokasikan ke HPP barang
              </label>
              <input
                type="number"
                value={shippingCost}
                onChange={(e) => setShippingCost(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Transaksi Stok & Buat Draft Jurnal</span>
            </button>

            {createdNotice && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
                  {createdNotice}
                </span>
                <Link
                  href="/antrian"
                  className="font-bold text-[#15803d] underline ml-2"
                >
                  Buka Antrian →
                </Link>
              </div>
            )}
          </form>

          {/* Peringatan Stok Kritis matching video 0:49 - 0:50 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Peringatan stok
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Barang jadi JHM siap kirim cukup ±0 hari · bisa dikemas +65
                botol (pembatas: SRB-JHM)
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Catatan: stok sistem baru berkurang saat settlement, jadi stok
                fisik = stok sistem − yang sudah dikirim tapi belum settle.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {criticalItems.map((item) => (
                <div key={item.sku} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {item.sku}
                      </span>
                      <span className="text-xs text-slate-600">
                        ±{item.daysLeft} hari
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                        Kritis
                      </span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-700">
                      HPP: {formatIDR(item.unitCost)}/{item.unit}
                    </span>
                  </div>

                  {item.bottleneckSku && (
                    <div className="pl-4 text-xs font-semibold text-rose-700">
                      Terhambat {item.bottleneckSku}
                    </div>
                  )}

                  {item.recommendedOrderQty && (
                    <div className="pl-4 text-xs font-semibold text-rose-700">
                      Pesan sekarang ±
                      {item.recommendedOrderQty.toLocaleString("id-ID")}{" "}
                      {item.unit}
                    </div>
                  )}

                  <div className="pl-4 text-[11px] text-slate-400">
                    {item.stockQty} {item.unit} ·{" "}
                    {item.dailyBurnRate.toLocaleString("id-ID")}/hari
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {subTab === "FORMULA" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Formula BOM (Bill of Materials) & Kalkulasi HPP Otomatis
          </h2>
          <p className="text-xs text-slate-500">
            Setiap 1 botol barang jadi otomatis menarik biaya rata-rata
            tertimbang dari Bahan Baku (1213) dan Kemasan (1214):
          </p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-bold text-sm text-slate-900">
                  JHM — Jamu Herbal Madu 250ml
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Komposisi: 50g SRB-JHM (Rp 7.250) + 1 pcs BTL Botol 250ml (Rp
                  2.006) + Label & Segel (Rp 3.713)
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-400">HPP Standar</div>
                <div className="text-sm font-bold text-[#15803d] font-mono">
                  Rp12.969 / botol
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-bold text-sm text-slate-900">
                  KNY — Kunyit Asam Murni 250ml
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Komposisi: 55g SRB-KNY (Rp 6.050) + 1 pcs BTL Botol 250ml (Rp
                  2.006) + Ekstrak Asam (Rp 3.794)
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-400">HPP Standar</div>
                <div className="text-sm font-bold text-[#15803d] font-mono">
                  Rp11.850 / botol
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === "PRODUK" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            Master Produk & Persediaan
          </h2>
          <div className="divide-y divide-slate-100 text-xs">
            {inventory.map((item) => (
              <div
                key={item.sku}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    {item.sku} · {item.name}
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    Tipe: {item.type} · Sisa: {item.stockQty} {item.unit}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-slate-900">
                    {formatIDR(item.totalValue)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    @{formatIDR(item.unitCost)}/{item.unit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
