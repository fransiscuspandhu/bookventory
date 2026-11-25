import { NextResponse } from "next/server";
import {
  INITIAL_ACCOUNTS,
  INITIAL_JOURNAL_DRAFTS,
  INITIAL_STORES,
  formatIDR,
} from "@/lib/accounting-data";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Bookventory Accounting & Tax Engine API (OpenClaw / Hermes Ready)",
    summary: {
      totalAssets: formatIDR(287492430),
      totalLiabilities: formatIDR(2776590),
      totalEquity: formatIDR(284715840),
      netSales: formatIDR(92777590),
      totalHpp: formatIDR(15013838),
      pph22TaxCredit: formatIDR(912185),
      netIncome: formatIDR(49826678),
      isBalanced: true,
      pendingDraftsCount: INITIAL_JOURNAL_DRAFTS.length,
    },
    stores: INITIAL_STORES,
    coaCount: INITIAL_ACCOUNTS.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, prompt, amount, debitAccount, creditAccount } = body;

    return NextResponse.json({
      status: "draft_created",
      action: action || "create_journal_draft",
      message: `Draft jurnal berhasil dibuat dari ${prompt || "OpenClaw/Hermes Agent"}`,
      draft: {
        id: `draft-agent-${Date.now()}`,
        debitAccount: debitAccount || "5301 - By Pemasaran META ADS",
        creditAccount: creditAccount || "1102 - BCA PT",
        amount: amount || 1500000,
        balanced: true,
      },
    });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Payload JSON tidak valid" },
      { status: 400 }
    );
  }
}
