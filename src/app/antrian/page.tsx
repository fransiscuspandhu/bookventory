"use client";

import React, { useState } from "react";
import {
  Check,
  X,
  Pencil,
  ListTodo,
  AlertTriangle,
  CheckCircle2,
  Scale,
} from "lucide-react";
import { useAccounting } from "@/lib/accounting-context";
import {
  formatIDR,
  validateDoubleEntry,
  JournalEntry,
} from "@/lib/accounting-data";

export default function AntrianPage() {
  const { journals, summary, approveJournal, rejectJournal } = useAccounting();
  const [activeTab, setActiveTab] = useState<"MENUNGGU" | "RIWAYAT">("MENUNGGU");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const pendingJournals = journals.filter(
    (j) => j.status === "MENUNGGU" || j.status === "BERMASALAH"
  );
  const historyJournals = journals.filter(
    (j) => j.status === "DISETUJUI" || j.status === "DITOLAK"
  );

  const displayedJournals =
    activeTab === "MENUNGGU" ? pendingJournals : historyJournals;

  const handleApprove = (id: string) => {
    setProcessingId(id);
    setTimeout(() => {
      const res = approveJournal(id);
      setProcessingId(null);
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 4000);
    }, 350);
  };

  const handleApproveAll = () => {
    for (const j of pendingJournals) {
      approveJournal(j.id);
    }
    setToastMessage(
      `${pendingJournals.length} Draft Jurnal berhasil disetujui & masuk ke Neraca/Laba Rugi!`
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-900 text-white px-4 py-3 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-200 hover:text-white ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Summary Cards matching video 0:16 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ListTodo className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium text-slate-600 mt-2.5">
            Menunggu
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">
            {summary.pendingCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Draft menunggu persetujuan
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium text-slate-600 mt-2.5">
            Bermasalah
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">
            {summary.problemCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Tidak ada yang tertahan
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium text-slate-600 mt-2.5">
            Disetujui hari ini
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">
            {summary.approvedTodayCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Draft yang disetujui hari ini
          </div>
        </div>
      </div>

      {/* Tabs: Menunggu (N) | Riwayat + Bulk Approve Button */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 gap-2">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("MENUNGGU")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "MENUNGGU"
                ? "border-[#15803d] text-[#15803d]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Menunggu ({pendingJournals.length})
          </button>
          <button
            onClick={() => setActiveTab("RIWAYAT")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "RIWAYAT"
                ? "border-[#15803d] text-[#15803d]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Riwayat ({historyJournals.length})
          </button>
        </div>

        {activeTab === "MENUNGGU" && pendingJournals.length > 1 && (
          <button
            onClick={handleApproveAll}
            className="mb-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#15803d] border border-emerald-200 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Setujui Semua ({pendingJournals.length})
          </button>
        )}
      </div>

      {/* Draft Journal Cards matching video 0:16 - 0:40 */}
      {displayedJournals.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <div className="text-base font-bold text-slate-900 mt-3">
            Semua draft jurnal sudah diproses!
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Silakan import laporan baru di menu Import atau catat transaksi via Asisten AI.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedJournals.map((entry) => {
            const check = validateDoubleEntry(entry.lines);
            const isProcessing = processingId === entry.id;

            return (
              <div
                key={entry.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4"
              >
                {/* Badges & Date Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                        entry.status === "MENUNGGU"
                          ? "bg-amber-100 text-amber-800"
                          : entry.status === "DISETUJUI"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {entry.status === "MENUNGGU"
                        ? "Menunggu"
                        : entry.status === "DISETUJUI"
                        ? "Disetujui"
                        : "Ditolak"}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {entry.platformTag || entry.sourceType}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                        entry.sourceType === "Marketplace"
                          ? "bg-purple-100 text-purple-800"
                          : entry.sourceType === "Stok"
                          ? "bg-amber-100 text-amber-900"
                          : entry.sourceType === "Iklan"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {entry.sourceType}
                    </span>

                    <span className="text-xs text-slate-400 font-medium ml-1">
                      {entry.entryDate.split("-").reverse().join("/")}
                    </span>
                  </div>

                  {/* Balance indicator */}
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      check.isValid
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    <Scale className="w-3 h-3" />
                    {check.isValid
                      ? "Debit = Kredit"
                      : `Selisih ${formatIDR(check.difference)}`}
                  </span>
                </div>

                {/* Title & Total Amount */}
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">
                    {entry.title}
                  </h3>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">
                    {formatIDR(check.totalDebit)}
                  </div>
                </div>

                {/* Double-Entry Lines Table */}
                <div className="divide-y divide-slate-100 border-t border-b border-slate-100 py-1">
                  {entry.lines.map((line) => {
                    const isDebit = line.debit > 0;
                    const amount = isDebit ? line.debit : line.credit;
                    const isPph22 = line.accountCode === "1218";

                    return (
                      <div
                        key={line.id}
                        className={`py-2.5 flex items-start justify-between gap-3 ${
                          isPph22
                            ? "bg-amber-50/70 -mx-2 px-2 rounded-lg"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span
                            className={`mt-0.5 px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 ${
                              isDebit
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                : "bg-slate-100 text-slate-600 border border-slate-200/60"
                            }`}
                          >
                            {isDebit ? "Debit" : "Kredit"}
                          </span>
                          <div className="text-xs sm:text-sm text-slate-700 leading-snug">
                            <span className="font-semibold text-slate-900">
                              {line.accountCode} - {line.accountName}
                            </span>
                            {line.storeTag && (
                              <span className="text-slate-400">
                                {" "}
                                · {line.storeTag}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-xs sm:text-sm font-bold text-slate-900 font-mono shrink-0">
                          {formatIDR(amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons matching video 0:17 */}
                {entry.status === "MENUNGGU" && (
                  <div className="space-y-2.5 pt-1">
                    <button
                      onClick={() => handleApprove(entry.id)}
                      disabled={isProcessing}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#15803d] hover:bg-[#166534] disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>{isProcessing ? "Memproses..." : "Setujui"}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => setEditingEntry(entry)}
                        className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => rejectJournal(entry.id)}
                        className="py-2 px-3 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Detail / Edit Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Detail & Pemeriksaan Jurnal Double-Entry
              </h3>
              <button
                onClick={() => setEditingEntry(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2">
              <div className="font-semibold text-slate-900">
                {editingEntry.title}
              </div>
              <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 font-mono text-[11px]">
                {editingEntry.lines.map((l) => (
                  <div key={l.id} className="flex justify-between">
                    <span>
                      [{l.debit > 0 ? "D" : "K"}] {l.accountCode} {l.accountName}
                    </span>
                    <span>{formatIDR(l.debit > 0 ? l.debit : l.credit)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const id = editingEntry.id;
                  setEditingEntry(null);
                  handleApprove(id);
                }}
                className="px-4 py-2 rounded-xl bg-[#15803d] text-white text-xs font-semibold"
              >
                Setujui Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
