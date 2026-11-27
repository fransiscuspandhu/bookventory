"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import Decimal from "decimal.js";
import {
  Company,
  Account,
  Store,
  JournalEntry,
  ImportBatch,
  InventoryItem,
  StorePerformanceMetrics,
  SourceChannel,
  SourceChannelBreakdown,
  INITIAL_COMPANIES,
  COMPANY_SCALE_FACTORS,
  INITIAL_ACCOUNTS,
  INITIAL_STORES,
  INITIAL_JOURNAL_DRAFTS,
  INITIAL_IMPORT_BATCHES,
  INITIAL_INVENTORY,
  INITIAL_STORE_PERFORMANCE,
  INITIAL_SOURCE_BREAKDOWN,
  validateDoubleEntry,
  JournalLine,
} from "./accounting-data";
import { RealParsedFileResult } from "./excel-parser";

interface AccountingSummary {
  totalAssets: number;
  totalEquity: number;
  totalLiabilities: number;
  marketplaceFunds: number;
  cashAndBank: number;
  netSales: number;
  grossProfit: number;
  totalHpp: number;
  totalOperatingExpense: number;
  netIncome: number;
  pph22Prepaid: number;
  isBalanced: boolean;
  pendingCount: number;
  approvedTodayCount: number;
  problemCount: number;
}

interface AccountingContextType {
  // Multi-Company state (1 Login = Multiple Companies)
  companies: Company[];
  activeCompany: Company;
  switchCompany: (companyId: string) => void;
  addCompany: (params: {
    name: string;
    taxIdNpwp: string;
    industry: string;
  }) => Company;
  // Source Channel Filter ("ALL" or specific channel)
  selectedSourceFilter: "ALL" | SourceChannel;
  setSelectedSourceFilter: (ch: "ALL" | SourceChannel) => void;
  sourceBreakdown: SourceChannelBreakdown[];
  // Core Ledger State
  accounts: Account[];
  stores: Store[];
  journals: JournalEntry[];
  importBatches: ImportBatch[];
  inventory: InventoryItem[];
  storePerformance: StorePerformanceMetrics[];
  summary: AccountingSummary;
  approveJournal: (id: string) => { success: boolean; message: string };
  rejectJournal: (id: string) => void;
  addDraftJournal: (
    draft: Omit<JournalEntry, "id" | "createdAt" | "status">
  ) => JournalEntry;
  addParsedImportBatches: (parsedFiles: RealParsedFileResult[]) => void;
  generateDraftsFromImports: (storeFilter: string) => {
    createdCount: number;
    discrepancyDraftCount: number;
    skippedCount: number;
    generatedTableRows: {
      tanggal: string;
      jenis: string;
      jml: number;
      totalDebit: number;
      storeName: string;
    }[];
  };
  recordStockPurchase: (params: {
    date: string;
    invoiceNo: string;
    supplier: string;
    itemSku: string;
    qty: number;
    itemPrice: number;
    shippingCost: number;
  }) => JournalEntry;
}

const AccountingContext = createContext<AccountingContextType | undefined>(
  undefined
);

export function AccountingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [activeCompanyId, setActiveCompanyId] = useState<string>(
    INITIAL_COMPANIES[0].id
  );
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<
    "ALL" | SourceChannel
  >("ALL");

  const [baseAccounts, setBaseAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [stores] = useState<Store[]>(INITIAL_STORES);
  const [journals, setJournals] = useState<JournalEntry[]>(
    INITIAL_JOURNAL_DRAFTS
  );
  const [importBatches, setImportBatches] = useState<ImportBatch[]>(
    INITIAL_IMPORT_BATCHES
  );
  const [inventory, setInventory] =
    useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [storePerformance] = useState<StorePerformanceMetrics[]>(
    INITIAL_STORE_PERFORMANCE
  );
  const [baseSourceBreakdown, setBaseSourceBreakdown] = useState<
    SourceChannelBreakdown[]
  >(INITIAL_SOURCE_BREAKDOWN);
  const [approvedTodayCount, setApprovedTodayCount] = useState<number>(2);

  const activeCompany =
    companies.find((c) => c.id === activeCompanyId) || companies[0];
  const companyScale = COMPANY_SCALE_FACTORS[activeCompany.id] || 0.85;

  const switchCompany = (companyId: string) => {
    setActiveCompanyId(companyId);
  };

  const addCompany = (params: {
    name: string;
    taxIdNpwp: string;
    industry: string;
  }): Company => {
    const words = params.name
      .replace(/^(PT|CV|UD)\s+/i, "")
      .trim()
      .split(/\s+/);
    const shortCode =
      words.length >= 2
        ? (words[0][0] + words[1][0]).toUpperCase()
        : params.name.slice(0, 2).toUpperCase();

    const newComp: Company = {
      id: `comp-${Date.now()}`,
      name: params.name,
      shortCode,
      taxIdNpwp: params.taxIdNpwp || "01.000.000.0-000.000",
      industry: params.industry || "Multi-Channel E-Commerce",
      defaultTaxRatePercent: 0.5,
    };

    COMPANY_SCALE_FACTORS[newComp.id] = 0.45;
    setCompanies((prev) => [...prev, newComp]);
    setActiveCompanyId(newComp.id);
    return newComp;
  };

  // Scale accounts dynamically based on active company so each company in the account has its own numbers
  const accounts = useMemo<Account[]>(() => {
    if (companyScale === 1.0) return baseAccounts;
    return baseAccounts.map((a) => {
      const open = Math.round(a.openingBalance * companyScale);
      const run = Math.round(a.runningMutation * companyScale);
      return {
        ...a,
        openingBalance: open,
        runningMutation: run,
        closingBalance: open + run,
      };
    });
  }, [baseAccounts, companyScale]);

  const sourceBreakdown = useMemo<SourceChannelBreakdown[]>(() => {
    if (companyScale === 1.0) return baseSourceBreakdown;
    return baseSourceBreakdown.map((b) => ({
      ...b,
      orderCount: Math.round(b.orderCount * companyScale),
      grossSales: Math.round(b.grossSales * companyScale),
      returns: Math.round(b.returns * companyScale),
      netSales: Math.round(b.netSales * companyScale),
      hpp: Math.round(b.hpp * companyScale),
      grossProfit: Math.round(b.grossProfit * companyScale),
      marketplaceFee: Math.round(b.marketplaceFee * companyScale),
      adExpense: Math.round(b.adExpense * companyScale),
      operatingExpense: Math.round(b.operatingExpense * companyScale),
      pph22TaxCredit: Math.round(b.pph22TaxCredit * companyScale),
      netProfit: Math.round(b.netProfit * companyScale),
      walletBalance: Math.round(b.walletBalance * companyScale),
    }));
  }, [baseSourceBreakdown, companyScale]);

  const approveJournal = (id: string): { success: boolean; message: string } => {
    const target = journals.find((j) => j.id === id);
    if (!target) return { success: false, message: "Draft tidak ditemukan" };
    if (target.status === "DISETUJUI") {
      return { success: false, message: "Jurnal sudah disetujui sebelumnya" };
    }

    const validation = validateDoubleEntry(target.lines);
    if (!validation.isValid) {
      setJournals((prev) =>
        prev.map((j) =>
          j.id === id
            ? {
                ...j,
                status: "BERMASALAH",
                errorReason: `Tidak seimbang! Selisih Rp ${validation.difference}`,
              }
            : j
        )
      );
      return {
        success: false,
        message: `Debit (${validation.totalDebit}) != Kredit (${validation.totalCredit})`,
      };
    }

    const ch: SourceChannel = target.sourceChannel || "Operasional";

    setBaseAccounts((prevAccounts) => {
      let netProfitDelta = new Decimal(0);

      const updated = prevAccounts.map((acc) => {
        const matchingLines = target.lines.filter(
          (l) => l.accountCode === acc.code
        );
        if (matchingLines.length === 0) return acc;

        let delta = new Decimal(0);
        for (const line of matchingLines) {
          if (acc.normalBalance === "DEBIT") {
            delta = delta.plus(line.debit).minus(line.credit);
          } else {
            delta = delta.plus(line.credit).minus(line.debit);
          }

          if (acc.category === "REVENUE" || acc.category === "OTHER_INCOME") {
            netProfitDelta = netProfitDelta.plus(line.credit).minus(line.debit);
          } else if (
            acc.category === "CONTRA_REVENUE" ||
            acc.category === "COGS" ||
            acc.category === "EXPENSE"
          ) {
            netProfitDelta = netProfitDelta.minus(line.debit).plus(line.credit);
          }
        }

        const newRunning = new Decimal(acc.runningMutation)
          .plus(delta)
          .toNumber();
        const newClosing = new Decimal(acc.openingBalance)
          .plus(newRunning)
          .toNumber();

        return {
          ...acc,
          runningMutation: newRunning,
          closingBalance: newClosing,
        };
      });

      if (!netProfitDelta.equals(0)) {
        return updated.map((acc) => {
          if (acc.code !== "3104") return acc;
          const newRunning = new Decimal(acc.runningMutation)
            .plus(netProfitDelta)
            .toNumber();
          const newClosing = new Decimal(acc.openingBalance)
            .plus(newRunning)
            .toNumber();
          return {
            ...acc,
            runningMutation: newRunning,
            closingBalance: newClosing,
          };
        });
      }

      return updated;
    });

    // Also update Source Channel Breakdown so category reports stay 100% in sync
    setBaseSourceBreakdown((prev) =>
      prev.map((b) => {
        if (b.channel !== ch) return b;
        let grossDelta = 0;
        let retDelta = 0;
        let hppDelta = 0;
        let feeDelta = 0;
        let adDelta = 0;
        let opDelta = 0;
        let pph22Delta = 0;

        for (const line of target.lines) {
          if (line.accountCode === "4112" || line.accountCode === "5803") {
            grossDelta += line.credit - line.debit;
          } else if (line.accountCode === "4201") {
            retDelta += line.debit - line.credit;
          } else if (line.accountCode === "5101") {
            hppDelta += line.debit - line.credit;
          } else if (line.accountCode === "5203") {
            feeDelta += line.debit - line.credit;
          } else if (line.accountCode === "5301" || line.accountCode === "5308") {
            adDelta += line.debit - line.credit;
          } else if (line.accountCode === "5401") {
            opDelta += line.debit - line.credit;
          } else if (line.accountCode === "1218") {
            pph22Delta += line.debit - line.credit;
          }
        }

        const newGross = b.grossSales + grossDelta;
        const newRet = b.returns + retDelta;
        const newNetSales = b.netSales + grossDelta - retDelta;
        const newHpp = b.hpp + hppDelta;
        const newGrossProfit = newNetSales - newHpp;
        const newFee = b.marketplaceFee + feeDelta;
        const newAd = b.adExpense + adDelta;
        const newOp = b.operatingExpense + opDelta;
        const newNetProfit = newGrossProfit - newFee - newAd - newOp;

        return {
          ...b,
          orderCount: b.orderCount + (target.orderCount || 0),
          grossSales: newGross,
          returns: newRet,
          netSales: newNetSales,
          hpp: newHpp,
          grossProfit: newGrossProfit,
          marketplaceFee: newFee,
          adExpense: newAd,
          operatingExpense: newOp,
          pph22TaxCredit: b.pph22TaxCredit + pph22Delta,
          netProfit: newNetProfit,
        };
      })
    );

    setJournals((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, status: "DISETUJUI", approvedAt: new Date().toISOString() }
          : j
      )
    );
    setApprovedTodayCount((c) => c + 1);

    return {
      success: true,
      message: `Jurnal "${target.title}" (${ch}) berhasil dibukukan ke Neraca & Laporan Sumber Data.`,
    };
  };

  const rejectJournal = (id: string) => {
    setJournals((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: "DITOLAK" } : j))
    );
  };

  const addDraftJournal = (
    draft: Omit<JournalEntry, "id" | "createdAt" | "status">
  ): JournalEntry => {
    const validation = validateDoubleEntry(draft.lines);
    const newEntry: JournalEntry = {
      ...draft,
      companyId: activeCompany.id,
      id: `draft-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      status: validation.isValid ? "MENUNGGU" : "BERMASALAH",
      errorReason: validation.isValid
        ? undefined
        : `Debit != Kredit (Selisih ${validation.difference})`,
    };
    setJournals((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  const addParsedImportBatches = (parsedFiles: RealParsedFileResult[]) => {
    const newBatches: ImportBatch[] = parsedFiles.map((pf, idx) => ({
      id: `imp-${Date.now()}-${idx}`,
      companyId: activeCompany.id,
      fileName: pf.fileName,
      fileSizeKB: pf.sizeKB,
      storeId: pf.storeId,
      storeName: pf.storeName,
      platform: pf.platform,
      reportType: pf.reportType,
      periodStart: pf.periodStart,
      periodEnd: pf.periodEnd,
      status: pf.status,
      orderCount: pf.orderCount,
      settlementCount: pf.settlementCount,
      mutationCount: pf.mutationCount,
      netDisbursed: pf.netDisbursed,
      grossSalesTotal: pf.grossSalesTotal,
      feeTotal: pf.feeTotal,
      pph22Total: pf.pph22Total,
      hppTotal: pf.hppTotal,
      parsedRows: pf.rows,
      saved: true,
      draftGenerated: false,
    }));

    setImportBatches((prev) => [...newBatches, ...prev]);
  };

  const generateDraftsFromImports = (storeFilter: string) => {
    const targetBatches = importBatches.filter(
      (b) => storeFilter === "ALL" || b.storeId === storeFilter
    );

    let createdCount = 0;
    let discrepancyDraftCount = 0;
    let skippedCount = 0;
    const generatedTableRows: {
      tanggal: string;
      jenis: string;
      jml: number;
      totalDebit: number;
      storeName: string;
    }[] = [];

    for (const batch of targetBatches) {
      if (batch.draftGenerated) {
        skippedCount++;
      }

      const walletCode =
        batch.platform === "TikTok"
          ? "1106"
          : batch.platform === "Shopee"
          ? "1109"
          : "1102";
      const walletName =
        batch.platform === "TikTok"
          ? "Saldo Penjual - TikTok Topherbal Official"
          : batch.platform === "Shopee"
          ? "Saldo Penjual - Shopee topherbal.id"
          : "BCA PT";
      const ch: SourceChannel = batch.platform;

      // Group rows by settlementDate (Satu draft per toko per tanggal cair!)
      const rows =
        batch.parsedRows && batch.parsedRows.length > 0
          ? batch.parsedRows
          : [
              {
                orderId: `ORD-${batch.id}-1`,
                settlementDate: "2026-11-23",
                sku: "JHM",
                qty: 5,
                grossSales: Math.round((batch.grossSalesTotal || 1421578) * 0.35),
                returnAmount: 0,
                marketplaceFee: Math.round((batch.feeTotal || 171197) * 0.35),
                pph22Withheld: Math.round((batch.pph22Total || 7108) * 0.35),
                adDeduction: 0,
                netSettlement:
                  Math.round((batch.grossSalesTotal || 1421578) * 0.35) -
                  Math.round((batch.feeTotal || 171197) * 0.35) -
                  Math.round((batch.pph22Total || 7108) * 0.35),
                hppPerUnit: 12969,
                totalHpp: Math.round((batch.hppTotal || 233448) * 0.35),
              },
              {
                orderId: `ORD-${batch.id}-2`,
                settlementDate: "2026-11-24",
                sku: "KNY",
                qty: 11,
                grossSales:
                  (batch.grossSalesTotal || 1421578) -
                  Math.round((batch.grossSalesTotal || 1421578) * 0.35),
                returnAmount: 0,
                marketplaceFee:
                  (batch.feeTotal || 171197) -
                  Math.round((batch.feeTotal || 171197) * 0.35),
                pph22Withheld:
                  (batch.pph22Total || 7108) -
                  Math.round((batch.pph22Total || 7108) * 0.35),
                adDeduction: 0,
                netSettlement:
                  (batch.grossSalesTotal || 1421578) -
                  Math.round((batch.grossSalesTotal || 1421578) * 0.35) -
                  ((batch.feeTotal || 171197) -
                    Math.round((batch.feeTotal || 171197) * 0.35)) -
                  ((batch.pph22Total || 7108) -
                    Math.round((batch.pph22Total || 7108) * 0.35)) -
                  1, // Intentional Rp 1 discrepancy to demonstrate automatic Selisih draft
                hppPerUnit: 11850,
                totalHpp:
                  (batch.hppTotal || 233448) -
                  Math.round((batch.hppTotal || 233448) * 0.35),
              },
            ];

      const byDate = new Map<string, typeof rows>();
      for (const r of rows) {
        const d = r.settlementDate || "2026-11-24";
        const arr = byDate.get(d) || [];
        arr.push(r);
        byDate.set(d, arr);
      }

      for (const [dateStr, dateRows] of byDate.entries()) {
        const grossSales = dateRows.reduce((a, b) => a + b.grossSales, 0);
        const returnAmt = dateRows.reduce((a, b) => a + b.returnAmount, 0);
        const feeAmt = dateRows.reduce((a, b) => a + b.marketplaceFee, 0);
        const pph22Amt = dateRows.reduce((a, b) => a + b.pph22Withheld, 0);
        const hppAmt = dateRows.reduce((a, b) => a + b.totalHpp, 0);
        const actualNet = dateRows.reduce((a, b) => a + b.netSettlement, 0);
        const expectedNet = grossSales - returnAmt - feeAmt - pph22Amt;
        const diffRp = Math.abs(expectedNet - actualNet);

        // Balance the main settlement journal cleanly
        const balancedWalletDebit = expectedNet;
        const totalDebit = grossSales + hppAmt;

        generatedTableRows.push({
          tanggal: dateStr,
          jenis: "Settlement",
          jml: dateRows.length,
          totalDebit,
          storeName: batch.storeName,
        });

        if (!batch.draftGenerated) {
          const lines: JournalLine[] = [
            {
              id: `l-${Date.now()}-${dateStr}-1`,
              accountCode: "1206",
              accountName: "Persediaan Barang Jadi",
              storeTag: batch.storeName,
              sourceChannel: ch,
              debit: 0,
              credit: hppAmt,
            },
            {
              id: `l-${Date.now()}-${dateStr}-2`,
              accountCode: "5101",
              accountName: "HPP Barang Jadi",
              storeTag: batch.storeName,
              sourceChannel: ch,
              debit: hppAmt,
              credit: 0,
            },
            {
              id: `l-${Date.now()}-${dateStr}-3`,
              accountCode: walletCode,
              accountName: walletName,
              storeTag: batch.storeName,
              sourceChannel: ch,
              debit: balancedWalletDebit,
              credit: 0,
            },
            {
              id: `l-${Date.now()}-${dateStr}-4`,
              accountCode: "1218",
              accountName: "PPh 22 Dibayar Dimuka",
              storeTag: batch.storeName,
              sourceChannel: ch,
              debit: pph22Amt,
              credit: 0,
            },
            {
              id: `l-${Date.now()}-${dateStr}-5`,
              accountCode: "4112",
              accountName: "Penjualan Marketplace",
              storeTag: batch.storeName,
              sourceChannel: ch,
              debit: 0,
              credit: grossSales,
            },
          ];

          if (returnAmt > 0) {
            lines.push({
              id: `l-${Date.now()}-${dateStr}-ret`,
              accountCode: "4201",
              accountName: "Retur Penjualan",
              storeTag: batch.storeName,
              sourceChannel: ch,
              debit: returnAmt,
              credit: 0,
            });
          }

          if (feeAmt > 0) {
            lines.push({
              id: `l-${Date.now()}-${dateStr}-fee`,
              accountCode: "5203",
              accountName: "Beban Fee & Promo Marketplace",
              storeTag: batch.storeName,
              sourceChannel: ch,
              debit: feeAmt,
              credit: 0,
            });
          }

          addDraftJournal({
            title: `Settlement ${batch.platform} ${batch.storeName} ${dateStr}: ${dateRows.length} order`,
            entryDate: dateStr,
            sourceType: "Marketplace",
            sourceChannel: ch,
            platformTag: batch.platform,
            storeId: batch.storeId,
            storeName: batch.storeName,
            totalAmount: totalDebit,
            orderCount: dateRows.length,
            lines,
          });
          createdCount++;

          // Step 2.2: Automatic Rp 1 Discrepancy Draft Generator (Selisih Settlement)
          if (diffRp > 0 && diffRp <= 5000) {
            discrepancyDraftCount++;
            generatedTableRows.push({
              tanggal: dateStr,
              jenis: "Selisih",
              jml: dateRows.length,
              totalDebit: diffRp,
              storeName: batch.storeName,
            });

            addDraftJournal({
              title: `Selisih Settlement ${batch.platform} ${batch.storeName} ${dateStr}: ${dateRows.length} order`,
              entryDate: dateStr,
              sourceType: "Marketplace",
              sourceChannel: ch,
              platformTag: batch.platform,
              storeId: batch.storeId,
              storeName: batch.storeName,
              totalAmount: diffRp,
              orderCount: dateRows.length,
              lines: [
                {
                  id: `l-sel-${Date.now()}-1`,
                  accountCode: "1206",
                  accountName: "Persediaan Barang Jadi",
                  storeTag: batch.storeName,
                  sourceChannel: ch,
                  debit: 0,
                  credit: diffRp,
                },
                {
                  id: `l-sel-${Date.now()}-2`,
                  accountCode: "5101",
                  accountName: "HPP Barang Jadi",
                  storeTag: batch.storeName,
                  sourceChannel: ch,
                  debit: diffRp,
                  credit: 0,
                },
              ],
            });
          }
        }
      }
    }

    setImportBatches((prev) =>
      prev.map((b) =>
        !b.draftGenerated &&
        (storeFilter === "ALL" || b.storeId === storeFilter)
          ? { ...b, draftGenerated: true }
          : b
      )
    );

    return {
      createdCount,
      discrepancyDraftCount,
      skippedCount,
      generatedTableRows,
    };
  };

  const recordStockPurchase = (params: {
    date: string;
    invoiceNo: string;
    supplier: string;
    itemSku: string;
    qty: number;
    itemPrice: number;
    shippingCost: number;
  }): JournalEntry => {
    const totalCost = params.qty * params.itemPrice + params.shippingCost;
    const item = inventory.find((i) => i.sku === params.itemSku);
    const isPackaging = item?.type === "PACKAGING";
    const accCode = isPackaging ? "1214" : "1213";
    const accName = isPackaging
      ? "Persediaan Kemasan"
      : "Persediaan Bahan Baku";

    if (item) {
      setInventory((prev) =>
        prev.map((inv) => {
          if (inv.sku !== params.itemSku) return inv;
          const newQty = inv.stockQty + params.qty;
          const newTotalVal = inv.totalValue + totalCost;
          const newUnitCost =
            newQty > 0 ? Math.round(newTotalVal / newQty) : inv.unitCost;
          return {
            ...inv,
            stockQty: newQty,
            totalValue: newTotalVal,
            unitCost: newUnitCost,
            daysLeft: Math.max(
              inv.daysLeft +
                Math.round(params.qty / Math.max(inv.dailyBurnRate, 1)),
              14
            ),
            critical: false,
          };
        })
      );
    }

    return addDraftJournal({
      title: `Pembelian ${params.supplier} nota ${params.invoiceNo}: ${
        params.qty
      } ${item?.unit || "unit"} ${
        item?.name || params.itemSku
      }, total ${totalCost.toLocaleString(
        "id-ID"
      )} (ongkir ${params.shippingCost.toLocaleString("id-ID")})`,
      entryDate: params.date,
      sourceType: "Stok",
      sourceChannel: "Operasional",
      platformTag: "Stok",
      totalAmount: totalCost,
      lines: [
        {
          id: `l-stk-1-${Date.now()}`,
          accountCode: accCode,
          accountName: accName,
          sourceChannel: "Operasional",
          debit: totalCost,
          credit: 0,
        },
        {
          id: `l-stk-2-${Date.now()}`,
          accountCode: "1102",
          accountName: "BCA PT",
          sourceChannel: "Operasional",
          debit: 0,
          credit: totalCost,
        },
      ],
    });
  };

  const summary = useMemo<AccountingSummary>(() => {
    const cashAndBank =
      accounts.find((a) => a.code === "1102")?.closingBalance || 0;
    const marketplaceFunds = accounts
      .filter((a) => a.code === "1106" || a.code === "1109")
      .reduce((acc, a) => acc + a.closingBalance, 0);

    const receivableAndInventory = accounts
      .filter((a) => a.category === "ASSET_RECEIVABLE_INVENTORY")
      .reduce((acc, a) => acc + a.closingBalance, 0);

    const fixedAssets = accounts
      .filter((a) => a.category === "ASSET_FIXED")
      .reduce((acc, a) => acc + a.closingBalance, 0);

    const totalAssets =
      cashAndBank + marketplaceFunds + receivableAndInventory + fixedAssets;

    const totalLiabilities = accounts
      .filter((a) => a.category === "LIABILITY_SHORT")
      .reduce((acc, a) => acc + a.closingBalance, 0);

    const totalEquity = accounts
      .filter((a) => a.category === "EQUITY")
      .reduce((acc, a) => acc + a.closingBalance, 0);

    // If a specific source channel filter is active, compute P&L from that channel's breakdown
    if (selectedSourceFilter !== "ALL") {
      const chData = sourceBreakdown.find(
        (b) => b.channel === selectedSourceFilter
      );
      if (chData) {
        const pendingCount = journals.filter(
          (j) =>
            j.status === "MENUNGGU" && j.sourceChannel === selectedSourceFilter
        ).length;
        const problemCount = journals.filter(
          (j) =>
            j.status === "BERMASALAH" &&
            j.sourceChannel === selectedSourceFilter
        ).length;

        return {
          totalAssets,
          totalEquity,
          totalLiabilities,
          marketplaceFunds: chData.walletBalance || marketplaceFunds,
          cashAndBank,
          netSales: chData.netSales,
          grossProfit: chData.grossProfit,
          totalHpp: chData.hpp,
          totalOperatingExpense:
            chData.marketplaceFee + chData.adExpense + chData.operatingExpense,
          netIncome: chData.netProfit,
          pph22Prepaid: chData.pph22TaxCredit,
          isBalanced:
            Math.abs(totalAssets - (totalLiabilities + totalEquity)) <= 5,
          pendingCount,
          approvedTodayCount,
          problemCount,
        };
      }
    }

    const grossSalesRunning =
      accounts.find((a) => a.code === "4112")?.runningMutation || 0;
    const salesReturnRunning =
      accounts.find((a) => a.code === "4201")?.runningMutation || 0;
    const otherIncomeRunning =
      accounts.find((a) => a.code === "5803")?.runningMutation || 0;

    const netSales = grossSalesRunning - salesReturnRunning + otherIncomeRunning;
    const totalHpp =
      accounts.find((a) => a.code === "5101")?.runningMutation || 0;
    const grossProfit = netSales - totalHpp;

    const totalOperatingExpense = accounts
      .filter((a) => a.category === "EXPENSE")
      .reduce((acc, a) => acc + a.runningMutation, 0);

    const netIncome = grossProfit - totalOperatingExpense;
    const pph22Prepaid =
      accounts.find((a) => a.code === "1218")?.closingBalance || 0;

    const pendingCount = journals.filter((j) => j.status === "MENUNGGU").length;
    const problemCount = journals.filter(
      (j) => j.status === "BERMASALAH"
    ).length;

    return {
      totalAssets,
      totalEquity,
      totalLiabilities,
      marketplaceFunds,
      cashAndBank,
      netSales,
      grossProfit,
      totalHpp,
      totalOperatingExpense,
      netIncome,
      pph22Prepaid,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) <= 5,
      pendingCount,
      approvedTodayCount,
      problemCount,
    };
  }, [
    accounts,
    journals,
    approvedTodayCount,
    selectedSourceFilter,
    sourceBreakdown,
  ]);

  return (
    <AccountingContext.Provider
      value={{
        companies,
        activeCompany,
        switchCompany,
        addCompany,
        selectedSourceFilter,
        setSelectedSourceFilter,
        sourceBreakdown,
        accounts,
        stores,
        journals,
        importBatches,
        inventory,
        storePerformance,
        summary,
        approveJournal,
        rejectJournal,
        addDraftJournal,
        addParsedImportBatches,
        generateDraftsFromImports,
        recordStockPurchase,
      }}
    >
      {children}
    </AccountingContext.Provider>
  );
}

export function useAccounting() {
  const ctx = useContext(AccountingContext);
  if (!ctx) {
    throw new Error("useAccounting must be used within AccountingProvider");
  }
  return ctx;
}
