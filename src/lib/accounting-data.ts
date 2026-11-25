import Decimal from "decimal.js";

// Configure Decimal for strict financial rounding
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export type SourceChannel = "TikTok" | "Shopee" | "Tokopedia" | "POS / Custom" | "Operasional";

export interface Company {
  id: string;
  name: string;
  shortCode: string;
  taxIdNpwp: string;
  industry: string;
  defaultTaxRatePercent: number;
}

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
  runningMutation: number;
  closingBalance: number;
  storeTag?: string;
  sourceChannel?: SourceChannel;
}

export interface Store {
  id: string;
  companyId: string;
  name: string;
  platform: "TikTok" | "Shopee" | "Tokopedia" | "POS / Custom";
  handle: string;
  fingerprintKeywords: string[];
  walletAccountCode: string;
}

export interface JournalLine {
  id: string;
  accountCode: string;
  accountName: string;
  storeTag?: string;
  sourceChannel?: SourceChannel;
  debit: number;
  credit: number;
  memo?: string;
}

export type JournalSourceType = "Marketplace" | "Stok" | "Iklan" | "AI (Gemini Pro)";
export type JournalStatus = "MENUNGGU" | "BERMASALAH" | "DISETUJUI" | "DITOLAK";

export interface JournalEntry {
  id: string;
  companyId?: string;
  title: string;
  entryDate: string; // YYYY-MM-DD
  sourceType: JournalSourceType;
  sourceChannel?: SourceChannel;
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

export interface ParsedExcelRow {
  orderId: string;
  settlementDate: string;
  sku: string;
  qty: number;
  grossSales: number;
  returnAmount: number;
  marketplaceFee: number;
  pph22Withheld: number;
  adDeduction: number;
  netSettlement: number;
  hppPerUnit: number;
  totalHpp: number;
}

export interface ImportBatch {
  id: string;
  companyId?: string;
  fileName: string;
  fileSizeKB: number;
  storeId: string;
  storeName: string;
  platform: "TikTok" | "Shopee" | "Tokopedia" | "POS / Custom";
  reportType:
    | "Semua pesanan"
    | "Income (sudah dilepas)"
    | "Order.all"
    | "Income"
    | "Custom Sales Excel";
  periodStart: string;
  periodEnd: string;
  status: "RECOGNIZED" | "UNKNOWN_STORE" | "CONFLICT";
  orderCount: number;
  settlementCount: number;
  mutationCount: number;
  netDisbursed: number;
  grossSalesTotal?: number;
  feeTotal?: number;
  pph22Total?: number;
  hppTotal?: number;
  parsedRows?: ParsedExcelRow[];
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
  platform: "TikTok" | "Shopee" | "Tokopedia" | "POS / Custom";
  periodLabel: string;
  orderCount: number;
  omzetOrder: number;
  cancelledCount: number;
  adSpend: number;
  roas: number;
  acosPercent: number;
  unbilledAdDebt: number;
  settledSales: number;
  aov: number;
  netPerOrder: number;
  netPercent: number;
  aop: number;
  feePercent: number;
  hppTotal: number;
  contributionMargin: number;
}

export interface SourceChannelBreakdown {
  channel: SourceChannel;
  orderCount: number;
  grossSales: number;
  returns: number;
  netSales: number;
  hpp: number;
  grossProfit: number;
  marketplaceFee: number;
  adExpense: number;
  operatingExpense: number;
  pph22TaxCredit: number;
  netProfit: number;
  walletBalance: number;
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

// Multi-Company Seed Data (1 User Login can manage multiple companies)
export const INITIAL_COMPANIES: Company[] = [
  {
    id: "comp-topherbal",
    name: "PT Topherbal Nusantara",
    shortCode: "TH",
    taxIdNpwp: "01.884.291.4-012.000",
    industry: "Herbal & Kesehatan (TikTok & Shopee)",
    defaultTaxRatePercent: 0.5,
  },
  {
    id: "comp-kopi",
    name: "CV Kopi Roastery Mandiri",
    shortCode: "KR",
    taxIdNpwp: "02.419.552.1-044.000",
    industry: "F&B & Roastery (Shopee, Tokopedia & POS)",
    defaultTaxRatePercent: 0.5,
  },
  {
    id: "comp-fashion",
    name: "PT Maju Apparel Retail",
    shortCode: "MA",
    taxIdNpwp: "03.911.008.7-061.000",
    industry: "Fashion & Apparel (TikTok Shop & Shopee Mall)",
    defaultTaxRatePercent: 11.0,
  },
];

// Scale factor for companies so switching company shows realistic distinct ledgers
export const COMPANY_SCALE_FACTORS: Record<string, number> = {
  "comp-topherbal": 1.0,
  "comp-kopi": 0.62,
  "comp-fashion": 1.45,
};

export const INITIAL_STORES: Store[] = [
  {
    id: "store-tiktok-1",
    companyId: "comp-topherbal",
    name: "Topherbal Official",
    platform: "TikTok",
    handle: "TopherbalOfficial",
    fingerprintKeywords: ["TopherbalOfficial", "TikTok", "All_order_Topherbal"],
    walletAccountCode: "1106",
  },
  {
    id: "store-shopee-1",
    companyId: "comp-topherbal",
    name: "topherbal.id",
    platform: "Shopee",
    handle: "topherbal.id",
    fingerprintKeywords: ["topherbal.id", "Shopee", "Income.sudah_dilepas"],
    walletAccountCode: "1109",
  },
  {
    id: "store-tokopedia-1",
    companyId: "comp-topherbal",
    name: "Topherbal Tokopedia Mall",
    platform: "Tokopedia",
    handle: "topherbal-tokopedia",
    fingerprintKeywords: ["tokopedia", "topherbal-tokopedia"],
    walletAccountCode: "1110",
  },
  {
    id: "store-pos-1",
    companyId: "comp-topherbal",
    name: "Penjualan Grosir / Custom Excel",
    platform: "POS / Custom",
    handle: "grosir-offline",
    fingerprintKeywords: ["custom", "pos", "grosir"],
    walletAccountCode: "1102",
  },
];

export const INITIAL_ACCOUNTS: Account[] = [
  {
    code: "1102",
    name: "BCA PT",
    category: "ASSET_CASH",
    normalBalance: "DEBIT",
    openingBalance: 199014118,
    runningMutation: 57329982,
    closingBalance: 256344100,
    sourceChannel: "Operasional",
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
    sourceChannel: "TikTok",
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
    sourceChannel: "Shopee",
  },
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
    sourceChannel: "Shopee",
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
  {
    code: "1301",
    name: "Peralatan",
    category: "ASSET_FIXED",
    normalBalance: "DEBIT",
    openingBalance: 20050000,
    runningMutation: 0,
    closingBalance: 20050000,
  },
  {
    code: "2112",
    name: "Utang Iklan TikTok (GMV Pay)",
    category: "LIABILITY_SHORT",
    normalBalance: "CREDIT",
    openingBalance: 2375454,
    runningMutation: 401136,
    closingBalance: 2776590,
    sourceChannel: "TikTok",
  },
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
    sourceChannel: "Operasional",
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
    sourceChannel: "Operasional",
  },
  {
    code: "5803",
    name: "Pendapatan Lain: Kompensasi Marketplace",
    category: "OTHER_INCOME",
    normalBalance: "CREDIT",
    openingBalance: 120000,
    runningMutation: 18032,
    closingBalance: 138032,
    sourceChannel: "Shopee",
  },
];

// Initial Source Channel Breakdown (TikTok, Shopee, Tokopedia, POS/Custom, Operasional)
// Totals match the Overall Laba Rugi (Net Sales: Rp92.777.590, HPP: Rp15.013.838, Laba Kotor: Rp77.763.752, Beban: Rp27.937.074, Laba Bersih: Rp49.826.678)
export const INITIAL_SOURCE_BREAKDOWN: SourceChannelBreakdown[] = [
  {
    channel: "TikTok",
    orderCount: 742,
    grossSales: 52450000,
    returns: 1380000,
    netSales: 51070000,
    hpp: 8250000,
    grossProfit: 42820000,
    marketplaceFee: 6180000,
    adExpense: 2280000,
    operatingExpense: 0,
    pph22TaxCredit: 512000,
    netProfit: 34360000,
    walletBalance: 2616561,
  },
  {
    channel: "Shopee",
    orderCount: 518,
    grossSales: 35820000,
    returns: 842410,
    netSales: 34995622, // includes 18.032 kompensasi
    hpp: 5683838,
    grossProfit: 29311784,
    marketplaceFee: 4614824,
    adExpense: 1232250,
    operatingExpense: 0,
    pph22TaxCredit: 345185,
    netProfit: 23464710,
    walletBalance: 1819562,
  },
  {
    channel: "Tokopedia",
    orderCount: 68,
    grossSales: 4650000,
    returns: 120000,
    netSales: 4530000,
    hpp: 730000,
    grossProfit: 3800000,
    marketplaceFee: 580000,
    adExpense: 0,
    operatingExpense: 0,
    pph22TaxCredit: 55000,
    netProfit: 3220000,
    walletBalance: 0,
  },
  {
    channel: "POS / Custom",
    orderCount: 24,
    grossSales: 2200000,
    returns: 0,
    netSales: 2181968,
    hpp: 350000,
    grossProfit: 1831968,
    marketplaceFee: 0,
    adExpense: 0,
    operatingExpense: 0,
    pph22TaxCredit: 0,
    netProfit: 1831968,
    walletBalance: 0,
  },
  {
    channel: "Operasional",
    orderCount: 0,
    grossSales: 0,
    returns: 0,
    netSales: 0,
    hpp: 0,
    grossProfit: 0,
    marketplaceFee: 0,
    adExpense: 5450000, // Meta Ads
    operatingExpense: 7600000, // Gaji Karyawan
    pph22TaxCredit: 0,
    netProfit: -13050000,
    walletBalance: 256344100, // BCA PT
  },
];

export const INITIAL_JOURNAL_DRAFTS: JournalEntry[] = [
  {
    id: "draft-1",
    companyId: "comp-topherbal",
    title: "Settlement TikTok Topherbal Official 2026-11-24: 18 order",
    entryDate: "2026-11-24",
    sourceType: "Marketplace",
    sourceChannel: "TikTok",
    platformTag: "TikTok",
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
        sourceChannel: "TikTok",
        debit: 0,
        credit: 233448,
      },
      {
        id: "l-102",
        accountCode: "5101",
        accountName: "HPP Barang Jadi",
        storeTag: "Topherbal Official",
        sourceChannel: "TikTok",
        debit: 233448,
        credit: 0,
      },
      {
        id: "l-103",
        accountCode: "1106",
        accountName: "Saldo Penjual - TikTok Topherbal Official",
        storeTag: "Topherbal Official",
        sourceChannel: "TikTok",
        debit: 1243273,
        credit: 0,
      },
      {
        id: "l-104",
        accountCode: "1218",
        accountName: "PPh 22 Dibayar Dimuka",
        storeTag: "Topherbal Official",
        sourceChannel: "TikTok",
        debit: 7108,
        credit: 0,
      },
      {
        id: "l-105",
        accountCode: "4112",
        accountName: "Penjualan Marketplace",
        storeTag: "Topherbal Official",
        sourceChannel: "TikTok",
        debit: 0,
        credit: 1421578,
      },
      {
        id: "l-106",
        accountCode: "5203",
        accountName: "Beban Fee & Promo Marketplace",
        storeTag: "Topherbal Official",
        sourceChannel: "TikTok",
        debit: 171197,
        credit: 0,
      },
    ],
  },
  {
    id: "draft-2",
    companyId: "comp-topherbal",
    title: "Settlement Shopee topherbal.id 2026-11-22: 17 order, 1 penyesuaian",
    entryDate: "2026-11-22",
    sourceType: "Marketplace",
    sourceChannel: "Shopee",
    platformTag: "Shopee",
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
        sourceChannel: "Shopee",
        debit: 0,
        credit: 209361,
      },
      {
        id: "l-202",
        accountCode: "1209",
        accountName: "Saldo Iklan Dibayar Dimuka",
        storeTag: "topherbal.id",
        sourceChannel: "Shopee",
        debit: 0,
        credit: 8791,
      },
      {
        id: "l-203",
        accountCode: "5101",
        accountName: "HPP Barang Jadi",
        storeTag: "topherbal.id",
        sourceChannel: "Shopee",
        debit: 209361,
        credit: 0,
      },
      {
        id: "l-204",
        accountCode: "1109",
        accountName: "Saldo Penjual - Shopee topherbal.id",
        storeTag: "topherbal.id",
        sourceChannel: "Shopee",
        debit: 1120229,
        credit: 0,
      },
      {
        id: "l-205",
        accountCode: "1218",
        accountName: "PPh 22 Dibayar Dimuka",
        storeTag: "topherbal.id",
        sourceChannel: "Shopee",
        debit: 6437,
        credit: 0,
      },
      {
        id: "l-206",
        accountCode: "4112",
        accountName: "Penjualan Marketplace",
        storeTag: "topherbal.id",
        sourceChannel: "Shopee",
        debit: 0,
        credit: 1286613,
      },
      {
        id: "l-207",
        accountCode: "5803",
        accountName: "Pendapatan Lain: Kompensasi Marketplace",
        storeTag: "topherbal.id",
        sourceChannel: "Shopee",
        debit: 0,
        credit: 18032,
      },
      {
        id: "l-208",
        accountCode: "5203",
        accountName: "Beban Fee & Promo Marketplace",
        storeTag: "topherbal.id",
        sourceChannel: "Shopee",
        debit: 169188,
        credit: 0,
      },
    ],
  },
  {
    id: "draft-3",
    companyId: "comp-topherbal",
    title: "Settlement TikTok Topherbal Official 2026-11-22: 22 order",
    entryDate: "2026-11-22",
    sourceType: "Marketplace",
    sourceChannel: "TikTok",
    platformTag: "TikTok",
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
        sourceChannel: "TikTok",
        debit: 0,
        credit: 315684,
      },
      {
        id: "l-302",
        accountCode: "4201",
        accountName: "Retur Penjualan",
        storeTag: "Topherbal Official",
        sourceChannel: "TikTok",
        debit: 146020,
        credit: 0,
      },
      {
        id: "l-303",
        accountCode: "5101",
        accountName: "HPP Barang Jadi",
        storeTag: "Topherbal Official",
        sourceChannel: "TikTok",
        debit: 315684,
        credit: 0,
      },
      {
        id: "l-304",
        accountCode: "1106",
        accountName: "Saldo Penjual - TikTok Topherbal Official",
        storeTag: "Topherbal Official",
        sourceChannel: "TikTok",
        debit: 1608053,
        credit: 0,
      },
      {
        id: "l-305",
        accountCode: "1218",
        accountName: "PPh 22 Dibayar Dimuka",
        storeTag: "Topherbal Official",
        sourceChannel: "TikTok",
        debit: 9865,
        credit: 0,
      },
      {
        id: "l-306",
        accountCode: "4112",
        accountName: "Penjualan Marketplace",
        storeTag: "Topherbal Official",
        sourceChannel: "TikTok",
        debit: 0,
        credit: 1972943,
      },
      {
        id: "l-307",
        accountCode: "5203",
        accountName: "Beban Fee & Promo Marketplace",
        storeTag: "Topherbal Official",
        sourceChannel: "TikTok",
        debit: 209005,
        credit: 0,
      },
    ],
  },
  {
    id: "draft-4",
    companyId: "comp-topherbal",
    title: "Iklan TikTok GMV Max Topherbal Official 01/11/2026–23/11/2026: total 3.287.625 (termasuk PPN 11%), sudah dibukukan 2.915.957, selisih 371.668",
    entryDate: "2026-11-23",
    sourceType: "Iklan",
    sourceChannel: "TikTok",
    platformTag: "TikTok",
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
        sourceChannel: "TikTok",
        debit: 371668,
        credit: 0,
      },
      {
        id: "l-402",
        accountCode: "2112",
        accountName: "Utang Iklan TikTok (GMV Pay)",
        storeTag: "Topherbal Official",
        sourceChannel: "TikTok",
        debit: 0,
        credit: 371668,
      },
    ],
  },
  {
    id: "draft-5",
    companyId: "comp-topherbal",
    title: "Selisih Settlement Shopee jamuku.official 2026-11-17: 5 order",
    entryDate: "2026-11-17",
    sourceType: "Marketplace",
    sourceChannel: "Shopee",
    platformTag: "Shopee",
    storeId: "store-shopee-1",
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
        sourceChannel: "Shopee",
        debit: 0,
        credit: 1,
      },
      {
        id: "l-502",
        accountCode: "5101",
        accountName: "HPP Barang Jadi",
        storeTag: "jamuku.official",
        sourceChannel: "Shopee",
        debit: 1,
        credit: 0,
      },
    ],
  },
  {
    id: "draft-6",
    companyId: "comp-topherbal",
    title: "Pembelian UD Kemasan Jaya nota INV-20261123-901: 2 item, total 3.427.500 (ongkir 60.000)",
    entryDate: "2026-11-23",
    sourceType: "Stok",
    sourceChannel: "Operasional",
    platformTag: "AI (Gemini Pro)",
    status: "MENUNGGU",
    totalAmount: 3427500,
    createdAt: "2026-11-24T15:35:00Z",
    lines: [
      {
        id: "l-601",
        accountCode: "1214",
        accountName: "Persediaan Kemasan",
        sourceChannel: "Operasional",
        debit: 3427500,
        credit: 0,
      },
      {
        id: "l-602",
        accountCode: "1102",
        accountName: "BCA PT",
        sourceChannel: "Operasional",
        debit: 0,
        credit: 3427500,
      },
    ],
  },
  {
    id: "draft-7",
    companyId: "comp-topherbal",
    title: "Gaji 2 staff gudang",
    entryDate: "2026-11-23",
    sourceType: "AI (Gemini Pro)",
    sourceChannel: "Operasional",
    platformTag: "AI (Gemini Pro)",
    status: "MENUNGGU",
    totalAmount: 7600000,
    createdAt: "2026-11-24T15:36:00Z",
    lines: [
      {
        id: "l-701",
        accountCode: "5401",
        accountName: "By Gaji Karyawan",
        sourceChannel: "Operasional",
        debit: 7600000,
        credit: 0,
      },
      {
        id: "l-702",
        accountCode: "1102",
        accountName: "BCA PT",
        sourceChannel: "Operasional",
        debit: 0,
        credit: 7600000,
      },
    ],
  },
  {
    id: "draft-8",
    companyId: "comp-topherbal",
    title: "Meta Ads November pekan 4",
    entryDate: "2026-11-23",
    sourceType: "AI (Gemini Pro)",
    sourceChannel: "Operasional",
    platformTag: "AI (Gemini Pro)",
    status: "MENUNGGU",
    totalAmount: 1500000,
    createdAt: "2026-11-24T15:37:00Z",
    lines: [
      {
        id: "l-801",
        accountCode: "5301",
        accountName: "By Pemasaran META ADS",
        sourceChannel: "Operasional",
        debit: 1500000,
        credit: 0,
      },
      {
        id: "l-802",
        accountCode: "1102",
        accountName: "BCA PT",
        sourceChannel: "Operasional",
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
    grossSalesTotal: 1421578,
    feeTotal: 171197,
    pph22Total: 7108,
    hppTotal: 233448,
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
    grossSalesTotal: 1286613,
    feeTotal: 169188,
    pph22Total: 6437,
    hppTotal: 209361,
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
