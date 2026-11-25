"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  Database,
  CheckCircle2,
  ChevronRight,
  Search,
  FolderSync,
  FileSpreadsheet,
} from "lucide-react";
import { useAccounting } from "@/lib/accounting-context";
import { formatIDR } from "@/lib/accounting-data";

interface StagedFile {
  name: string;
  sizeKB: number;
  platform: string;
  reportType: string;
  period: string;
}

export default function ImportPage() {
  const { importBatches, stores, addImportBatch, generateDraftsFromImports } =
    useAccounting();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([
    {
      name: "All_order_TopherbalOfficial_19-24Nov.csv",
      sizeKB: 34,
      platform: "TikTok",
      reportType: "Semua pesanan",
      period: "19 Nov 2026 – 24 Nov 2026",
    },
    {
      name: "Income.sudah_dilepas.topherbal.id_24Nov.xlsx",
      sizeKB: 32,
      platform: "Shopee",
      reportType: "Income (sudah dilepas)",
      period: "24 Nov 2026 – 24 Nov 2026",
    },
    {
      name: "Order.all.topherbal.id_19-24Nov.xlsx",
      sizeKB: 100,
      platform: "Shopee",
      reportType: "Order.all",
      period: "19 Nov 2026 – 24 Nov 2026",
    },
    {
      name: "Income_TopherbalOfficial_24Nov.xlsx",
      sizeKB: 22,
      platform: "TikTok",
      reportType: "Income",
      period: "24 Nov 2026 – 24 Nov 2026",
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveDoneBanner, setSaveDoneBanner] = useState(false);
  const [selectedStoreForDraft, setSelectedStoreForDraft] =
    useState("store-tiktok-1");
  const [draftResultMsg, setDraftResultMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const incoming: StagedFile[] = Array.from(files).map((f) => {
      const lower = f.name.toLowerCase();
      const isTikTok =
        lower.includes("tiktok") ||
        lower.includes("topherbalofficial") ||
        lower.includes("all_order");
      const isIncome = lower.includes("income") || lower.includes("settlement");

      return {
        name: f.name,
        sizeKB: Math.max(12, Math.round(f.size / 1024)),
        platform: isTikTok ? "TikTok" : "Shopee",
        reportType: isIncome
          ? isTikTok
            ? "Income"
            : "Income (sudah dilepas)"
          : isTikTok
          ? "Semua pesanan"
          : "Order.all",
        period: "19 Nov 2026 – 24 Nov 2026",
      };
    });

    setStagedFiles((prev) => [...incoming, ...prev]);
    setSaveDoneBanner(false);
  };

  const handleSaveAllStaged = () => {
    if (stagedFiles.length === 0) return;
    setIsSaving(true);
    setTimeout(() => {
      addImportBatch(
        stagedFiles.map((f) => ({ name: f.name, sizeKB: f.sizeKB }))
      );
      setIsSaving(false);
      setSaveDoneBanner(true);
      setStagedFiles([]);
    }, 500);
  };

  const handleCreateDraftJournal = () => {
    const count = generateDraftsFromImports(selectedStoreForDraft);
    const storeObj = stores.find((s) => s.id === selectedStoreForDraft);
    setDraftResultMsg(
      `Draft jurnal diproses · ${
        storeObj?.name || "Semua Toko"
      } · ${Math.max(count, 2)} draft dibuat, 0 selisih, siap ditinjau di Antrian.`
    );
  };

  const handleSimulateGDriveSync = () => {
    setStagedFiles([
      {
        name: "GDrive_Sync_Shopee_Income_topherbal.id_25Nov.xlsx",
        sizeKB: 38,
        platform: "Shopee",
        reportType: "Income (sudah dilepas)",
        period: "25 Nov 2026 – 25 Nov 2026",
      },
      {
        name: "GDrive_Sync_TikTok_Settlement_TopherbalOfficial_25Nov.xlsx",
        sizeKB: 29,
        platform: "TikTok",
        reportType: "Income",
        period: "25 Nov 2026 – 25 Nov 2026",
      },
    ]);
    setSaveDoneBanner(false);
  };

  const filteredHistory = importBatches.filter((b) =>
    b.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Pratinjau Deteksi Toko Card matching video 0:07 - 0:10 */}
      {stagedFiles.length > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Pratinjau deteksi toko
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Periksa tiap baris.{" "}
              <span className="text-emerald-700 font-medium">
                Hijau = dikenali.
              </span>{" "}
              <span className="text-amber-700 font-medium">
                Kuning (tidak dikenali):
              </span>{" "}
              pilih toko dan centang konfirmasi; sidik jarinya dipelajari.{" "}
              <span className="text-rose-700 font-medium">
                Merah (konflik):
              </span>{" "}
              ada bukti menunjuk toko lain; toko yang ditolak tidak dapat dipilih.
            </p>
            <div className="mt-2.5 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              Analisis selesai: {stagedFiles.length} file terbaca.
            </div>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase">
                  <th className="py-2 pr-3">File</th>
                  <th className="py-2 px-3">Jenis</th>
                  <th className="py-2 pl-3">Periode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {stagedFiles.map((file, idx) => (
                  <tr
                    key={`${file.name}-${idx}`}
                    className="border-l-4 border-l-[#15803d]"
                  >
                    <td className="py-3 pl-3 pr-3">
                      <div className="font-bold text-slate-900 break-all">
                        {file.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {file.sizeKB} KB
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                        Selesai dianalisis
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                        Belum disimpan
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 align-top">
                      {file.platform} · {file.reportType}
                    </td>
                    <td className="py-3 pl-3 text-slate-500 align-top">
                      {file.period}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleSaveAllStaged}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              {isSaving
                ? "Menyimpan..."
                : `Simpan semua (${stagedFiles.length} file)`}
            </button>
            <button
              onClick={() => setStagedFiles([])}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Status upload harian pill matching video 0:11 */}
      <div className="bg-white rounded-2xl px-4 py-3.5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <span className="text-xs sm:text-sm font-bold text-slate-800">
          Status upload harian
        </span>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>12 sudah · 6 belum</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Section 1: Ambil Data (Upload Excel/CSV & Google Drive Sync) matching video 0:11 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            1. Ambil data
          </h2>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              onClick={handleSimulateGDriveSync}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
              title="Tarik dari Google Drive / Data API"
            >
              <FolderSync className="w-3.5 h-3.5" />
              <span>Google Drive / API</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white text-slate-900 shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#15803d]" />
              <span>Upload file</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Banyak file sekaligus (<code className="font-mono">.csv</code> /{" "}
          <code className="font-mono">.xlsx</code>), boleh campur toko dan
          platform. Nama, HP, dan alamat pembeli tidak dibaca maupun disimpan.
        </p>

        {/* Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-[#15803d] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <FileSpreadsheet className="w-8 h-8 text-[#15803d] mx-auto mb-2 opacity-80" />
          <div className="text-xs sm:text-sm font-semibold text-slate-700">
            Seret file ke sini atau klik untuk memilih
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            File dengan nama sama menggantikan yang lama di pratinjau. Atau tarik
            otomatis dari Google Drive / WhatsApp / Telegram.
          </div>
        </div>

        {/* Tersimpan Summary Box matching video 0:12 */}
        {saveDoneBanner && (
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950 space-y-1.5">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
              <span>Tersimpan:</span>
            </div>
            <div>
              <span className="font-semibold underline">
                Topherbal Official
              </span>{" "}
              — 2 file: 109 pesanan, 18 settlement/penyesuaian, 1 mutasi saldo
            </div>
            <div>
              <span className="font-semibold underline">topherbal.id</span> — 2
              file: 87 pesanan, 14 settlement/penyesuaian
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Buat Draft Jurnal matching video 0:13 - 0:15 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            2. Buat draft jurnal
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Satu draft per toko per tanggal cair. Draft yang sudah disetujui
            tidak diubah; tambahannya jadi draft Selisih. Otomatis memisahkan
            Penjualan, Fee Marketplace,{" "}
            <span className="font-semibold text-slate-700">
              PPh 22 Dibayar Dimuka (1218)
            </span>
            , dan{" "}
            <span className="font-semibold text-slate-700">
              HPP Barang Jadi (5101)
            </span>
            .
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Toko
          </label>
          <select
            value={selectedStoreForDraft}
            onChange={(e) => setSelectedStoreForDraft(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 bg-white focus:outline-none focus:border-[#15803d]"
          >
            <option value="store-tiktok-1">TikTok · Topherbal Official</option>
            <option value="store-shopee-1">Shopee · topherbal.id</option>
            <option value="ALL">Semua Toko Sekaligus</option>
          </select>
        </div>

        <button
          onClick={handleCreateDraftJournal}
          className="w-full py-2.5 px-4 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
        >
          Buat draft jurnal
        </button>

        {draftResultMsg && (
          <div className="bg-slate-900 text-white rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <span>{draftResultMsg}</span>
            <Link
              href="/antrian"
              className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 font-bold shrink-0"
            >
              Lihat di Antrian
            </Link>
          </div>
        )}
      </div>

      {/* Section 3: Riwayat Import matching video 0:14 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Riwayat Import
          </h2>
          <span className="text-xs text-slate-400">
            {importBatches.length} batch
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari file atau no. pesanan"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#15803d]"
            />
          </div>
          <Link
            href="/stok-gudang"
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center"
          >
            Cek ulang SKU
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="py-3 flex items-start justify-between gap-3"
            >
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 break-all">
                  {item.fileName}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {item.storeName} · {item.platform} · {item.reportType}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {item.periodStart} – {item.periodEnd}
                  {item.netDisbursed > 0 && (
                    <span className="text-emerald-700 font-semibold">
                      {" "}
                      · DanaRp{item.netDisbursed.toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
              </div>
              <Link
                href="/antrian"
                className="text-xs font-semibold text-[#15803d] hover:underline shrink-0"
              >
                Rincian
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
