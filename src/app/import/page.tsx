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
  AlertTriangle,
  XCircle,
  SlidersHorizontal,
  PackageCheck,
  X,
} from "lucide-react";
import { useAccounting } from "@/lib/accounting-context";
import { formatIDR } from "@/lib/accounting-data";
import {
  parseExcelOrCsvFile,
  parseRowsWithMapping,
  downloadSampleExcelFile,
  RealParsedFileResult,
  ColumnMappingConfig,
  MASTER_SKU_HPP,
} from "@/lib/excel-parser";

const INITIAL_STAGED_FILES: RealParsedFileResult[] = [
  {
    id: "st-1",
    fileName: "All_order_TopherbalOfficial_19-24Nov.csv",
    sizeKB: 34,
    platform: "TikTok",
    reportType: "Semua pesanan",
    storeId: "store-tiktok-1",
    storeName: "Topherbal Official",
    status: "RECOGNIZED",
    fingerprintConfirmed: true,
    fingerprintSignature: "biaya admin|harga jual|order id|pph 22|qty|sku|tanggal cair",
    periodStart: "19 Nov 2026",
    periodEnd: "24 Nov 2026",
    orderCount: 109,
    settlementCount: 0,
    mutationCount: 3,
    grossSalesTotal: 8120500,
    returnTotal: 146020,
    feeTotal: 974460,
    pph22Total: 40602,
    adDeductionTotal: 0,
    netDisbursed: 6959418,
    hppTotal: 1413621,
    discrepancyTotalRp: 0,
    detectedColumns: [
      "Order ID",
      "Tanggal Cair",
      "SKU",
      "Qty",
      "Harga Jual",
      "Biaya Admin",
      "PPh 22",
    ],
    rawHeaders: [
      "Order ID",
      "Tanggal Cair",
      "SKU",
      "Qty",
      "Harga Jual",
      "Biaya Admin",
      "PPh 22",
    ],
    rawSampleRows: [],
    columnMapping: {
      orderIdCol: "Order ID",
      dateCol: "Tanggal Cair",
      skuCol: "SKU",
      qtyCol: "Qty",
      grossSalesCol: "Harga Jual",
      returnCol: "Retur",
      feeCol: "Biaya Admin",
      pph22Col: "PPh 22",
      netSettlementCol: "Total Cair",
      hppCol: "HPP Satuan",
    },
    unmappedSkus: [],
    settlementGroups: [],
    rows: [],
  },
  {
    id: "st-2",
    fileName: "Income.sudah_dilepas.topherbal.id_24Nov.xlsx",
    sizeKB: 32,
    platform: "Shopee",
    reportType: "Income (sudah dilepas)",
    storeId: "store-shopee-1",
    storeName: "topherbal.id",
    status: "RECOGNIZED",
    fingerprintConfirmed: true,
    fingerprintSignature: "dana dilepas|fee marketplace|jumlah|no. pesanan|pajak pph 22|sku|total penjualan|waktu penyelesaian",
    periodStart: "24 Nov 2026",
    periodEnd: "24 Nov 2026",
    orderCount: 0,
    settlementCount: 14,
    mutationCount: 2,
    grossSalesTotal: 1286613,
    returnTotal: 0,
    feeTotal: 169188,
    pph22Total: 6437,
    adDeductionTotal: 8791,
    netDisbursed: 1120229,
    hppTotal: 209361,
    discrepancyTotalRp: 1,
    detectedColumns: [
      "No. Pesanan",
      "Waktu Penyelesaian",
      "SKU",
      "Total Penjualan",
      "Fee Marketplace",
      "Pajak PPh 22",
    ],
    rawHeaders: [
      "No. Pesanan",
      "Waktu Penyelesaian",
      "SKU",
      "Total Penjualan",
      "Fee Marketplace",
      "Pajak PPh 22",
    ],
    rawSampleRows: [],
    columnMapping: {
      orderIdCol: "No. Pesanan",
      dateCol: "Waktu Penyelesaian",
      skuCol: "SKU",
      qtyCol: "Jumlah",
      grossSalesCol: "Total Penjualan",
      returnCol: "Retur",
      feeCol: "Fee Marketplace",
      pph22Col: "Pajak PPh 22",
      netSettlementCol: "Dana Dilepas",
      hppCol: "HPP Satuan",
    },
    unmappedSkus: [],
    settlementGroups: [],
    rows: [],
  },
  {
    id: "st-3",
    fileName: "Rekap_Kasir_Cabang_Kemang_Nov2026.xlsx",
    sizeKB: 18,
    platform: "POS / Custom",
    reportType: "Custom Sales Excel",
    storeId: "store-pos-1",
    storeName: "Toko Belum Dikenali (Pilih Toko)",
    status: "UNKNOWN_STORE",
    fingerprintConfirmed: false,
    fingerprintSignature: "bersih|kode produk|no. nota|pajak|penjualan bruto|potongan|tgl transaksi|unit",
    periodStart: "24 Nov 2026",
    periodEnd: "25 Nov 2026",
    orderCount: 0,
    settlementCount: 25,
    mutationCount: 2,
    grossSalesTotal: 1975000,
    returnTotal: 0,
    feeTotal: 40000,
    pph22Total: 9750,
    adDeductionTotal: 0,
    netDisbursed: 1925250,
    hppTotal: 319535,
    discrepancyTotalRp: 0,
    detectedColumns: [
      "No. Nota",
      "Tgl Transaksi",
      "Kode Produk",
      "Unit",
      "Penjualan Bruto",
      "Potongan",
      "Pajak",
      "Bersih",
    ],
    rawHeaders: [
      "No. Nota",
      "Tgl Transaksi",
      "Kode Produk",
      "Unit",
      "Penjualan Bruto",
      "Potongan",
      "Pajak",
      "Bersih",
    ],
    rawSampleRows: [
      {
        "No. Nota": "KMG-001",
        "Tgl Transaksi": "2026-11-24",
        "Kode Produk": "JHM",
        Unit: 15,
        "Penjualan Bruto": 1125000,
        Potongan: 25000,
        Pajak: 5500,
        Bersih: 1094500,
      },
      {
        "No. Nota": "KMG-002",
        "Tgl Transaksi": "2026-11-25",
        "Kode Produk": "SKU-BARU-09",
        Unit: 10,
        "Penjualan Bruto": 850000,
        Potongan: 15000,
        Pajak: 4250,
        Bersih: 830750,
      },
    ],
    columnMapping: {
      orderIdCol: "No. Nota",
      dateCol: "Tgl Transaksi",
      skuCol: "Kode Produk",
      qtyCol: "Unit",
      grossSalesCol: "Penjualan Bruto",
      returnCol: "Retur",
      feeCol: "Potongan",
      pph22Col: "Pajak",
      netSettlementCol: "Bersih",
      hppCol: "HPP Satuan",
    },
    unmappedSkus: ["SKU-BARU-09"],
    settlementGroups: [],
    rows: [
      {
        orderId: "KMG-001",
        settlementDate: "2026-11-24",
        sku: "JHM",
        qty: 15,
        grossSales: 1125000,
        returnAmount: 0,
        marketplaceFee: 25000,
        pph22Withheld: 5500,
        adDeduction: 0,
        netSettlement: 1094500,
        hppPerUnit: 12969,
        totalHpp: 194535,
      },
      {
        orderId: "KMG-002",
        settlementDate: "2026-11-25",
        sku: "SKU-BARU-09",
        qty: 10,
        grossSales: 850000,
        returnAmount: 0,
        marketplaceFee: 15000,
        pph22Withheld: 4250,
        adDeduction: 0,
        netSettlement: 830750,
        hppPerUnit: 12500,
        totalHpp: 125000,
      },
    ],
  },
];

export default function ImportPage() {
  const {
    activeCompany,
    importBatches,
    stores,
    addParsedImportBatches,
    generateDraftsFromImports,
  } = useAccounting();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [stagedFiles, setStagedFiles] =
    useState<RealParsedFileResult[]>(INITIAL_STAGED_FILES);

  // Learned fingerprints memory (Step 2.1)
  const [learnedFingerprints, setLearnedFingerprints] = useState<
    Record<
      string,
      {
        storeId: string;
        storeName: string;
        platform: RealParsedFileResult["platform"];
      }
    >
  >({});

  // Custom SKU HPP mappings added via "Cek Ulang SKU" modal (Step 2.1)
  const [customSkuHpp, setCustomSkuHpp] = useState<Record<string, number>>({});
  const [showSkuModal, setShowSkuModal] = useState(false);

  // Step 2.3 AI Column Mapper Modal state
  const [mappingModalFile, setMappingModalFile] =
    useState<RealParsedFileResult | null>(null);
  const [tempMapping, setTempMapping] = useState<ColumnMappingConfig | null>(
    null
  );
  const [aiMapperNote, setAiMapperNote] = useState<string | null>(null);

  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveDoneBanner, setSaveDoneBanner] = useState(false);
  const [selectedStoreForDraft, setSelectedStoreForDraft] =
    useState("store-tiktok-1");

  // Step 2.2 Per-settlement-date draft result table matching video 0:15
  const [draftResultTable, setDraftResultTable] = useState<{
    storeLabel: string;
    createdCount: number;
    discrepancyDraftCount: number;
    skippedCount: number;
    rows: {
      tanggal: string;
      jenis: string;
      jml: number;
      totalDebit: number;
      storeName: string;
    }[];
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [gdriveUrl, setGdriveUrl] = useState("");
  const [showGdriveInput, setShowGdriveInput] = useState(false);
  const [gdriveLoading, setGdriveLoading] = useState(false);

  // Upload real Excel/CSV files
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsParsing(true);
    const results: RealParsedFileResult[] = [];
    for (const file of Array.from(files)) {
      const parsed = await parseExcelOrCsvFile(
        file,
        learnedFingerprints,
        customSkuHpp
      );
      results.push(parsed);
    }
    setStagedFiles((prev) => [...results, ...prev]);
    setIsParsing(false);
    setSaveDoneBanner(false);
  };

  // Step 2.1: Handle Yellow row (UNKNOWN_STORE) store assignment & fingerprint learning checkbox
  const handleAssignUnknownStore = (
    stagedId: string,
    newStoreId: string,
    confirmed: boolean
  ) => {
    const storeObj = stores.find((s) => s.id === newStoreId) || stores[0];
    setStagedFiles((prev) =>
      prev.map((f) => {
        if (f.id !== stagedId) return f;
        if (confirmed && f.fingerprintSignature) {
          setLearnedFingerprints((lf) => ({
            ...lf,
            [f.fingerprintSignature]: {
              storeId: storeObj.id,
              storeName: storeObj.name,
              platform: storeObj.platform,
            },
          }));
        }
        return {
          ...f,
          storeId: storeObj.id,
          storeName: storeObj.name,
          platform: storeObj.platform,
          fingerprintConfirmed: confirmed,
          status: confirmed ? "RECOGNIZED" : "UNKNOWN_STORE",
        };
      })
    );
  };

  // Step 2.3: Open AI Column Mapper Modal
  const handleOpenAiMapper = async (file: RealParsedFileResult) => {
    setMappingModalFile(file);
    setTempMapping(file.columnMapping);
    setAiMapperNote("Menganalisis struktur header dengan Gemini AI Schema Mapper...");

    try {
      const res = await fetch("/api/import/ai-mapper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.fileName,
          headers: file.rawHeaders,
          sampleRows: file.rawSampleRows,
        }),
      });
      const data = await res.json();
      if (data.status === "ok") {
        setAiMapperNote(data.explanation);
      }
    } catch {
      setAiMapperNote(
        "AI Schema Mapper mendeteksi pemetaan kolom secara otomatis."
      );
    }
  };

  const handleApplyColumnMapping = () => {
    if (!mappingModalFile || !tempMapping) return;
    if (mappingModalFile.rawSampleRows.length > 0) {
      const reparsed = parseRowsWithMapping(
        mappingModalFile.fileName,
        mappingModalFile.sizeKB,
        mappingModalFile.rawSampleRows,
        tempMapping,
        learnedFingerprints,
        customSkuHpp
      );
      setStagedFiles((prev) =>
        prev.map((f) =>
          f.id === mappingModalFile.id
            ? { ...reparsed, id: f.id, status: f.status, storeId: f.storeId, storeName: f.storeName }
            : f
        )
      );
    }
    setMappingModalFile(null);
  };

  // Save only valid (RECOGNIZED or confirmed) files; reject CONFLICT (red) files
  const savableFiles = stagedFiles.filter(
    (f) => f.status === "RECOGNIZED" || f.fingerprintConfirmed
  );

  const handleSaveAllStaged = () => {
    if (savableFiles.length === 0) return;
    setIsSaving(true);
    setTimeout(() => {
      addParsedImportBatches(savableFiles);
      setIsSaving(false);
      setSaveDoneBanner(true);
      setStagedFiles((prev) =>
        prev.filter((f) => f.status !== "RECOGNIZED" && !f.fingerprintConfirmed)
      );
    }, 400);
  };

  // Step 2.2: Generate 1 Draft Journal per Store per Settlement Date + Rp 1 Selisih
  const handleCreateDraftJournal = () => {
    const res = generateDraftsFromImports(selectedStoreForDraft);
    const storeObj = stores.find((s) => s.id === selectedStoreForDraft);
    setDraftResultTable({
      storeLabel: storeObj?.name || "Semua Toko",
      createdCount: res.createdCount,
      discrepancyDraftCount: res.discrepancyDraftCount,
      skippedCount: res.skippedCount,
      rows: res.generatedTableRows,
    });
  };

  // Step 2.4: Real Google Drive Watch Folder / Google Sheets API call
  const handleGDriveImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setGdriveLoading(true);
    try {
      const res = await fetch("/api/import/gdrive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: gdriveUrl }),
      });
      const data = await res.json();
      if (data.status === "ok" && Array.isArray(data.parsedFiles)) {
        setStagedFiles((prev) => [...data.parsedFiles, ...prev]);
        setShowGdriveInput(false);
        setGdriveUrl("");
        setSaveDoneBanner(false);
      }
    } finally {
      setGdriveLoading(false);
    }
  };

  // Collect all unmapped SKUs across staged files
  const allUnmappedSkus = Array.from(
    new Set(stagedFiles.flatMap((f) => f.unmappedSkus || []))
  );

  const filteredHistory = importBatches.filter((b) =>
    b.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Phase 2 Sample Files Toolbar (Hijau, Kuning Custom Excel, & Merah Konflik) */}
      <div className="bg-emerald-950 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>
              Fase 2 Smart Import Engine ({activeCompany.name})
            </span>
          </div>
          <p className="text-[11px] text-emerald-200 mt-0.5">
            Unduh contoh file Excel di bawah ini untuk menguji deteksi{" "}
            <strong>Hijau (Dikenali)</strong>,{" "}
            <strong>Kuning (Custom Excel + AI Mapper)</strong>,{" "}
            <strong>Merah (Konflik Toko)</strong>, dan{" "}
            <strong>Selisih Settlement Rp 1</strong>:
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => downloadSampleExcelFile("TIKTOK_INCOME")}
            className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>TikTok (.xlsx)</span>
          </button>
          <button
            onClick={() => downloadSampleExcelFile("SHOPEE_INCOME")}
            className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Shopee (.xlsx)</span>
          </button>
          <button
            onClick={() => downloadSampleExcelFile("CUSTOM_POS")}
            className="px-2.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Custom Kasir (Kuning)</span>
          </button>
          <button
            onClick={() => downloadSampleExcelFile("CONFLICT_SAMPLE")}
            className="px-2.5 py-1.5 rounded-xl bg-rose-500 text-white hover:bg-rose-400 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tes Konflik (Merah)</span>
          </button>
        </div>
      </div>

      {/* Step 2.1: Pratinjau Deteksi Toko Card matching video 0:07 - 0:10 */}
      {stagedFiles.length > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Pratinjau deteksi toko
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
                Periksa tiap baris.{" "}
                <span className="text-emerald-700 font-semibold">
                  Hijau = dikenali.
                </span>{" "}
                <span className="text-amber-700 font-semibold">
                  Kuning (tidak dikenali):
                </span>{" "}
                pilih toko dan centang konfirmasi; sidik jarinya dipelajari.{" "}
                <span className="text-rose-700 font-semibold">
                  Merah (konflik):
                </span>{" "}
                ada bukti menunjuk toko lain; toko yang ditolak tidak dapat
                dipilih.
              </p>
            </div>
            <button
              onClick={() => setShowSkuModal(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <PackageCheck className="w-3.5 h-3.5 text-[#15803d]" />
              <span>
                Cek ulang SKU{" "}
                {allUnmappedSkus.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                    {allUnmappedSkus.length} baru
                  </span>
                )}
              </span>
            </button>
          </div>

          <div className="text-xs font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
            {isParsing
              ? "Menganalisis file..."
              : `Analisis selesai: ${stagedFiles.length} file terbaca (${savableFiles.length} siap disimpan).`}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase">
                  <th className="py-2 pr-3">File & Status Sidik Jari</th>
                  <th className="py-2 px-3">Toko & Jenis</th>
                  <th className="py-2 px-3 text-right">
                    Ekstraksi (Omzet / HPP / PPh 22)
                  </th>
                  <th className="py-2 pl-3">Periode & Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {stagedFiles.map((file) => {
                  const isGreen =
                    file.status === "RECOGNIZED" || file.fingerprintConfirmed;
                  const isYellow =
                    file.status === "UNKNOWN_STORE" &&
                    !file.fingerprintConfirmed;
                  const isRed = file.status === "CONFLICT";

                  return (
                    <tr
                      key={file.id}
                      className={`border-l-4 ${
                        isGreen
                          ? "border-l-[#15803d]"
                          : isYellow
                          ? "border-l-amber-500 bg-amber-50/30"
                          : "border-l-rose-600 bg-rose-50/30"
                      }`}
                    >
                      <td className="py-3 pl-3 pr-3 align-top">
                        <div className="font-bold text-slate-900 break-all">
                          {file.fileName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {file.sizeKB} KB · Kolom:{" "}
                          {file.detectedColumns.slice(0, 5).join(", ")}
                        </div>
                        {isGreen && (
                          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Selesai dianalisis · Sidik jari dikenali</span>
                          </div>
                        )}
                        {isYellow && (
                          <div className="text-[11px] text-amber-800 font-semibold mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>
                              Format Custom / Toko belum dikenali — Pilih toko &
                              konfirmasi
                            </span>
                          </div>
                        )}
                        {isRed && (
                          <div className="text-[11px] text-rose-700 font-semibold mt-1 flex items-start gap-1">
                            <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>DITOLAK (Konflik): {file.conflictReason}</span>
                          </div>
                        )}
                      </td>

                      {/* Store selection for Yellow rows */}
                      <td className="py-3 px-3 text-slate-700 align-top">
                        {file.status === "UNKNOWN_STORE" ? (
                          <div className="space-y-2 bg-white p-2.5 rounded-xl border border-amber-200">
                            <select
                              value={file.storeId}
                              onChange={(e) =>
                                handleAssignUnknownStore(
                                  file.id,
                                  e.target.value,
                                  Boolean(file.fingerprintConfirmed)
                                )
                              }
                              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold"
                            >
                              {stores.map((st) => (
                                <option key={st.id} value={st.id}>
                                  {st.platform} · {st.name}
                                </option>
                              ))}
                            </select>
                            <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(file.fingerprintConfirmed)}
                                onChange={(e) =>
                                  handleAssignUnknownStore(
                                    file.id,
                                    file.storeId,
                                    e.target.checked
                                  )
                                }
                                className="rounded text-[#15803d]"
                              />
                              <span>Konfirmasi & pelajari sidik jari</span>
                            </label>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
                              {file.platform}
                            </span>
                            <div className="font-semibold">{file.storeName}</div>
                            <div className="text-[11px] text-slate-500">
                              {file.reportType}
                            </div>
                          </div>
                        )}
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

                      <td className="py-3 pl-3 text-slate-500 align-top space-y-2">
                        <div>
                          {file.periodStart} – {file.periodEnd}
                        </div>
                        {/* Step 2.3: AI Column Mapper Button */}
                        <button
                          onClick={() => handleOpenAiMapper(file)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-[#15803d] text-slate-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          <span>AI Column Mapper</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleSaveAllStaged}
              disabled={isSaving || savableFiles.length === 0}
              className="px-4 py-2.5 rounded-xl bg-[#15803d] hover:bg-[#166534] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              {isSaving
                ? "Menyimpan..."
                : `Simpan semua (${savableFiles.length} file valid)`}
            </button>
            <button
              onClick={() => setStagedFiles([])}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium cursor-pointer"
            >
              Bersihkan Pratinjau
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
              <span>Google Drive / Sheets API</span>
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

        {/* Step 2.4: Google Drive Watch Folder & Google Sheets Link Importer */}
        {showGdriveInput && (
          <form
            onSubmit={handleGDriveImport}
            className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5"
          >
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-[#15803d]" />
              <span>
                Sinkronisasi Google Drive Watch Folder / URL Google Spreadsheet
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Tempel link Google Spreadsheet publik atau kosongkan untuk menarik
              3 laporan terbaru (TikTok, Shopee, Tokopedia) dari{" "}
              <strong>Bookventory Google Drive Watch Folder</strong>:
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={gdriveUrl}
                onChange={(e) => setGdriveUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/... (atau kosongkan untuk Watch Folder)"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#15803d]"
              />
              <button
                type="submit"
                disabled={gdriveLoading}
                className="px-4 py-2 rounded-xl bg-[#15803d] text-white text-xs font-semibold shrink-0 cursor-pointer"
              >
                {gdriveLoading
                  ? "Menarik dari GDrive..."
                  : "Tarik dari Google Drive"}
              </button>
            </div>
          </form>
        )}

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
            File dengan nama sama menggantikan yang lama di pratinjau.
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
              — 109 pesanan, 18 settlement/penyesuaian, 1 mutasi saldo
            </div>
            <div>
              <span className="font-semibold underline">topherbal.id</span> — 87
              pesanan, 14 settlement/penyesuaian
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Buat Draft Jurnal per Tanggal Cair matching video 0:13 - 0:15 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            2. Buat draft jurnal
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Satu draft per toko per tanggal cair. Draft yang sudah disetujui
            tidak diubah; tambahannya jadi draft Selisih. Settlement sebelum 2
            Okt 2026 diabaikan · toko dengan batch PERLU_DICEK belum bisa
            disetujui.
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
            <option value="store-tokopedia-1">
              Tokopedia · Topherbal Tokopedia Mall
            </option>
            <option value="store-pos-1">
              POS / Custom Excel · Penjualan Grosir
            </option>
            <option value="ALL">Semua Toko Sekaligus</option>
          </select>
        </div>

        <button
          onClick={handleCreateDraftJournal}
          className="w-full py-2.5 px-4 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
        >
          Buat draft jurnal
        </button>

        {/* Per-Settlement-Date Breakdown Table matching video 0:15 */}
        {draftResultTable && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-600 font-medium">
              Draft jurnal diproses ·{" "}
              <strong className="text-slate-900">
                {draftResultTable.storeLabel}
              </strong>{" "}
              · {draftResultTable.rows.length} kelompok tanggal cair —{" "}
              <span className="text-[#15803d] font-bold">
                {draftResultTable.createdCount} dibuat
              </span>
              , {draftResultTable.discrepancyDraftCount} selisih Rp 1,{" "}
              {draftResultTable.skippedCount} tetap.
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase">
                    <th className="py-2 pr-3">Tanggal</th>
                    <th className="py-2 px-3">Jenis</th>
                    <th className="py-2 px-3 text-center">Jml</th>
                    <th className="py-2 pl-3 text-right">Total Debit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {draftResultTable.rows.map((r, i) => (
                    <tr key={`${r.tanggal}-${r.jenis}-${i}`}>
                      <td className="py-2.5 pr-3 text-slate-800">
                        {r.tanggal}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            r.jenis === "Selisih"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {r.jenis}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-700">
                        {r.jml}
                      </td>
                      <td className="py-2.5 pl-3 text-right font-bold text-slate-900">
                        {formatIDR(r.totalDebit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
              <span>
                {draftResultTable.createdCount +
                  draftResultTable.discrepancyDraftCount}{" "}
                draft dibuat (Debit = Kredit seimbang)
              </span>
              <Link
                href="/antrian"
                className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 font-bold shrink-0"
              >
                Lihat di Antrian
              </Link>
            </div>
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
          <button
            onClick={() => setShowSkuModal(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center cursor-pointer"
          >
            Cek ulang SKU
          </button>
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

      {/* Step 2.3 Modal: AI Fallback Column Mapper */}
      {mappingModalFile && tempMapping && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#15803d]" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  AI Fallback Column Mapper (Excel Custom)
                </h3>
              </div>
              <button
                onClick={() => setMappingModalFile(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {aiMapperNote && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
                {aiMapperNote}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {(
                [
                  { key: "orderIdCol", label: "Kolom No. Pesanan / Invoice" },
                  { key: "dateCol", label: "Kolom Tanggal Cair / Transaksi" },
                  { key: "skuCol", label: "Kolom Kode SKU / Produk" },
                  { key: "qtyCol", label: "Kolom Kuantitas (Qty)" },
                  { key: "grossSalesCol", label: "Kolom Omzet / Harga Jual" },
                  { key: "feeCol", label: "Kolom Fee / Potongan Platform" },
                  { key: "pph22Col", label: "Kolom Pajak (PPh 22 / PPN)" },
                  { key: "netSettlementCol", label: "Kolom Dana Bersih Cair" },
                ] as const
              ).map((field) => (
                <div key={field.key}>
                  <label className="block font-medium text-slate-600 mb-1">
                    {field.label}
                  </label>
                  <select
                    value={tempMapping[field.key]}
                    onChange={(e) =>
                      setTempMapping({
                        ...tempMapping,
                        [field.key]: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-800 bg-white"
                  >
                    {mappingModalFile.rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                    <option value={tempMapping[field.key]}>
                      {tempMapping[field.key]}
                    </option>
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setMappingModalFile(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                Batal
              </button>
              <button
                onClick={handleApplyColumnMapping}
                className="px-4 py-2 rounded-xl bg-[#15803d] text-white text-xs font-semibold cursor-pointer"
              >
                Terapkan Mapping & Hitung Ulang HPP/Pajak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2.1 Modal: Cek Ulang SKU Validator */}
      {showSkuModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-[#15803d]" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Validasi & Cek Ulang SKU (Mapping ke Master HPP)
                </h3>
              </div>
              <button
                onClick={() => setShowSkuModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="font-semibold text-slate-700">
                SKU Terdaftar di Master Formula BOM:
              </div>
              <div className="divide-y divide-slate-100 bg-slate-50 rounded-xl p-3 font-mono">
                {Object.entries(MASTER_SKU_HPP).map(([sku, info]) => (
                  <div key={sku} className="py-1.5 flex justify-between">
                    <span>
                      <strong>{sku}</strong> — {info.name}
                    </span>
                    <span className="text-[#15803d] font-bold">
                      HPP: {formatIDR(info.hpp)}
                    </span>
                  </div>
                ))}
              </div>

              {allUnmappedSkus.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="font-bold text-amber-800">
                    SKU Baru Terdeteksi di File Import (Set HPP Standar):
                  </div>
                  {allUnmappedSkus.map((sku) => (
                    <div
                      key={sku}
                      className="flex items-center justify-between gap-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200"
                    >
                      <span className="font-bold font-mono">{sku}</span>
                      <div className="flex items-center gap-2">
                        <span>HPP (Rp):</span>
                        <input
                          type="number"
                          value={customSkuHpp[sku] || 12500}
                          onChange={(e) =>
                            setCustomSkuHpp({
                              ...customSkuHpp,
                              [sku]: Number(e.target.value),
                            })
                          }
                          className="w-28 rounded-lg border border-slate-300 px-2 py-1 font-mono bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSkuModal(false)}
                className="px-4 py-2 rounded-xl bg-[#15803d] text-white text-xs font-semibold cursor-pointer"
              >
                Simpan & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
