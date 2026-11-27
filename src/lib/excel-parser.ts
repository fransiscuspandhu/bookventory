import * as XLSX from "xlsx";
import { ParsedExcelRow } from "./accounting-data";

export interface ColumnMappingConfig {
  orderIdCol: string;
  dateCol: string;
  skuCol: string;
  qtyCol: string;
  grossSalesCol: string;
  returnCol: string;
  feeCol: string;
  pph22Col: string;
  netSettlementCol: string;
  hppCol: string;
}

export interface SettlementDateGroup {
  settlementDate: string;
  jenis: "Settlement" | "Selisih" | "Mutasi Saldo";
  orderCount: number;
  grossSales: number;
  returnAmount: number;
  marketplaceFee: number;
  pph22Withheld: number;
  adDeduction: number;
  netSettlement: number;
  hppTotal: number;
  totalDebit: number;
  discrepancyRp: number;
}

export interface RealParsedFileResult {
  id: string;
  fileName: string;
  sizeKB: number;
  platform: "TikTok" | "Shopee" | "Tokopedia" | "POS / Custom";
  reportType:
    | "Semua pesanan"
    | "Income (sudah dilepas)"
    | "Order.all"
    | "Income"
    | "Custom Sales Excel";
  storeId: string;
  storeName: string;
  status: "RECOGNIZED" | "UNKNOWN_STORE" | "CONFLICT";
  conflictReason?: string;
  fingerprintConfirmed?: boolean;
  fingerprintSignature: string;
  periodStart: string;
  periodEnd: string;
  orderCount: number;
  settlementCount: number;
  mutationCount: number;
  grossSalesTotal: number;
  returnTotal: number;
  feeTotal: number;
  pph22Total: number;
  adDeductionTotal: number;
  netDisbursed: number;
  hppTotal: number;
  discrepancyTotalRp: number;
  detectedColumns: string[];
  rawHeaders: string[];
  rawSampleRows: Record<string, unknown>[];
  columnMapping: ColumnMappingConfig;
  unmappedSkus: string[];
  settlementGroups: SettlementDateGroup[];
  rows: ParsedExcelRow[];
}

export const MASTER_SKU_HPP: Record<string, { name: string; hpp: number }> = {
  JHM: { name: "Jamu Herbal Madu 250ml", hpp: 12969 },
  KNY: { name: "Kunyit Asam Murni 250ml", hpp: 11850 },
  TML: { name: "Temulawak Ekstrak 250ml", hpp: 12300 },
  "SRB-JHM": { name: "Serbuk Herbal Madu", hpp: 145000 },
  "SRB-KNY": { name: "Serbuk Kunyit Pilihan", hpp: 110000 },
  "SRB-TML": { name: "Serbuk Temulawak", hpp: 88420 },
  BTL: { name: "Botol Plastik PET 250ml", hpp: 2006 },
};

const PII_KEYWORDS = [
  "nama pembeli",
  "buyer name",
  "recipient",
  "no hp",
  "phone",
  "telepon",
  "alamat",
  "address",
  "shipping address",
  "nama penerima",
];

function isPiiColumn(header: string): boolean {
  const lower = header.toLowerCase();
  return PII_KEYWORDS.some((kw) => lower.includes(kw));
}

function cleanNumber(val: unknown): number {
  if (typeof val === "number") return Math.round(val);
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.-]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : Math.round(num);
  }
  return 0;
}

export function autoDetectColumnMapping(headers: string[]): ColumnMappingConfig {
  const findCol = (patterns: string[], fallback: string): string => {
    for (const p of patterns) {
      const match = headers.find((h) => h.toLowerCase().includes(p));
      if (match) return match;
    }
    return fallback;
  };

  return {
    orderIdCol: findCol(
      ["order id", "no. pesanan", "no pesanan", "invoice", "no. nota", "trx"],
      headers[0] || "Order ID"
    ),
    dateCol: findCol(
      [
        "tanggal cair",
        "settlement date",
        "waktu penyelesaian",
        "tanggal",
        "tgl",
        "date",
      ],
      headers[1] || "Tanggal Cair"
    ),
    skuCol: findCol(
      ["sku", "kode barang", "produk", "item", "kode"],
      headers[2] || "SKU"
    ),
    qtyCol: findCol(
      ["qty", "jumlah", "quantity", "jml", "unit"],
      headers[3] || "Qty"
    ),
    grossSalesCol: findCol(
      [
        "harga jual",
        "gross sales",
        "total penjualan",
        "omzet",
        "subtotal",
        "penjualan bruto",
      ],
      headers[4] || "Harga Jual"
    ),
    returnCol: findCol(["retur", "return", "refund", "batal"], "Retur"),
    feeCol: findCol(
      [
        "biaya admin",
        "fee marketplace",
        "total fee",
        "komisi",
        "potongan",
        "admin",
      ],
      "Biaya Admin"
    ),
    pph22Col: findCol(
      ["pph 22", "pajak", "withholding", "pph", "ppn"],
      "PPh 22"
    ),
    netSettlementCol: findCol(
      ["total cair", "dana dilepas", "net settlement", "bersih", "net"],
      "Total Cair"
    ),
    hppCol: findCol(["hpp", "modal", "cogs", "harga pokok"], "HPP Satuan"),
  };
}

export function buildSettlementGroupsFromRows(
  rows: ParsedExcelRow[]
): SettlementDateGroup[] {
  const map = new Map<string, SettlementDateGroup>();

  for (const r of rows) {
    const dateKey = r.settlementDate || "2026-11-24";
    const existing = map.get(dateKey) || {
      settlementDate: dateKey,
      jenis: "Settlement" as const,
      orderCount: 0,
      grossSales: 0,
      returnAmount: 0,
      marketplaceFee: 0,
      pph22Withheld: 0,
      adDeduction: 0,
      netSettlement: 0,
      hppTotal: 0,
      totalDebit: 0,
      discrepancyRp: 0,
    };

    existing.orderCount += 1;
    existing.grossSales += r.grossSales;
    existing.returnAmount += r.returnAmount;
    existing.marketplaceFee += r.marketplaceFee;
    existing.pph22Withheld += r.pph22Withheld;
    existing.adDeduction += r.adDeduction;
    existing.netSettlement += r.netSettlement;
    existing.hppTotal += r.totalHpp;

    // Check Rp 1 rounding discrepancy between Gross - Return - Fee - PPh22 - Ad and NetSettlement
    const expectedNet =
      existing.grossSales -
      existing.returnAmount -
      existing.marketplaceFee -
      existing.pph22Withheld -
      existing.adDeduction;
    existing.discrepancyRp = expectedNet - existing.netSettlement;
    existing.totalDebit = existing.grossSales + existing.hppTotal;

    map.set(dateKey, existing);
  }

  return Array.from(map.values()).sort((a, b) =>
    a.settlementDate.localeCompare(b.settlementDate)
  );
}

export function parseRowsWithMapping(
  fileName: string,
  sizeKB: number,
  rawJson: Record<string, unknown>[],
  mapping: ColumnMappingConfig,
  learnedFingerprints: Record<
    string,
    { storeId: string; storeName: string; platform: RealParsedFileResult["platform"] }
  >,
  customSkuHpp: Record<string, number> = {}
): RealParsedFileResult {
  const rawHeaders =
    rawJson.length > 0
      ? Object.keys(rawJson[0])
      : [
          "Order ID",
          "Tanggal Cair",
          "SKU",
          "Qty",
          "Harga Jual",
          "Biaya Admin",
          "PPh 22",
          "Total Cair",
        ];

  const headerSignature = rawHeaders
    .filter((h) => !isPiiColumn(h))
    .map((h) => h.toLowerCase().trim())
    .sort()
    .join("|");

  const headerLower = rawHeaders.map((h) => h.toLowerCase()).join(" | ");
  const fileLower = fileName.toLowerCase();

  // 1. Fingerprint Detection (Hijau = Recognized, Kuning = Unknown Store, Merah = Conflict)
  let platform: RealParsedFileResult["platform"] = "POS / Custom";
  let storeId = "store-pos-1";
  let storeName = "Belum Dipilih (Pilih Toko)";
  let reportType: RealParsedFileResult["reportType"] = "Custom Sales Excel";
  let status: RealParsedFileResult["status"] = "UNKNOWN_STORE";
  let conflictReason: string | undefined;

  // Check conflict first (e.g., filename says Shopee but content/store is from another company or conflicting store)
  const hasTikTokEvidence =
    fileLower.includes("tiktok") ||
    fileLower.includes("topherbalofficial") ||
    headerLower.includes("gmv");
  const hasShopeeEvidence =
    fileLower.includes("shopee") ||
    fileLower.includes("topherbal.id") ||
    fileLower.includes("dilepas") ||
    headerLower.includes("dana dilepas");

  if (
    (hasTikTokEvidence && hasShopeeEvidence) ||
    fileLower.includes("konflik") ||
    fileLower.includes("conflict")
  ) {
    status = "CONFLICT";
    platform = "Shopee";
    storeId = "store-shopee-1";
    storeName = "Konflik Sidik Jari Toko";
    conflictReason =
      "Bukti header/isi file menunjuk ke TikTok Official, tetapi metadata file menunjuk ke Shopee topherbal.id. Ditolak otomatis agar buku besar tidak tercampur.";
  } else if (learnedFingerprints[headerSignature]) {
    const learned = learnedFingerprints[headerSignature];
    status = "RECOGNIZED";
    storeId = learned.storeId;
    storeName = learned.storeName;
    platform = learned.platform;
    reportType = "Custom Sales Excel";
  } else if (hasTikTokEvidence) {
    status = "RECOGNIZED";
    platform = "TikTok";
    storeId = "store-tiktok-1";
    storeName = "Topherbal Official";
    reportType =
      fileLower.includes("income") ||
      fileLower.includes("settlement") ||
      headerLower.includes("tanggal cair")
        ? "Income"
        : "Semua pesanan";
  } else if (hasShopeeEvidence) {
    status = "RECOGNIZED";
    platform = "Shopee";
    storeId = "store-shopee-1";
    storeName = "topherbal.id";
    reportType =
      fileLower.includes("income") ||
      fileLower.includes("dilepas") ||
      headerLower.includes("dana dilepas")
        ? "Income (sudah dilepas)"
        : "Order.all";
  } else if (
    fileLower.includes("tokopedia") ||
    headerLower.includes("tokopedia")
  ) {
    status = "RECOGNIZED";
    platform = "Tokopedia";
    storeId = "store-tokopedia-1";
    storeName = "Topherbal Tokopedia Mall";
    reportType = "Income";
  } else {
    status = "UNKNOWN_STORE";
    platform = "POS / Custom";
    storeId = "store-pos-1";
    storeName = "Toko Belum Dikenali";
    reportType = "Custom Sales Excel";
  }

  // 2. Parse rows using ColumnMappingConfig & strip PII
  const parsedRows: ParsedExcelRow[] = [];
  const unmappedSkuSet = new Set<string>();
  let grossSalesTotal = 0;
  let returnTotal = 0;
  let feeTotal = 0;
  let pph22Total = 0;
  let adDeductionTotal = 0;
  let netDisbursed = 0;
  let hppTotal = 0;

  for (let i = 0; i < rawJson.length; i++) {
    const r = rawJson[i];
    const orderId = String(
      r[mapping.orderIdCol] ||
        r["Order ID"] ||
        r["No. Pesanan"] ||
        r["Invoice"] ||
        `ORD-202611-${1001 + i}`
    );

    const rawDate = String(
      r[mapping.dateCol] ||
        r["Tanggal Cair"] ||
        r["Waktu Penyelesaian"] ||
        r["Tanggal"] ||
        `2026-11-${20 + (i % 5)}`
    ).slice(0, 10);

    const skuRaw = String(
      r[mapping.skuCol] ||
        r["SKU"] ||
        r["Kode Barang"] ||
        (i % 3 === 0 ? "JHM" : i % 3 === 1 ? "KNY" : "TML")
    )
      .trim()
      .toUpperCase();

    const qty = Math.max(
      1,
      cleanNumber(r[mapping.qtyCol] || r["Qty"] || r["Jumlah"] || 2)
    );
    const gross =
      cleanNumber(
        r[mapping.grossSalesCol] ||
          r["Harga Jual"] ||
          r["Total Penjualan"] ||
          r["Omzet"]
      ) || qty * 74500;
    const ret = cleanNumber(r[mapping.returnCol] || r["Retur"] || 0);
    const fee =
      cleanNumber(
        r[mapping.feeCol] ||
          r["Biaya Admin"] ||
          r["Fee Marketplace"] ||
          r["Komisi"]
      ) ?? Math.round(gross * 0.12);
    const pph22 =
      cleanNumber(
        r[mapping.pph22Col] || r["PPh 22"] || r["Pajak PPh 22"] || r["Pajak"]
      ) || Math.round((gross - ret) * 0.005);
    const adDed = cleanNumber(r["Potongan Iklan"] || r["GMV Pay"] || 0);
    const net =
      cleanNumber(
        r[mapping.netSettlementCol] || r["Total Cair"] || r["Dana Dilepas"]
      ) || gross - ret - fee - pph22 - adDed;

    // Lookup HPP in Master SKU or custom overrides
    const knownHpp =
      customSkuHpp[skuRaw] ||
      MASTER_SKU_HPP[skuRaw]?.hpp ||
      cleanNumber(r[mapping.hppCol]);

    if (!knownHpp) {
      unmappedSkuSet.add(skuRaw);
    }

    const unitHpp = knownHpp || 12500;
    const rowHpp = qty * unitHpp;

    parsedRows.push({
      orderId,
      settlementDate: rawDate,
      sku: skuRaw,
      qty,
      grossSales: gross,
      returnAmount: ret,
      marketplaceFee: fee,
      pph22Withheld: pph22,
      adDeduction: adDed,
      netSettlement: net,
      hppPerUnit: unitHpp,
      totalHpp: rowHpp,
    });

    grossSalesTotal += gross;
    returnTotal += ret;
    feeTotal += fee;
    pph22Total += pph22;
    adDeductionTotal += adDed;
    netDisbursed += net;
    hppTotal += rowHpp;
  }

  const settlementGroups = buildSettlementGroupsFromRows(parsedRows);
  const discrepancyTotalRp = settlementGroups.reduce(
    (acc, g) => acc + Math.abs(g.discrepancyRp),
    0
  );

  const dates = settlementGroups.map((g) => g.settlementDate);
  const periodStart = dates[0] || "2026-11-19";
  const periodEnd = dates[dates.length - 1] || "2026-11-25";

  const isSettlementReport =
    reportType === "Income" ||
    reportType === "Income (sudah dilepas)" ||
    reportType === "Custom Sales Excel";

  return {
    id: `staged-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    fileName,
    sizeKB,
    platform,
    reportType,
    storeId,
    storeName,
    status,
    conflictReason,
    fingerprintConfirmed: status === "RECOGNIZED",
    fingerprintSignature: headerSignature,
    periodStart,
    periodEnd,
    orderCount: isSettlementReport ? 0 : parsedRows.length,
    settlementCount: isSettlementReport ? parsedRows.length : 0,
    mutationCount: settlementGroups.length,
    grossSalesTotal,
    returnTotal,
    feeTotal,
    pph22Total,
    adDeductionTotal,
    netDisbursed,
    hppTotal,
    discrepancyTotalRp,
    detectedColumns: rawHeaders.filter((h) => !isPiiColumn(h)),
    rawHeaders,
    rawSampleRows: rawJson.slice(0, 8),
    columnMapping: mapping,
    unmappedSkus: Array.from(unmappedSkuSet),
    settlementGroups,
    rows: parsedRows,
  };
}

export async function parseExcelOrCsvFile(
  file: File,
  learnedFingerprints: Record<
    string,
    { storeId: string; storeName: string; platform: RealParsedFileResult["platform"] }
  > = {},
  customSkuHpp: Record<string, number> = {}
): Promise<RealParsedFileResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
  });

  const headers =
    rawJson.length > 0
      ? Object.keys(rawJson[0])
      : [
          "Order ID",
          "Tanggal Cair",
          "SKU",
          "Qty",
          "Harga Jual",
          "Biaya Admin",
          "PPh 22",
          "Total Cair",
        ];

  const mapping = autoDetectColumnMapping(headers);
  return parseRowsWithMapping(
    file.name,
    Math.max(8, Math.round(file.size / 1024)),
    rawJson,
    mapping,
    learnedFingerprints,
    customSkuHpp
  );
}

export function downloadSampleExcelFile(
  sampleType:
    | "TIKTOK_INCOME"
    | "SHOPEE_INCOME"
    | "CUSTOM_POS"
    | "CONFLICT_SAMPLE"
) {
  let fileName = "Income_TopherbalOfficial_25Nov.xlsx";
  let rows: Record<string, unknown>[] = [];

  if (sampleType === "TIKTOK_INCOME") {
    fileName = "Income_TopherbalOfficial_22-25Nov.xlsx";
    rows = [
      {
        "Order ID": "TT-578192001",
        "Tanggal Cair": "2026-11-23",
        SKU: "JHM",
        Qty: 6,
        "Harga Jual": 480000,
        Retur: 0,
        "Biaya Admin": 57600,
        "PPh 22": 2400,
        "Total Cair": 420000,
        "Nama Pembeli": "Budi Santoso",
      },
      {
        "Order ID": "TT-578192002",
        "Tanggal Cair": "2026-11-24",
        SKU: "KNY",
        Qty: 8,
        "Harga Jual": 600000,
        Retur: 0,
        "Biaya Admin": 72000,
        "PPh 22": 3000,
        "Total Cair": 524999, // Rp 1 selisih settlement intentionally included!
        "Nama Pembeli": "Siti Aminah",
      },
      {
        "Order ID": "TT-578192003",
        "Tanggal Cair": "2026-11-25",
        SKU: "TML",
        Qty: 5,
        "Harga Jual": 375000,
        Retur: 25000,
        "Biaya Admin": 42000,
        "PPh 22": 1750,
        "Total Cair": 306250,
        "Nama Pembeli": "Andi Wijaya",
      },
    ];
  } else if (sampleType === "SHOPEE_INCOME") {
    fileName = "Income.sudah_dilepas.topherbal.id_24-25Nov.xlsx";
    rows = [
      {
        "No. Pesanan": "SP-2611248801",
        "Waktu Penyelesaian": "2026-11-24",
        SKU: "JHM",
        Jumlah: 10,
        "Total Penjualan": 780000,
        Retur: 0,
        "Fee Marketplace": 93600,
        "Pajak PPh 22": 3900,
        "Dana Dilepas": 682500,
      },
      {
        "No. Pesanan": "SP-2611258802",
        "Waktu Penyelesaian": "2026-11-25",
        SKU: "KNY",
        Jumlah: 7,
        "Total Penjualan": 525000,
        Retur: 0,
        "Fee Marketplace": 63000,
        "Pajak PPh 22": 2625,
        "Dana Dilepas": 459373, // Rp 2 selisih settlement
      },
    ];
  } else if (sampleType === "CUSTOM_POS") {
    fileName = "Rekap_Kasir_Cabang_Kemang_Nov2026.xlsx";
    rows = [
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
        "Kode Produk": "SKU-BARU-09", // Unmapped SKU to demonstrate Cek Ulang SKU
        Unit: 10,
        "Penjualan Bruto": 850000,
        Potongan: 15000,
        Pajak: 4250,
        Bersih: 830750,
      },
    ];
  } else {
    fileName = "Konflik_TikTok_vs_Shopee_25Nov.xlsx";
    rows = [
      {
        "Order ID": "CONFLICT-01",
        "Tanggal Cair": "2026-11-25",
        SKU: "JHM",
        Qty: 4,
        "Harga Jual": 300000,
        "Dana Dilepas": 260000,
      },
    ];
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan");
  XLSX.writeFile(wb, fileName);
}
