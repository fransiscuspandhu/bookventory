import Decimal from "decimal.js";

// Configure Decimal for strict financial rounding
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export type AccountCategory =
  | "ASSET_CASH"
  | "ASSET_RECEIVABLE_INVENTORY"
  | "ASSET_FIXED"
  | "LIABILITY_SHORT"
  | "EQUITY"
  | "REVENUE"
  | "CONTRA_REVENUE"
  | "COGS"
  | "EXPENSE"
  | "OTHER_INCOME";

export type NormalBalance = "DEBIT" | "CREDIT";

export interface Account {
  code: string;
  name: string;
  category: AccountCategory;
  normalBalance: NormalBalance;
  openingBalance: number;
  runningMutation: number; // Net change in current period (in normal balance direction)
  closingBalance: number;
  storeTag?: string;
}

export interface Store {
  id: string;
  name: string;
  platform: "TikTok" | "Shopee" | "Tokopedia" | "Offline";
  handle: string;
  fingerprintKeywords: string[];
  walletAccountCode: string;
}

export interface JournalLine {
  id: string;
  accountCode: string;
  accountName: string;
  storeTag?: string;
  debit: number;
  credit: number;
  memo?: string;
}

export type JournalSourceType = "Marketplace" | "Stok" | "Iklan" | "AI (Gemini Pro)";
export type JournalStatus = "MENUNGGU" | "BERMASALAH" | "DISETUJUI" | "DITOLAK";

export interface JournalEntry {
  id: string;
  title: string;
  entryDate: string; // YYYY-MM-DD
  sourceType: JournalSourceType;
  platformTag?: string;
  storeId?: string;
  storeName?: string;
  status: JournalStatus;
  totalAmount: number;
  orderCount?: number;
  adjustmentCount?: number;
  lines: JournalLine[];
  createdAt: string;
  approvedAt?: string;
  errorReason?: string;
}

export interface ImportBatch {
  id: string;
  fileName: string;
  fileSizeKB: number;
  storeId: string;
  storeName: string;
  platform: "TikTok" | "Shopee" | "Custom";
  reportType: "Semua pesanan" | "Income (sudah dilepas)" | "Order.all" | "Income";
  periodStart: string;
  periodEnd: string;
  status: "RECOGNIZED" | "UNKNOWN_STORE" | "CONFLICT";
  orderCount: number;
  settlementCount: number;
  mutationCount: number;
  netDisbursed: number;
  saved: boolean;
  draftGenerated: boolean;
}

export interface InventoryItem {
  sku: string;
  name: string;
  type: "FINISHED_GOOD" | "RAW_MATERIAL" | "PACKAGING";
  unit: string;
  stockQty: number;
  unitCost: number;
  totalValue: number;
  dailyBurnRate: number;
  daysLeft: number;
  leadTimeDays: number;
  critical: boolean;
  bottleneckSku?: string;
  recommendedOrderQty?: number;
  maxPackableUnits?: number;
}

export interface StorePerformanceMetrics {
  storeId: string;
  storeName: string;
  platform: "TikTok" | "Shopee";
  periodLabel: string;
  // Tanggal Order
  orderCount: number;
  omzetOrder: number;
  cancelledCount: number;
  adSpend: number;
  roas: number;
  acosPercent: number;
  unbilledAdDebt: number;
  // Tanggal Cair
  settledSales: number;
  aov: number;
  netPerOrder: number;
  netPercent: number;
  aop: number;
  feePercent: number;
  hppTotal: number;
  contributionMargin: number;
}

export function formatIDR(amount: number): string {
  const isNeg = amount < 0;
  const abs = Math.abs(Math.round(amount));
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${isNeg ? "-Rp" : "Rp"}${formatted}`;
}

export function formatNumberID(amount: number, decimals = 0): string {
  return amount.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function validateDoubleEntry(lines: JournalLine[]): {
  isValid: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
} {
  let debitSum = new Decimal(0);
  let creditSum = new Decimal(0);

  for (const line of lines) {
    debitSum = debitSum.plus(new Decimal(line.debit || 0));
    creditSum = creditSum.plus(new Decimal(line.credit || 0));
  }

  const diff = debitSum.minus(creditSum).abs();
  return {
    isValid: diff.equals(0) && debitSum.greaterThan(0),
    totalDebit: debitSum.toNumber(),
    totalCredit: creditSum.toNumber(),
    difference: diff.toNumber(),
  };
}

// Initial Seed Data matching the exact numbers & scenarios from the Topherbal Reference Video
export const INITIAL_STORES: Store[] = [
  {
    id: "store-tiktok-1",
    name: "Topherbal Official",
    platform: "TikTok",
    handle: "TopherbalOfficial",
    fingerprintKeywords: ["TopherbalOfficial", "TikTok", "All_order_Topherbal"],
    walletAccountCode: "1106",
  },
  {
    id: "store-shopee-1",
    name: "topherbal.id",
    platform: "Shopee",
    handle: "topherbal.id",
    fingerprintKeywords: ["topherbal.id", "Shopee", "Income.sudah_dilepas"],
    walletAccountCode: "1109",
  },
  {
    id: "store-shopee-2",
    name: "jamuku.official",
    platform: "Shopee",
    handle: "jamuku.official",
    fingerprintKeywords: ["jamuku.official"],
    walletAccountCode: "1109",
  },
  {
    id: "store-shopee-3",
    name: "herbalsehat",
    platform: "Shopee",
    handle: "herbalsehat",
    fingerprintKeywords: ["herbalsehat"],
    walletAccountCode: "1111",
  },
];

export const INITIAL_ACCOUNTS: Account[] = [
  // 11xx Kas & Bank + Wallet Marketplace
  {
    code: "1102",
    name: "BCA PT",
    category: "ASSET_CASH",
    normalBalance: "DEBIT",
    openingBalance: 199014118,
    runningMutation: 57329982,
    closingBalance: 256344100,
  },
  {
    code: "1106",
    name: "Saldo Penjual - TikTok Topherbal Official",
    category: "ASSET_CASH",
    normalBalance: "DEBIT",
    openingBalance: 1840000,
    runningMutation: 776561,
    closingBalance: 2616561,
    storeTag: "Topherbal Official",
  },
  {
    code: "1109",
    name: "Saldo Penjual - Shopee topherbal.id",
    category: "ASSET_CASH",
    normalBalance: "DEBIT",
    openingBalance: 1210000,
    runningMutation: 609562,
    closingBalance: 1819562,
    storeTag: "topherbal.id",
  },
  // 12xx Piutang, Persediaan & Dibayar di Muka
  {
    code: "1206",
    name: "Persediaan Barang Jadi",
    category: "ASSET_RECEIVABLE_INVENTORY",
    normalBalance: "DEBIT",
    openingBalance: 3850000,
    runningMutation: -1698544,
    closingBalance: 2151456,
  },
  {
    code: "1209",
    name: "Saldo Iklan Dibayar Dimuka",
    category: "ASSET_RECEIVABLE_INVENTORY",
    normalBalance: "DEBIT",
    openingBalance: 125629,
    runningMutation: 71232,
    closingBalance: 196861,
  },
  {
    code: "1213",
    name: "Persediaan Bahan Baku",
    category: "ASSET_RECEIVABLE_INVENTORY",
    normalBalance: "DEBIT",
    openingBalance: 4520000,
    runningMutation: -3236317,
    closingBalance: 1283683,
  },
  {
    code: "1214",
    name: "Persediaan Kemasan",
    category: "ASSET_RECEIVABLE_INVENTORY",
    normalBalance: "DEBIT",
    openingBalance: 2150000,
    runningMutation: -1186978,
    closingBalance: 963022,
  },
  {
    code: "1217",
    name: "Perlengkapan",
    category: "ASSET_RECEIVABLE_INVENTORY",
    normalBalance: "DEBIT",
    openingBalance: 1155000,
    runningMutation: 0,
    closingBalance: 1155000,
  },
  {
    code: "1218",
    name: "PPh 22 Dibayar Dimuka",
    category: "ASSET_RECEIVABLE_INVENTORY",
    normalBalance: "DEBIT",
    openingBalance: 640000,
    runningMutation: 272185,
    closingBalance: 912185,
  },
  // 13xx Aset Tetap
  {
    code: "1301",
    name: "Peralatan",
    category: "ASSET_FIXED",
    normalBalance: "DEBIT",
    openingBalance: 20050000,
    runningMutation: 0,
    closingBalance: 20050000,
  },
  // 21xx Utang Jangka Pendek
  {
    code: "2112",
    name: "Utang Iklan TikTok (GMV Pay)",
    category: "LIABILITY_SHORT",
    normalBalance: "CREDIT",
    openingBalance: 2375454,
    runningMutation: 401136,
    closingBalance: 2776590,
  },
  // 31xx Modal & Ekuitas
  {
    code: "3101",
    name: "Modal Disetor - Pemegang Saham A",
    category: "EQUITY",
    normalBalance: "CREDIT",
    openingBalance: 120000000,
    runningMutation: 0,
    closingBalance: 120000000,
  },
  {
    code: "3102",
    name: "Modal Disetor - Pemegang Saham B",
    category: "EQUITY",
    normalBalance: "CREDIT",
    openingBalance: 80000000,
    runningMutation: 0,
    closingBalance: 80000000,
  },
  {
    code: "3104",
    name: "Laba/Rugi Periode Berjalan",
    category: "EQUITY",
    normalBalance: "CREDIT",
    openingBalance: 34889162,
    runningMutation: 49826678,
    closingBalance: 84715840,
  },
  // 41xx - 42xx Pendapatan
  {
    code: "4112",
    name: "Penjualan Marketplace",
    category: "REVENUE",
    normalBalance: "CREDIT",
    openingBalance: 88200000,
    runningMutation: 95120000,
    closingBalance: 183320000,
  },
  {
    code: "4201",
    name: "Retur Penjualan",
    category: "CONTRA_REVENUE",
    normalBalance: "DEBIT",
    openingBalance: 1406827,
    runningMutation: 2342410,
    closingBalance: 3749237,
  },
  // 51xx - 58xx HPP & Beban
  {
    code: "5101",
    name: "HPP Barang Jadi",
    category: "COGS",
    normalBalance: "DEBIT",
    openingBalance: 14025256,
    runningMutation: 15013838,
    closingBalance: 29039094,
  },
  {
    code: "5203",
    name: "Beban Fee & Promo Marketplace",
    category: "EXPENSE",
    normalBalance: "DEBIT",
    openingBalance: 9850000,
    runningMutation: 11374824,
    closingBalance: 21224824,
  },
  {
    code: "5301",
    name: "By Pemasaran META ADS",
    category: "EXPENSE",
    normalBalance: "DEBIT",
    openingBalance: 4500000,
    runningMutation: 5450000,
    closingBalance: 9950000,
  },
  {
    code: "5308",
    name: "Beban Iklan Marketplace",
    category: "EXPENSE",
    normalBalance: "DEBIT",
    openingBalance: 3200000,
    runningMutation: 3512250,
    closingBalance: 6712250,
  },
  {
    code: "5401",
    name: "By Gaji Karyawan",
    category: "EXPENSE",
    normalBalance: "DEBIT",
    openingBalance: 7600000,
    runningMutation: 7600000,
    closingBalance: 15200000,
  },
  {
    code: "5803",
    name: "Pendapatan Lain: Kompensasi Marketplace",
    category: "OTHER_INCOME",
    normalBalance: "CREDIT",
    openingBalance: 120000,
    runningMutation: 18032,
    closingBalance: 138032,
  },
];

export const INITIAL_JOURNAL_DRAFTS: JournalEntry[] = [
  {
    id: "draft-1",
    title: "Settlement TikTok Topherbal Official 2026-11-24: 18 order",
    entryDate: "2026-11-24",
    sourceType: "Marketplace",
    platformTag: "Marketplace",
    storeId: "store-tiktok-1",
    storeName: "Topherbal Official",
    status: "MENUNGGU",
    totalAmount: 1655026,
    orderCount: 18,
    createdAt: "2026-11-24T15:30:00Z",
    lines: [
      {
        id: "l-101",
        accountCode: "1206",
        accountName: "Persediaan Barang Jadi",
        storeTag: "Topherbal Official",
        debit: 0,
        credit: 233448,
      },
      {
        id: "l-102",
        accountCode: "5101",
        accountName: "HPP Barang Jadi",
        storeTag: "Topherbal Official",
        debit: 233448,
        credit: 0,
      },
      {
        id: "l-103",
        accountCode: "1106",
        accountName: "Saldo Penjual - TikTok Topherbal Official",
        storeTag: "Topherbal Official",
        debit: 1243273,
        credit: 0,
      },
      {
        id: "l-104",
        accountCode: "1218",
        accountName: "PPh 22 Dibayar Dimuka",
        storeTag: "Topherbal Official",
        debit: 7108,
        credit: 0,
      },
      {
        id: "l-105",
        accountCode: "4112",
        accountName: "Penjualan Marketplace",
        storeTag: "Topherbal Official",
        debit: 0,
        credit: 1421578,
      },
      {
        id: "l-106",
        accountCode: "5203",
        accountName: "Beban Fee & Promo Marketplace",
        storeTag: "Topherbal Official",
        debit: 171197,
        credit: 0,
      },
    ],
  },
  {
    id: "draft-2",
    title: "Settlement Shopee topherbal.id 2026-11-22: 17 order, 1 penyesuaian",
    entryDate: "2026-11-22",
    sourceType: "Marketplace",
    platformTag: "Marketplace",
    storeId: "store-shopee-1",
    storeName: "topherbal.id",
    status: "MENUNGGU",
    totalAmount: 1514006,
    orderCount: 17,
    adjustmentCount: 1,
    createdAt: "2026-11-24T15:31:00Z",
    lines: [
      {
        id: "l-201",
        accountCode: "1206",
        accountName: "Persediaan Barang Jadi",
        storeTag: "topherbal.id",
        debit: 0,
        credit: 209361,
      },
      {
        id: "l-202",
        accountCode: "1209",
        accountName: "Saldo Iklan Dibayar Dimuka",
        storeTag: "topherbal.id",
        debit: 0,
        credit: 8791,
      },
      {
        id: "l-203",
        accountCode: "5101",
        accountName: "HPP Barang Jadi",
        storeTag: "topherbal.id",
        debit: 209361,
        credit: 0,
      },
      {
        id: "l-204",
        accountCode: "1109",
        accountName: "Saldo Penjual - Shopee topherbal.id",
        storeTag: "topherbal.id",
        debit: 1120229,
        credit: 0,
      },
      {
        id: "l-205",
        accountCode: "1218",
        accountName: "PPh 22 Dibayar Dimuka",
        storeTag: "topherbal.id",
        debit: 6437,
        credit: 0,
      },
      {
        id: "l-206",
        accountCode: "4112",
        accountName: "Penjualan Marketplace",
        storeTag: "topherbal.id",
        debit: 0,
        credit: 1286613,
      },
      {
        id: "l-207",
        accountCode: "5803",
        accountName: "Pendapatan Lain: Kompensasi Marketplace",
        storeTag: "topherbal.id",
        debit: 0,
        credit: 18032,
      },
      {
        id: "l-208",
        accountCode: "5203",
        accountName: "Beban Fee & Promo Marketplace",
        storeTag: "topherbal.id",
        debit: 169188,
        credit: 0,
      },
    ],
  },
  {
    id: "draft-3",
    title: "Settlement TikTok Topherbal Official 2026-11-22: 22 order",
    entryDate: "2026-11-22",
    sourceType: "Marketplace",
    platformTag: "Marketplace",
    storeId: "store-tiktok-1",
    storeName: "Topherbal Official",
    status: "MENUNGGU",
    totalAmount: 2288627,
    orderCount: 22,
    createdAt: "2026-11-24T15:32:00Z",
    lines: [
      {
        id: "l-301",
        accountCode: "1206",
        accountName: "Persediaan Barang Jadi",
        storeTag: "Topherbal Official",
        debit: 0,
        credit: 315684,
      },
      {
        id: "l-302",
        accountCode: "4201",
        accountName: "Retur Penjualan",
        storeTag: "Topherbal Official",
        debit: 146020,
        credit: 0,
      },
      {
        id: "l-303",
        accountCode: "5101",
        accountName: "HPP Barang Jadi",
        storeTag: "Topherbal Official",
        debit: 315684,
        credit: 0,
      },
      {
        id: "l-304",
        accountCode: "1106",
        accountName: "Saldo Penjual - TikTok Topherbal Official",
        storeTag: "Topherbal Official",
        debit: 1608053,
        credit: 0,
      },
      {
        id: "l-305",
        accountCode: "1218",
        accountName: "PPh 22 Dibayar Dimuka",
        storeTag: "Topherbal Official",
        debit: 9865,
        credit: 0,
      },
      {
        id: "l-306",
        accountCode: "4112",
        accountName: "Penjualan Marketplace",
        storeTag: "Topherbal Official",
        debit: 0,
        credit: 1972943,
      },
      {
        id: "l-307",
        accountCode: "5203",
        accountName: "Beban Fee & Promo Marketplace",
        storeTag: "Topherbal Official",
        debit: 209005,
        credit: 0,
      },
    ],
  },
  {
    id: "draft-4",
    title: "Iklan TikTok GMV Max Topherbal Official 01/11/2026–23/11/2026: total 3.287.625 (termasuk PPN 11%), sudah dibukukan 2.915.957, selisih 371.668",
    entryDate: "2026-11-23",
    sourceType: "Iklan",
    platformTag: "Marketplace",
    storeId: "store-tiktok-1",
    storeName: "Topherbal Official",
    status: "MENUNGGU",
    totalAmount: 371668,
    createdAt: "2026-11-24T15:33:00Z",
    lines: [
      {
        id: "l-401",
        accountCode: "5308",
        accountName: "Beban Iklan Marketplace",
        storeTag: "Topherbal Official",
        debit: 371668,
        credit: 0,
      },
      {
        id: "l-402",
        accountCode: "2112",
        accountName: "Utang Iklan TikTok (GMV Pay)",
        storeTag: "Topherbal Official",
        debit: 0,
        credit: 371668,
      },
    ],
  },
  {
    id: "draft-5",
    title: "Selisih Settlement Shopee jamuku.official 2026-11-17: 5 order",
    entryDate: "2026-11-17",
    sourceType: "Marketplace",
    platformTag: "Marketplace",
    storeId: "store-shopee-2",
    storeName: "jamuku.official",
    status: "MENUNGGU",
    totalAmount: 1,
    orderCount: 5,
    createdAt: "2026-11-24T15:34:00Z",
    lines: [
      {
        id: "l-501",
        accountCode: "1206",
        accountName: "Persediaan Barang Jadi",
        storeTag: "jamuku.official",
        debit: 0,
        credit: 1,
      },
      {
        id: "l-502",
        accountCode: "5101",
        accountName: "HPP Barang Jadi",
        storeTag: "jamuku.official",
        debit: 1,
        credit: 0,
      },
    ],
  },
  {
    id: "draft-6",
    title: "Pembelian UD Kemasan Jaya nota INV-20261123-901: 2 item, total 3.427.500 (ongkir 60.000)",
    entryDate: "2026-11-23",
    sourceType: "Stok",
    platformTag: "AI (Gemini Pro)",
    status: "MENUNGGU",
    totalAmount: 3427500,
    createdAt: "2026-11-24T15:35:00Z",
    lines: [
      {
        id: "l-601",
        accountCode: "1214",
        accountName: "Persediaan Kemasan",
        debit: 3427500,
        credit: 0,
      },
      {
        id: "l-602",
        accountCode: "1102",
        accountName: "BCA PT",
        debit: 0,
        credit: 3427500,
      },
    ],
  },
  {
    id: "draft-7",
    title: "Gaji 2 staff gudang",
    entryDate: "2026-11-23",
    sourceType: "AI (Gemini Pro)",
    platformTag: "AI (Gemini Pro)",
    status: "MENUNGGU",
    totalAmount: 7600000,
    createdAt: "2026-11-24T15:36:00Z",
    lines: [
      {
        id: "l-701",
        accountCode: "5401",
        accountName: "By Gaji Karyawan",
        debit: 7600000,
        credit: 0,
      },
      {
        id: "l-702",
        accountCode: "1102",
        accountName: "BCA PT",
        debit: 0,
        credit: 7600000,
      },
    ],
  },
  {
    id: "draft-8",
    title: "Meta Ads November pekan 4",
    entryDate: "2026-11-23",
    sourceType: "AI (Gemini Pro)",
    platformTag: "AI (Gemini Pro)",
    status: "MENUNGGU",
    totalAmount: 1500000,
    createdAt: "2026-11-24T15:37:00Z",
    lines: [
      {
        id: "l-801",
        accountCode: "5301",
        accountName: "By Pemasaran META ADS",
        debit: 1500000,
        credit: 0,
      },
      {
        id: "l-802",
        accountCode: "1102",
        accountName: "BCA PT",
        debit: 0,
        credit: 1500000,
      },
    ],
  },
];

export const INITIAL_IMPORT_BATCHES: ImportBatch[] = [
  {
    id: "imp-1",
    fileName: "All_order_TopherbalOfficial_19-24Nov.csv",
    fileSizeKB: 34,
    storeId: "store-tiktok-1",
    storeName: "Topherbal Official",
    platform: "TikTok",
    reportType: "Semua pesanan",
    periodStart: "19 Nov 2026",
    periodEnd: "24 Nov 2026",
    status: "RECOGNIZED",
    orderCount: 109,
    settlementCount: 0,
    mutationCount: 0,
    netDisbursed: 0,
    saved: true,
    draftGenerated: true,
  },
  {
    id: "imp-2",
    fileName: "Income_TopherbalOfficial_24Nov.xlsx",
    fileSizeKB: 22,
    storeId: "store-tiktok-1",
    storeName: "Topherbal Official",
    platform: "TikTok",
    reportType: "Income",
    periodStart: "24 Nov 2026",
    periodEnd: "24 Nov 2026",
    status: "RECOGNIZED",
    orderCount: 0,
    settlementCount: 18,
    mutationCount: 1,
    netDisbursed: 1243273,
    saved: true,
    draftGenerated: true,
  },
  {
    id: "imp-3",
    fileName: "Income.sudah_dilepas.topherbal.id_24Nov.xlsx",
    fileSizeKB: 32,
    storeId: "store-shopee-1",
    storeName: "topherbal.id",
    platform: "Shopee",
    reportType: "Income (sudah dilepas)",
    periodStart: "24 Nov 2026",
    periodEnd: "24 Nov 2026",
    status: "RECOGNIZED",
    orderCount: 0,
    settlementCount: 14,
    mutationCount: 0,
    netDisbursed: 1099531,
    saved: true,
    draftGenerated: true,
  },
  {
    id: "imp-4",
    fileName: "Order.all.topherbal.id_19-24Nov.xlsx",
    fileSizeKB: 102,
    storeId: "store-shopee-1",
    storeName: "topherbal.id",
    platform: "Shopee",
    reportType: "Order.all",
    periodStart: "19 Nov 2026",
    periodEnd: "24 Nov 2026",
    status: "RECOGNIZED",
    orderCount: 87,
    settlementCount: 0,
    mutationCount: 0,
    netDisbursed: 0,
    saved: true,
    draftGenerated: true,
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    sku: "JHM",
    name: "Jamu Herbal Madu 250ml",
    type: "FINISHED_GOOD",
    unit: "botol",
    stockQty: -37,
    unitCost: 12969,
    totalValue: 842985,
    dailyBurnRate: 23.4,
    daysLeft: 3,
    leadTimeDays: 3,
    critical: true,
    bottleneckSku: "SRB-JHM",
    maxPackableUnits: 65,
  },
  {
    sku: "KNY",
    name: "Kunyit Asam Murni 250ml",
    type: "FINISHED_GOOD",
    unit: "botol",
    stockQty: -35,
    unitCost: 11850,
    totalValue: 745200,
    dailyBurnRate: 44.1,
    daysLeft: 3,
    leadTimeDays: 3,
    critical: true,
    bottleneckSku: "SRB-KNY",
  },
  {
    sku: "TML",
    name: "Temulawak Ekstrak 250ml",
    type: "FINISHED_GOOD",
    unit: "botol",
    stockQty: -29,
    unitCost: 12300,
    totalValue: 563271,
    dailyBurnRate: 32.9,
    daysLeft: 3,
    leadTimeDays: 3,
    critical: true,
    bottleneckSku: "SRB-TML",
  },
  {
    sku: "SRB-JHM",
    name: "Serbuk Herbal Madu",
    type: "RAW_MATERIAL",
    unit: "kg",
    stockQty: 3.0,
    unitCost: 145000,
    totalValue: 435000,
    dailyBurnRate: 1.1,
    daysLeft: 3,
    leadTimeDays: 4,
    critical: true,
    recommendedOrderQty: 31.6,
  },
  {
    sku: "SRB-KNY",
    name: "Serbuk Kunyit Pilihan",
    type: "RAW_MATERIAL",
    unit: "kg",
    stockQty: 4.5,
    unitCost: 110000,
    totalValue: 495000,
    dailyBurnRate: 2.2,
    daysLeft: 3,
    leadTimeDays: 4,
    critical: true,
    recommendedOrderQty: 66.3,
  },
  {
    sku: "SRB-TML",
    name: "Serbuk Temulawak",
    type: "RAW_MATERIAL",
    unit: "kg",
    stockQty: 4.0,
    unitCost: 88420,
    totalValue: 353683,
    dailyBurnRate: 1.7,
    daysLeft: 3,
    leadTimeDays: 4,
    critical: true,
    recommendedOrderQty: 51.0,
  },
  {
    sku: "BTL",
    name: "Botol Plastik PET 250ml + Tutup Segel",
    type: "PACKAGING",
    unit: "pcs",
    stockQty: 480,
    unitCost: 2006,
    totalValue: 963022,
    dailyBurnRate: 100.4,
    daysLeft: 3,
    leadTimeDays: 5,
    critical: true,
    recommendedOrderQty: 3000,
  },
];

export const INITIAL_STORE_PERFORMANCE: StorePerformanceMetrics[] = [
  {
    storeId: "store-tiktok-1",
    storeName: "Topherbal Official",
    platform: "TikTok",
    periodLabel: "18 Nov – 24 Nov 2026",
    orderCount: 122,
    omzetOrder: 9567629,
    cancelledCount: 5,
    adSpend: 742340,
    roas: 12.89,
    acosPercent: 7.8,
    unbilledAdDebt: 1508975,
    settledSales: 4685551,
    aov: 70993,
    netPerOrder: 62379,
    netPercent: 87.9,
    aop: 1.45,
    feePercent: 12.1,
    hppTotal: 761011,
    contributionMargin: 2368746,
  },
  {
    storeId: "store-shopee-1",
    storeName: "topherbal.id",
    platform: "Shopee",
    periodLabel: "18 Nov – 24 Nov 2026",
    orderCount: 94,
    omzetOrder: 7468306,
    cancelledCount: 6,
    adSpend: 427611,
    roas: 17.47,
    acosPercent: 5.7,
    unbilledAdDebt: 0,
    settledSales: 3362601,
    aov: 74724,
    netPerOrder: 65214,
    netPercent: 87.3,
    aop: 1.51,
    feePercent: 12.7,
    hppTotal: 533695,
    contributionMargin: 1973340,
  },
];
