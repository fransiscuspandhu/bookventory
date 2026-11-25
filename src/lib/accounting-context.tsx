"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import Decimal from "decimal.js";
import {
  Account,
  Store,
  JournalEntry,
  ImportBatch,
  InventoryItem,
  StorePerformanceMetrics,
  INITIAL_ACCOUNTS,
  INITIAL_STORES,
  INITIAL_JOURNAL_DRAFTS,
  INITIAL_IMPORT_BATCHES,
  INITIAL_INVENTORY,
  INITIAL_STORE_PERFORMANCE,
  validateDoubleEntry,
  JournalLine,
} from "./accounting-data";

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
  accounts: Account[];
  stores: Store[];
  journals: JournalEntry[];
  importBatches: ImportBatch[];
  inventory: InventoryItem[];
  storePerformance: StorePerformanceMetrics[];
  summary: AccountingSummary;
  approveJournal: (id: string) => { success: boolean; message: string };
  rejectJournal: (id: string) => void;
  addDraftJournal: (draft: Omit<JournalEntry, "id" | "createdAt" | "status">) => JournalEntry;
  addImportBatch: (files: { name: string; sizeKB: number }[]) => void;
  generateDraftsFromImports: (storeFilter: string) => number;
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

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export function AccountingProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [stores] = useState<Store[]>(INITIAL_STORES);
  const [journals, setJournals] = useState<JournalEntry[]>(INITIAL_JOURNAL_DRAFTS);
  const [importBatches, setImportBatches] = useState<ImportBatch[]>(INITIAL_IMPORT_BATCHES);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [storePerformance] = useState<StorePerformanceMetrics[]>(INITIAL_STORE_PERFORMANCE);
  const [approvedTodayCount, setApprovedTodayCount] = useState<number>(2);

  // Approve a draft journal and apply double-entry mutation to accounts & equity
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

    // Apply each line to accounts using Decimal
    setAccounts((prevAccounts) => {
      let netProfitDelta = new Decimal(0);

      const updated = prevAccounts.map((acc) => {
        const matchingLines = target.lines.filter((l) => l.accountCode === acc.code);
        if (matchingLines.length === 0) return acc;

        let delta = new Decimal(0);
        for (const line of matchingLines) {
          if (acc.normalBalance === "DEBIT") {
            delta = delta.plus(line.debit).minus(line.credit);
          } else {
            delta = delta.plus(line.credit).minus(line.debit);
          }

          // Track P&L impact so Retained Earnings (3104) keeps Balance Sheet 100% balanced
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

        const newRunning = new Decimal(acc.runningMutation).plus(delta).toNumber();
        const newClosing = new Decimal(acc.openingBalance).plus(newRunning).toNumber();

        return {
          ...acc,
          runningMutation: newRunning,
          closingBalance: newClosing,
        };
      });

      // Update 3104 (Laba/Rugi Periode Berjalan) if P&L accounts changed
      if (!netProfitDelta.equals(0)) {
        return updated.map((acc) => {
          if (acc.code !== "3104") return acc;
          const newRunning = new Decimal(acc.runningMutation).plus(netProfitDelta).toNumber();
          const newClosing = new Decimal(acc.openingBalance).plus(newRunning).toNumber();
          return {
            ...acc,
            runningMutation: newRunning,
            closingBalance: newClosing,
          };
        });
      }

      return updated;
    });

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
      message: `Jurnal "${target.title}" berhasil dibukukan ke Buku Besar & Neraca.`,
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
      id: `draft-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: validation.isValid ? "MENUNGGU" : "BERMASALAH",
      errorReason: validation.isValid
        ? undefined
        : `Debit != Kredit (Selisih ${validation.difference})`,
    };
    setJournals((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  const addImportBatch = (files: { name: string; sizeKB: number }[]) => {
    const newBatches: ImportBatch[] = files.map((f, idx) => {
      const lower = f.name.toLowerCase();
      const isTikTok = lower.includes("tiktok") || lower.includes("topherbalofficial") || lower.includes("all_order");
      const isIncome = lower.includes("income") || lower.includes("settlement");

      const store = isTikTok ? stores[0] : stores[1];
      const settlementCount = isIncome ? 16 : 0;
      const orderCount = isIncome ? 0 : 92;
      const netDisbursed = isIncome ? 1384500 : 0;

      return {
        id: `imp-${Date.now()}-${idx}`,
        fileName: f.name,
        fileSizeKB: f.sizeKB || 28,
        storeId: store.id,
        storeName: store.name,
        platform: store.platform === "TikTok" ? "TikTok" : "Shopee",
        reportType: isIncome
          ? store.platform === "Shopee"
            ? "Income (sudah dilepas)"
            : "Income"
          : store.platform === "Shopee"
          ? "Order.all"
          : "Semua pesanan",
        periodStart: "20 Nov 2026",
        periodEnd: "24 Nov 2026",
        status: "RECOGNIZED",
        orderCount,
        settlementCount,
        mutationCount: isIncome ? 1 : 0,
        netDisbursed,
        saved: true,
        draftGenerated: false,
      };
    });

    setImportBatches((prev) => [...newBatches, ...prev]);
  };

  const generateDraftsFromImports = (storeFilter: string): number => {
    const pendingBatches = importBatches.filter(
      (b) =>
        !b.draftGenerated &&
        (storeFilter === "ALL" || b.storeId === storeFilter)
    );

    let createdCount = 0;
    for (const batch of pendingBatches) {
      const grossSales = batch.netDisbursed > 0 ? Math.round(batch.netDisbursed * 1.15) : 1580000;
      const pph22 = Math.round(grossSales * 0.005);
      const fee = grossSales - (batch.netDisbursed || 1365000) - pph22;
      const netWallet = grossSales - fee - pph22;
      const hpp = Math.round(grossSales * 0.165);
      const walletCode = batch.platform === "TikTok" ? "1106" : "1109";
      const walletName =
        batch.platform === "TikTok"
          ? "Saldo Penjual - TikTok Topherbal Official"
          : "Saldo Penjual - Shopee topherbal.id";

      const lines: JournalLine[] = [
        {
          id: `l-${Date.now()}-1`,
          accountCode: "1206",
          accountName: "Persediaan Barang Jadi",
          storeTag: batch.storeName,
          debit: 0,
          credit: hpp,
        },
        {
          id: `l-${Date.now()}-2`,
          accountCode: "5101",
          accountName: "HPP Barang Jadi",
          storeTag: batch.storeName,
          debit: hpp,
          credit: 0,
        },
        {
          id: `l-${Date.now()}-3`,
          accountCode: walletCode,
          accountName: walletName,
          storeTag: batch.storeName,
          debit: netWallet,
          credit: 0,
        },
        {
          id: `l-${Date.now()}-4`,
          accountCode: "1218",
          accountName: "PPh 22 Dibayar Dimuka",
          storeTag: batch.storeName,
          debit: pph22,
          credit: 0,
        },
        {
          id: `l-${Date.now()}-5`,
          accountCode: "4112",
          accountName: "Penjualan Marketplace",
          storeTag: batch.storeName,
          debit: 0,
          credit: grossSales,
        },
        {
          id: `l-${Date.now()}-6`,
          accountCode: "5203",
          accountName: "Beban Fee & Promo Marketplace",
          storeTag: batch.storeName,
          debit: fee,
          credit: 0,
        },
      ];

      addDraftJournal({
        title: `Settlement ${batch.platform} ${batch.storeName} 2026-11-24: ${
          batch.settlementCount || 15
        } order (dari ${batch.fileName})`,
        entryDate: "2026-11-24",
        sourceType: "Marketplace",
        platformTag: "Marketplace",
        storeId: batch.storeId,
        storeName: batch.storeName,
        totalAmount: grossSales + hpp,
        orderCount: batch.settlementCount || 15,
        lines,
      });
      createdCount++;
    }

    setImportBatches((prev) =>
      prev.map((b) =>
        !b.draftGenerated && (storeFilter === "ALL" || b.storeId === storeFilter)
          ? { ...b, draftGenerated: true }
          : b
      )
    );

    return createdCount;
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
    const accName = isPackaging ? "Persediaan Kemasan" : "Persediaan Bahan Baku";

    // Update inventory weighted average
    if (item) {
      setInventory((prev) =>
        prev.map((inv) => {
          if (inv.sku !== params.itemSku) return inv;
          const newQty = inv.stockQty + params.qty;
          const newTotalVal = inv.totalValue + totalCost;
          const newUnitCost = newQty > 0 ? Math.round(newTotalVal / newQty) : inv.unitCost;
          return {
            ...inv,
            stockQty: newQty,
            totalValue: newTotalVal,
            unitCost: newUnitCost,
            daysLeft: Math.max(inv.daysLeft + Math.round(params.qty / Math.max(inv.dailyBurnRate, 1)), 14),
            critical: false,
          };
        })
      );
    }

    return addDraftJournal({
      title: `Pembelian ${params.supplier} nota ${params.invoiceNo}: ${params.qty} ${
        item?.unit || "unit"
      } ${item?.name || params.itemSku}, total ${totalCost.toLocaleString("id-ID")} (ongkir ${params.shippingCost.toLocaleString("id-ID")})`,
      entryDate: params.date,
      sourceType: "Stok",
      platformTag: "Stok",
      totalAmount: totalCost,
      lines: [
        {
          id: `l-stk-1-${Date.now()}`,
          accountCode: accCode,
          accountName: accName,
          debit: totalCost,
          credit: 0,
        },
        {
          id: `l-stk-2-${Date.now()}`,
          accountCode: "1102",
          accountName: "BCA PT",
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
    const problemCount = journals.filter((j) => j.status === "BERMASALAH").length;

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
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) <= 1,
      pendingCount,
      approvedTodayCount,
      problemCount,
    };
  }, [accounts, journals, approvedTodayCount]);

  return (
    <AccountingContext.Provider
      value={{
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
        addImportBatch,
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
