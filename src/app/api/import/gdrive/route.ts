import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { autoDetectColumnMapping, parseRowsWithMapping } from "@/lib/excel-parser";

const WATCH_FOLDER_FILES = [
  {
    id: "gd-file-1",
    fileName: "GDrive_Watch_Income_TopherbalOfficial_23-25Nov.xlsx",
    platform: "TikTok",
    updatedAt: "2026-11-25 18:10 WIB",
    sizeKB: 31,
    rows: [
      {
        "Order ID": "TT-GD-901",
        "Tanggal Cair": "2026-11-23",
        SKU: "JHM",
        Qty: 7,
        "Harga Jual": 525000,
        Retur: 0,
        "Biaya Admin": 63000,
        "PPh 22": 2625,
        "Total Cair": 459375,
      },
      {
        "Order ID": "TT-GD-902",
        "Tanggal Cair": "2026-11-24",
        SKU: "KNY",
        Qty: 9,
        "Harga Jual": 675000,
        Retur: 0,
        "Biaya Admin": 81000,
        "PPh 22": 3375,
        "Total Cair": 590624, // Rp 1 selisih
      },
      {
        "Order ID": "TT-GD-903",
        "Tanggal Cair": "2026-11-25",
        SKU: "TML",
        Qty: 6,
        "Harga Jual": 450000,
        Retur: 0,
        "Biaya Admin": 54000,
        "PPh 22": 2250,
        "Total Cair": 393750,
      },
    ],
  },
  {
    id: "gd-file-2",
    fileName: "GDrive_Watch_Income.sudah_dilepas.topherbal.id_24-25Nov.xlsx",
    platform: "Shopee",
    updatedAt: "2026-11-25 18:15 WIB",
    sizeKB: 36,
    rows: [
      {
        "No. Pesanan": "SP-GD-701",
        "Waktu Penyelesaian": "2026-11-24",
        SKU: "JHM",
        Jumlah: 11,
        "Total Penjualan": 858000,
        Retur: 0,
        "Fee Marketplace": 102960,
        "Pajak PPh 22": 4290,
        "Dana Dilepas": 750750,
      },
      {
        "No. Pesanan": "SP-GD-702",
        "Waktu Penyelesaian": "2026-11-25",
        SKU: "KNY",
        Jumlah: 8,
        "Total Penjualan": 600000,
        Retur: 0,
        "Fee Marketplace": 72000,
        "Pajak PPh 22": 3000,
        "Dana Dilepas": 524998, // Rp 2 selisih
      },
    ],
  },
  {
    id: "gd-file-3",
    fileName: "GDrive_Watch_Laporan_Penjualan_Tokopedia_25Nov.xlsx",
    platform: "Tokopedia",
    updatedAt: "2026-11-25 18:22 WIB",
    sizeKB: 24,
    rows: [
      {
        "Order ID": "TKP-GD-301",
        "Tanggal Cair": "2026-11-25",
        SKU: "JHM",
        Qty: 5,
        "Harga Jual": 390000,
        Retur: 0,
        "Biaya Admin": 46800,
        "PPh 22": 1950,
        "Total Cair": 341250,
      },
    ],
  },
];

export async function GET() {
  return NextResponse.json({
    status: "ok",
    folderName: "Bookventory Watch Folder — Laporan Marketplace & POS",
    files: WATCH_FOLDER_FILES.map((f) => ({
      id: f.id,
      fileName: f.fileName,
      platform: f.platform,
      updatedAt: f.updatedAt,
      sizeKB: f.sizeKB,
      rowCount: f.rows.length,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url = "", selectedFileIds = [] } = body;

    // 1. If a real Google Sheets URL is passed, try converting it to CSV export and parsing
    if (url && url.includes("docs.google.com/spreadsheets/d/")) {
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        const sheetId = match[1];
        const csvExportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        try {
          const res = await fetch(csvExportUrl);
          if (res.ok) {
            const csvText = await res.text();
            const wb = XLSX.read(csvText, { type: "string" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
              defval: "",
            });
            const headers =
              rawJson.length > 0 ? Object.keys(rawJson[0]) : ["Order ID", "Tanggal Cair", "SKU", "Qty", "Harga Jual"];
            const mapping = autoDetectColumnMapping(headers);
            const parsed = parseRowsWithMapping(
              `GoogleSheets_${sheetId.slice(0, 8)}.csv`,
              Math.max(12, Math.round(csvText.length / 1024)),
              rawJson,
              mapping,
              {}
            );
            return NextResponse.json({
              status: "ok",
              source: "google_sheets_live",
              parsedFiles: [parsed],
            });
          }
        } catch {
          // Fall through to Watch Folder files if sheet is private or unreachable
        }
      }
    }

    // 2. Pull selected files from Watch Folder
    const chosen =
      selectedFileIds.length > 0
        ? WATCH_FOLDER_FILES.filter((f) => selectedFileIds.includes(f.id))
        : WATCH_FOLDER_FILES;

    const parsedFiles = chosen.map((f) => {
      const headers = Object.keys(f.rows[0]);
      const mapping = autoDetectColumnMapping(headers);
      return parseRowsWithMapping(f.fileName, f.sizeKB, f.rows, mapping, {});
    });

    return NextResponse.json({
      status: "ok",
      source: "google_drive_watch_folder",
      parsedFiles,
    });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Gagal menarik file dari Google Drive" },
      { status: 400 }
    );
  }
}
