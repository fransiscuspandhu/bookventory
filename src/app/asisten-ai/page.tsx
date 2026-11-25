"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Send, Paperclip, MessageSquare } from "lucide-react";
import { useAccounting } from "@/lib/accounting-context";
import { formatIDR } from "@/lib/accounting-data";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  draftCreated?: {
    title: string;
    debitLabel: string;
    creditLabel: string;
    amount: number;
  };
}

function parseNaturalLanguageAmount(input: string): number {
  const lower = input.toLowerCase();

  // Pattern: "satu juta lima ratus"
  if (lower.includes("satu juta lima ratus") || lower.includes("1,5 juta") || lower.includes("1.5 juta")) {
    return 1500000;
  }
  if (lower.includes("7,6 juta") || lower.includes("7.6 juta") || lower.includes("tujuh juta enam ratus")) {
    return 7600000;
  }

  // Match explicit numbers like 1500000, 1.500.000, 500rb, 2jt
  const jtMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:juta|jt)/);
  if (jtMatch) {
    const val = parseFloat(jtMatch[1].replace(",", "."));
    return Math.round(val * 1000000);
  }

  const rbMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:ribu|rb)/);
  if (rbMatch) {
    const val = parseFloat(rbMatch[1].replace(",", "."));
    return Math.round(val * 1000);
  }

  const rawDigits = lower.replace(/\./g, "").match(/\d{4,}/);
  if (rawDigits) {
    return parseInt(rawDigits[0], 10);
  }

  return 1500000;
}

export default function AsistenAiPage() {
  const { summary, addDraftJournal } = useAccounting();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      text: "Halo! Mau catat apa hari ini? Anda bisa mengetik transaksi (misal: \"bayar iklan Meta satu juta lima ratus\", \"gaji 2 staff gudang 7.600.000\") atau bertanya laporan HPP, Laba Rugi, dan Pajak PPh 22.",
    },
  ]);

  const handleSend = (customPrompt?: string) => {
    const promptText = (customPrompt ?? input).trim();
    if (!promptText) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: promptText,
    };

    const lower = promptText.toLowerCase();

    // Case 1: Asking for report / profit / HPP / tax
    if (
      lower.includes("berapa") ||
      lower.includes("laporan") ||
      lower.includes("laba") ||
      lower.includes("pajak") ||
      lower.includes("pph") ||
      lower.includes("hpp")
    ) {
      const replyMsg: ChatMessage = {
        id: `a-${Date.now() + 1}`,
        role: "assistant",
        text: `Ringkasan Keuangan Topherbal (November 2026):\n• Penjualan Bersih: ${formatIDR(
          summary.netSales
        )}\n• Total HPP Barang Jadi (5101): ${formatIDR(
          summary.totalHpp
        )}\n• Laba Kotor: ${formatIDR(
          summary.grossProfit
        )}\n• Laba Bersih: ${formatIDR(
          summary.netIncome
        )}\n• Kredit Pajak PPh 22 Dibayar Dimuka (1218): ${formatIDR(
          summary.pph22Prepaid
        )}\n• Status Neraca: ${
          summary.isBalanced ? "Seimbang ✓ (Aset = Liabilitas + Ekuitas)" : "Perlu dicek"
        }`,
      };
      setMessages((prev) => [...prev, userMsg, replyMsg]);
      setInput("");
      return;
    }

    // Case 2: Recording an expense or stock purchase -> Create Draft Journal
    const amount = parseNaturalLanguageAmount(promptText);
    let debitCode = "5301";
    let debitName = "By Pemasaran META ADS";
    let displayTitle = "Beban Iklan Meta Ads";
    let sourceType: "AI (Gemini Pro)" | "Stok" = "AI (Gemini Pro)";

    if (lower.includes("gaji") || lower.includes("staff") || lower.includes("karyawan")) {
      debitCode = "5401";
      debitName = "By Gaji Karyawan";
      displayTitle = "Beban Gaji Karyawan";
    } else if (lower.includes("kemasan") || lower.includes("botol") || lower.includes("kardus")) {
      debitCode = "1214";
      debitName = "Persediaan Kemasan";
      displayTitle = "Pembelian Persediaan Kemasan";
      sourceType = "Stok";
    } else if (lower.includes("bahan") || lower.includes("serbuk") || lower.includes("herbal")) {
      debitCode = "1213";
      debitName = "Persediaan Bahan Baku";
      displayTitle = "Pembelian Bahan Baku";
      sourceType = "Stok";
    } else if (lower.includes("tiktok") || lower.includes("shopee") || lower.includes("gmv")) {
      debitCode = "5308";
      debitName = "Beban Iklan Marketplace";
      displayTitle = "Beban Iklan Marketplace";
    }

    addDraftJournal({
      title: `${displayTitle} (${promptText})`,
      entryDate: "2026-11-24",
      sourceType,
      platformTag: "AI (Gemini Pro)",
      totalAmount: amount,
      lines: [
        {
          id: `l-ai-d-${Date.now()}`,
          accountCode: debitCode,
          accountName: debitName,
          debit: amount,
          credit: 0,
        },
        {
          id: `l-ai-c-${Date.now()}`,
          accountCode: "1102",
          accountName: "BCA PT",
          debit: 0,
          credit: amount,
        },
      ],
    });

    const aiReply: ChatMessage = {
      id: `a-${Date.now() + 1}`,
      role: "assistant",
      text: `Siap! Draft sudah dibuat:\n${displayTitle} ${formatIDR(
        amount
      )} dibayar dari BCA PT`,
      draftCreated: {
        title: displayTitle,
        debitLabel: `${debitCode} - ${debitName}`,
        creditLabel: "1102 - BCA PT",
        amount,
      },
    };

    setMessages((prev) => [...prev, userMsg, aiReply]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] max-h-[760px] bg-[#f4f2eb] rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Chat Header matching video 0:52 */}
      <div className="bg-white px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span className="font-bold text-sm text-slate-900">
            Asisten AI · terhubung ke Topherbal
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          Gemini Pro · OpenClaw/Hermes Ready
        </span>
      </div>

      {/* Quick Prompt Chips */}
      <div className="bg-white/60 px-4 py-2 border-b border-slate-200/50 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 shrink-0">Contoh klik:</span>
        <button
          onClick={() => handleSend("bayar iklan Meta satu juta lima ratus")}
          className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-[#15803d] text-slate-700 font-medium shrink-0 cursor-pointer"
        >
          &ldquo;bayar iklan Meta satu juta lima ratus&rdquo;
        </button>
        <button
          onClick={() => handleSend("Beli kemasan botol 2.400.000 dari BCA")}
          className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-[#15803d] text-slate-700 font-medium shrink-0 cursor-pointer"
        >
          &ldquo;Beli kemasan botol 2.400.000&rdquo;
        </button>
        <button
          onClick={() =>
            handleSend("Berapa laba bersih, HPP, dan pajak PPh 22 bulan ini?")
          }
          className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-[#15803d] text-slate-700 font-medium shrink-0 cursor-pointer"
        >
          &ldquo;Berapa laba, HPP & PPh 22 bulan ini?&rdquo;
        </button>
      </div>

      {/* Messages Container matching video 0:53 - 0:58 */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-3 text-xs sm:text-sm shadow-2xs space-y-2.5 ${
                msg.role === "user"
                  ? "bg-[#e7e2d3] text-slate-900 rounded-br-xs"
                  : "bg-white text-slate-900 rounded-bl-xs"
              }`}
            >
              <div className="whitespace-pre-line leading-relaxed">
                {msg.text}
              </div>

              {msg.draftCreated && (
                <div className="pt-1">
                  <Link
                    href="/antrian"
                    className="inline-block px-3.5 py-2 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-bold text-xs transition-colors shadow-2xs"
                  >
                    Tinjau draft di Antrian
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Input Form matching video 0:56 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2"
      >
        <Link
          href="/import"
          className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          title="Upload File Excel / Foto Nota"
        >
          <Paperclip className="w-4 h-4" />
        </Link>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik mis. bayar iklan Meta satu juta lima ratus..."
          className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#15803d]"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Kirim</span>
        </button>
      </form>
    </div>
  );
}
