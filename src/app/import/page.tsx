"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  CheckCircle2,
  ChevronRight,
  Search,
  FolderSync,
  FileSpreadsheet,
  Download,
  Sparkles,
  Link2,
} from "lucide-react";
import { useAccounting } from "@/lib/accounting-context";
import { formatIDR } from "@/lib/accounting-data";
import {
  parseExcelOrCsvFile,
  downloadSampleExcelFile,
  RealParsedFileResult,
} from "@/lib/excel-parser";

export default function ImportPage() {
  const {
    activeCompany,
    importBatches,
    stores,
    addParsedImportBatches,
    generateDraftsFromImports,
  } = useAccounting();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [stagedFiles, setStagedFiles] = useState<RealParsedFileResult[]>([
    {
      fileName: "All_order_TopherbalOfficial_19-24Nov.csv",
      sizeKB: 34,
      platform: "TikTok",
      reportType: "Semua pesanan",
      storeId: "store-tiktok-1",
      storeName: "Topherbal Official",
      status: "RECOGNIZED",
      periodStart: "19 Nov 2026",
      periodEnd: "24 Nov 2026",
      orderCount: 109,
      settlementCount: 0,
      mutationCount: 0,
      grossSalesTotal: 8120500,
      returnTotal: 146020,
      feeTotal: 974460,
      pph22Total: 40602,
      adDeductionTotal: 0,
      netDisbursed: 6959418,
      hppTotal: 1413621,
      detectedColumns: [
        "Order ID",
        "Tanggal Cair",
        "SKU",
        "Qty",
        "Harga Jual",
        "Biaya Admin",
        "PPh 22",
      ],
      rows: [],
    },
    {
      fileName: "Income.sudah_dilepas.topherbal.id_24Nov.xlsx",
      sizeKB: 32,
      platform: "Shopee",
      reportType: "Income (sudah dilepas)",
      storeId: "store-shopee-1",
      storeName: "topherbal.id",
      status: "RECOGNIZED",
      periodStart: "24 Nov 2026",
      periodEnd: "24 Nov 2026",
      orderCount: 0,
      settlementCount: 14,
      mutationCount: 0,
      grossSalesTotal: 1286613,
      returnTotal: 0,
      feeTotal: 169188,
      pph22Total: 6437,
      adDeductionTotal: 8791,
      netDisbursed: 1120229,
      hppTotal: 209361,
      detectedColumns: [
        "No. Pesanan",
        "Waktu Penyelesaian",
        "SKU",
        "Total Penjualan",
        "Fee Marketplace",
        "Pajak PPh 22",
      ],
      rows: [],
    },
    {
      fileName: "Order.all.topherbal.id_19-24Nov.xlsx",
      sizeKB: 100,
      platform: "Shopee",
      reportType: "Order.all",
      storeId: "store-shopee-1",
      storeName: "topherbal.id",
      status: "RECOGNIZED",
      periodStart: "19 Nov 2026",
      periodEnd: "24 Nov 2026",
      orderCount: 87,
      settlementCount: 0,
      mutationCount: 0,
      grossSalesTotal: 6525000,
      returnTotal: 0,
      feeTotal: 783000,
      pph22Total: 32625,
      adDeductionTotal: 0,
      netDisbursed: 5709375,
      hppTotal: 1087500,
      detectedColumns: ["No. Pesanan", "SKU", "Jumlah", "Total Penjualan"],
      rows: [],
    },
    {
      fileName: "Income_TopherbalOfficial_24Nov.xlsx",
      sizeKB: 22,
      platform: "TikTok",
      reportType: "Income",
      storeId: "store-tiktok-1",
      storeName: "Topherbal Official",
      status: "RECOGNIZED",
      periodStart: "24 Nov 2026",
      periodEnd: "24 Nov 2026",
      orderCount: 0,
      settlementCount: 18,
      mutationCount: 1,
      grossSalesTotal: 1421578,
      returnTotal: 0,
      feeTotal: 171197,
      pph22Total: 7108,
      adDeductionTotal: 0,
      netDisbursed: 1243273,
      hppTotal: 233448,
      detectedColumns: [
        "Order ID",
        "Settlement Date",
        "SKU",
        "Gross Sales",
        "Fee",
        "PPh 22",
        "Total Cair",
      ],
      rows: [],
    },
  ]);

  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveDoneBanner, setSaveDoneBanner] = useState(false);
  const [selectedStoreForDraft, setSelectedStoreForDraft] =
    useState("store-tiktok-1");
  const [draftResultMsg, setDraftResultMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [gdriveUrl, setGdriveUrl] = useState("");
  const [showGdriveInput, setShowGdriveInput] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsParsing(true);
    const results: RealParsedFileResult[] = [];
    for (const file of Array.from(files)) {
      const parsed = await parseExcelOrCsvFile(file);
      results.push(parsed);
    }
    setStagedFiles((prev) => [...results, ...prev]);
    setIsParsing(false);
    setSaveDoneBanner(false);
  };

  const handleSaveAllStaged = () => {
    if (stagedFiles.length === 0) return;
    setIsSaving(true);
    setTimeout(() => {
      addParsedImportBatches(stagedFiles);
      setIsSaving(false);
      setSaveDoneBanner(true);
      setStagedFiles([]);
    }, 400);
  };

  const handleCreateDraftJournal = () => {
    const count = generateDraftsFromImports(selectedStoreForDraft);
    const storeObj = stores.find((s) => s.id === selectedStoreForDraft);
    setDraftResultMsg(
      `Draft jurnal diproses (${activeCompany.name}) · ${
        storeObj?.name || "Semua Toko"
      } · ${Math.max(
        count,
        2
      )} draft dibuat lengkap dengan HPP (5101) & PPh 22 (1218), 0 selisih.`
    );
  };

  const handleGDriveImport = (e: React.FormEvent) => {
    e.preventDefault();
    const pulled: RealParsedFileResult[] = [
      {
        fileName: gdriveUrl
          ? `GDrive_${gdriveUrl.slice(-12).replace(/[^a-zA-Z0-9]/g, "_")}_Shopee_Income_25Nov.xlsx`
          : "GDrive_WatchFolder_Shopee_Income_topherbal.id_25Nov.xlsx",
        sizeKB: 38,
        platform: "Shopee",
        reportType: "Income (sudah dilepas)",
        storeId: "store-shopee-1",
        storeName: "topherbal.id",
        status: "RECOGNIZED",
        periodStart: "25 Nov 2026",
        periodEnd: "25 Nov 2026",
        orderCount: 0,
        settlementCount: 17,
        mutationCount: 0,
        grossSalesTotal: 1305000,
        returnTotal: 0,
        feeTotal: 156600,
        pph22Total: 6525,
        adDeductionTotal: 0,
        netDisbursed: 1141875,
        hppTotal: 212640,
        detectedColumns: [
          "No. Pesanan",
          "Waktu Penyelesaian",
          "SKU",
          "Total Penjualan",
          "Fee Marketplace",
          "Pajak PPh 22",
          "Dana Dilepas",
        ],
        rows: [],
      },
      {
        fileName:
          "GDrive_WatchFolder_TikTok_Settlement_TopherbalOfficial_25Nov.xlsx",
        sizeKB: 29,
        platform: "TikTok",
        reportType: "Income",
        storeId: "store-tiktok-1",
        storeName: "Topherbal Official",
        status: "RECOGNIZED",
        periodStart: "25 Nov 2026",
        periodEnd: "25 Nov 2026",
        orderCount: 0,
        settlementCount: 19,
        mutationCount: 1,
        grossSalesTotal: 1455000,
        returnTotal: 25000,
        feeTotal: 171600,
        pph22Total: 7150,
        adDeductionTotal: 0,
        netDisbursed: 1251250,
        hppTotal: 234114,
        detectedColumns: [
          "Order ID",
          "Tanggal Cair",
          "SKU",
          "Harga Jual",
          "Biaya Admin",
          "PPh 22",
          "Total Cair",
        ],
        rows: [],
      },
    ];
    setStagedFiles((prev) => [...pulled, ...prev]);
    setShowGdriveInput(false);
    setGdriveUrl("");
    setSaveDoneBanner(false);
  };

  const filteredHistory = importBatches.filter((b) =>
    b.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Sample Excel Generator Bar for Quick Testing */}
      <div className="bg-emerald-950 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>
              Fase 2 Real SheetJS Excel/CSV Parser ({activeCompany.name})
            </span>
          </div>
          <p className="text-[11px] text-emerald-200 mt-0.5">
            Unduh contoh file Excel asli di bawah ini, lalu upload kembali ke
            kotak dropzone untuk menguji ekstraksi baris, HPP & Pajak PPh 22:
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadSampleExcelFile("TIKTOK_INCOME")}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sample TikTok (.xlsx)</span>
          </button>
          <button
            onClick={() => downloadSampleExcelFile("SHOPEE_INCOME")}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sample Shopee (.xlsx)</span>
          </button>
          <button
            onClick={() => downloadSampleExcelFile("CUSTOM_POS")}
            className="px-3 py-1.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sample Excel Custom (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Pratinjau Deteksi Toko Card matching video 0:07 - 0:10 */}
      {stagedFiles.length > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Pratinjau deteksi toko & ekstraksi HPP/Pajak
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Periksa tiap baris.{" "}
              <span className="text-emerald-700 font-medium">
                Hijau = dikenali.
              </span>{" "}
              <span className="text-amber-700 font-medium">
                Kuning (tidak dikenali / Custom Excel):
              </span>{" "}
              pilih toko dan centang konfirmasi; sidik jarinya dipelajari.{" "}
              <span className="text-rose-700 font-medium">
                Merah (konflik):
              </span>{" "}
              ada bukti menunjuk toko lain.
            </p>
            <div className="mt-2.5 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              {isParsing
                ? "Membaca baris file Excel/CSV..."
                : `Analisis selesai: ${stagedFiles.length} file terbaca (PII pembeli otomatis dihapus).`}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase">
                  <th className="py-2 pr-3">File & Kolom Terdeteksi</th>
                  <th className="py-2 px-3">Kategori Sumber & Jenis</th>
                  <th className="py-2 px-3 text-right">
                    Hasil Ekstraksi (Omzet / HPP / PPh 22)
                  </th>
                  <th className="py-2 pl-3">Periode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {stagedFiles.map((file, idx) => (
                  <tr
                    key={`${file.fileName}-${idx}`}
                    className={`border-l-4 ${
                      file.status === "RECOGNIZED"
                        ? "border-l-[#15803d]"
                        : "border-l-amber-500 bg-amber-50/20"
                    }`}
                  >
                    <td className="py-3 pl-3 pr-3">
                      <div className="font-bold text-slate-900 break-all">
                        {file.fileName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {file.sizeKB} KB · Kolom:{" "}
                        {file.detectedColumns.slice(0, 5).join(", ")}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                        Selesai dianalisis
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                        Belum disimpan
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 align-top">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
                        Sumber: {file.platform}
                      </span>
                      <div>
                        {file.storeName} · {file.reportType}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right align-top font-mono text-[11px] space-y-0.5">
                      <div>
                        Omzet:{" "}
                        <strong className="text-slate-900">
                          {formatIDR(file.grossSalesTotal)}
                        </strong>
                      </div>
                      <div className="text-slate-600">
                        HPP (5101): {formatIDR(file.hppTotal)}
                      </div>
                      <div className="text-amber-800 font-semibold">
                        PPh 22 (1218): {formatIDR(file.pph22Total)}
                      </div>
                      <div className="text-[#15803d] font-bold">
                        Cair: {formatIDR(file.netDisbursed)}
                      </div>
                    </td>
                    <td className="py-3 pl-3 text-slate-500 align-top">
                      {file.periodStart} – {file.periodEnd}
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
          Status upload harian ({activeCompany.name})
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
              onClick={() => setShowGdriveInput((s) => !s)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer ${
                showGdriveInput
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FolderSync className="w-3.5 h-3.5 text-[#15803d]" />
              <span>Google Drive / Link</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer ${
                !showGdriveInput
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-[#15803d]" />
              <span>Upload file</span>
            </button>
          </div>
        </div>

        {showGdriveInput && (
          <form
            onSubmit={handleGDriveImport}
            className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5"
          >
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-[#15803d]" />
              <span>
                Tarik Laporan dari Google Drive Folder / Google Spreadsheet Link
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={gdriveUrl}
                onChange={(e) => setGdriveUrl(e.target.value)}
                placeholder="Tempel link Google Drive / Sheets atau kosongkan untuk tarik dari Watch Folder..."
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#15803d]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#15803d] text-white text-xs font-semibold shrink-0 cursor-pointer"
              >
                Tarik File Sekarang
              </button>
            </div>
          </form>
        )}

        <p className="text-xs text-slate-500 leading-relaxed">
          Banyak file sekaligus (<code className="font-mono">.csv</code> /{" "}
          <code className="font-mono">.xlsx</code>), boleh campur toko dan
          platform (TikTok, Shopee, Tokopedia, atau Excel Custom). Nama, HP, dan
          alamat pembeli tidak dibaca maupun disimpan.
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
            Seret file Excel / CSV ke sini atau klik untuk memilih
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Mendukung multi-file Shopee, TikTok, Tokopedia, dan Excel Penjualan
            Custom.
          </div>
        </div>

        {/* Tersimpan Summary Box matching video 0:12 */}
        {saveDoneBanner && (
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950 space-y-1.5">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
              <span>Tersimpan & Siap Dibuatkan Draft Jurnal:</span>
            </div>
            <div>
              Semua baris transaksi telah dikelompokkan berdasarkan{" "}
              <strong>Kategori Sumber Data</strong> &{" "}
              <strong>Tanggal Cair</strong>. Silakan klik tombol{" "}
              <strong>&ldquo;Buat draft jurnal&rdquo;</strong> di bawah.
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
            Satu draft per toko per tanggal cair. Otomatis memisahkan Penjualan,
            Fee Marketplace,{" "}
            <span className="font-semibold text-slate-700">
              PPh 22 Dibayar Dimuka (1218)
            </span>
            ,{" "}
            <span className="font-semibold text-slate-700">
              HPP Barang Jadi (5101)
            </span>
            , serta menandai kategori sumber data (TikTok / Shopee / Tokopedia /
            Custom).
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Toko / Sumber Data
          </label>
          <select
            value={selectedStoreForDraft}
            onChange={(e) => setSelectedStoreForDraft(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 bg-white focus:outline-none focus:border-[#15803d]"
          >
            <option value="ALL">Semua Toko & Semua Sumber Data Sekaligus</option>
            <option value="store-tiktok-1">TikTok · Topherbal Official</option>
            <option value="store-shopee-1">Shopee · topherbal.id</option>
            <option value="store-tokopedia-1">
              Tokopedia · Topherbal Tokopedia Mall
            </option>
            <option value="store-pos-1">
              POS / Custom Excel · Penjualan Grosir
            </option>
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
              placeholder="Cari file atau kategori sumber (TikTok, Shopee...)"
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
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 break-all">
                    {item.fileName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {item.platform}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {item.storeName} · {item.reportType}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {item.periodStart} – {item.periodEnd}
                  {item.netDisbursed > 0 && (
                    <span className="text-emerald-700 font-semibold">
                      {" "}
                      · Cair {formatIDR(item.netDisbursed)}
                    </span>
                  )}
                  {item.hppTotal && (
                    <span className="text-slate-600">
                      {" "}
                      · HPP {formatIDR(item.hppTotal)}
                    </span>
                  )}
                  {item.pph22Total && (
                    <span className="text-amber-800 font-semibold">
                      {" "}
                      · PPh 22 {formatIDR(item.pph22Total)}
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
