# 3. Estimasi Biaya Infrastruktur, API & Operasional (Cost Breakdown)

Dokumen ini merinci estimasi biaya (*running cost*) bulanan untuk menjalankan sistem **Bookventory**. Karena kita menggunakan pendekatan **Hybrid Deterministic Parser + Selective AI**, biaya token AI dapat ditekan hingga **90% lebih hemat** dibandingkan memproses seluruh baris Excel menggunakan LLM.

---

## 0. Setup Khusus Anda Saat Ini (Biaya Tambahan = Rp 0 / Bulan!)

Berdasarkan aset yang sudah Anda miliki saat ini:
1. **VPS Sendiri (Sudah Ada):** Seluruh komponen (`Next.js Web App`, `PostgreSQL Database`, dan `OpenClaw / Hermes Agent`) dapat dijalankan bersama menggunakan Docker Compose di VPS Anda tanpa biaya sewa server tambahan (**Rp 0**).
2. **Integrasi Chat via OpenClaw atau Hermes Agent:**
   * **OpenClaw** (`openclaw`) maupun **Hermes Agent** (`NousResearch/hermes-agent`) adalah *open-source self-hosted agent* yang sudah memiliki *built-in gateway* untuk **WhatsApp (via Baileys QR Link)** dan **Telegram (via BotFather)**.
   * Tidak perlu sewa layanan gateway pihak ketiga seperti Wablas/Fonnte (**Rp 0**).
3. **Langganan Gemini Pro + Google AI Studio:**
   * **Di dalam OpenClaw / Hermes:** Keduanya mendukung integrasi model Gemini (termasuk melalui autentikasi Google / Gemini CLI OAuth atau Google AI Studio API Key).
   * **Google AI Studio Free Tier:** Google juga menyediakan *Free Tier* resmi untuk Gemini 2.5 Flash & Pro via API key (hingga 1.500 request/hari untuk Flash) yang sudah lebih dari cukup untuk memproses ratusan chat, OCR foto nota, dan mapping Excel custom di mode MVP/Bootstrap (**Rp 0**).

> [!IMPORTANT]
> **Total Biaya Tambahan (Incremental Cost) untuk Mode MVP / Bootstrap Anda = Rp 0 / bulan.**

---

## 1. Mengapa Arsitektur Kita Sangat Hemat Biaya AI?

1. **File Standar Marketplace (Shopee / TikTok / Tokopedia) = Rp 0 Biaya AI:**
   * File CSV/Excel ratusan ribu baris dari Shopee dan TikTok diproses langsung oleh kode parser deterministik (`SheetJS` / `Polars`) di server. Biaya token AI = **$0**.
2. **AI Hanya Dipanggil untuk 3 Hal Spesifik:**
   * **Chat Asisten AI** (misal: *"bayar iklan Meta 1,5 juta"*, *"berapa laba bulan ini?"*).
   * **Foto Nota / Struk Belanja** (Vision OCR untuk nota bahan baku/kemasan).
   * **Header Mapping Excel Baru/Custom** (hanya mengirim 15 baris pertama Excel ke AI untuk mengenali nama kolom, lalu ribuan baris sisanya diproses oleh kode).

---

## 2. Rincian Biaya Komponen (Per Bulan)

### A. Biaya AI / LLM API (Pay-As-You-Go)
Asumsi pemakaian aktif 1 perusahaan (misal: **1.500 chat transaksi/tanya-jawab + 200 foto nota/file custom per bulan**):

| Provider & Model | Harga Input / 1M Token | Harga Output / 1M Token | Estimasi Biaya / Bulan (1.700 Request) | Karakteristik |
| :--- | :--- | :--- | :--- | :--- |
| **Google Gemini 2.5 Flash** | ~$0.15 | ~$0.60 | **~$0.50 – $1.50 / bln** (Rp 8rb – Rp 25rb) | Sangat cepat, murah, akurat untuk OCR nota & mapping kolom Excel. |
| **Anthropic Claude 3.7 Sonnet** | ~$3.00 | ~$15.00 | **~$5.00 – $12.00 / bln** (Rp 80rb – Rp 190rb) | Sangat pintar untuk penalaran akuntansi kompleks (seperti di video referensi `AI (Claude)`). |
| **OpenAI GPT-4o-mini** | ~$0.15 | ~$0.60 | **~$0.50 – $1.50 / bln** (Rp 8rb – Rp 25rb) | Alternatif ekonomis selain Gemini Flash. |
| **OpenAI GPT-4o** | ~$2.50 | ~$10.00 | **~$4.00 – $10.00 / bln** (Rp 65rb – Rp 160rb) | Kuat di Tool Calling & Vision. |

> [!TIP]
> **Strategi Optimal:** Gunakan **Gemini 2.5 Flash** untuk OCR nota & pemetaan header Excel, dan gunakan **Claude 3.7 Sonnet** untuk pembuatan draft jurnal akuntansi via chat. Total biaya AI gabungan per bulan untuk 1 perusahaan aktif hanya sekitar **$3 – $8 (Rp 50.000 – Rp 130.000/bulan)**.

---

### B. Biaya Integrasi Chat (Telegram & WhatsApp) & Google Drive

| Channel | Opsi Provider | Biaya Bulanan | Keterangan |
| :--- | :--- | :--- | :--- |
| **Telegram Bot** | Official Telegram Bot API | **$0 (Gratis Selamanya)** | Bebas kirim/terima file Excel hingga 50MB, foto nota, dan tombol *Approve* inline. |
| **Google Drive API** | Google Cloud Console | **$0 (Gratis)** | Kuota gratis Google Drive API sangat besar dan lebih dari cukup untuk sinkronisasi file laporan. |
| **WhatsApp (Opsi 1 - Gratis/Self-Hosted)** | **WAHA (WhatsApp HTTP API)** / **Evolution API** | **$0** (Jalan di VPS yang sama) | Menggunakan nomor WA biasa (Scan QR seperti WhatsApp Web). Cocok untuk internal perusahaan / MVP. |
| **WhatsApp (Opsi 2 - Gateway Lokal)** | **Fonnte / Wablas** | **Rp 50.000 – Rp 165.000 / bln** (~$3 – $10) | Praktis, tidak perlu urus container WA sendiri, webhook sangat mudah. |
| **WhatsApp (Opsi 3 - Official Meta)** | **Meta WhatsApp Cloud API** | **Pay-per-conversation** (~Rp 0 untuk 1.000 service chat pertama, lalu ~Rp 350–600/sesi 24 jam) | Resmi centang hijau/bisnis, anti-banned. Jika user yang memulai chat ke bot (Service Conversation), sangat hemat. |

---

### C. Biaya Hosting, Database PostgreSQL & Storage

Terdapat **3 Skenario Infrastruktur** yang bisa dipilih sesuai tahap bisnis:

#### Skenario 1: MVP / Testing / Internal Bootstrap (Biaya Minimalis)
Cocok saat tahap development dan uji coba pertama.
* **Web & API Hosting:** Vercel Hobby / Cloudflare Pages -> **$0**
* **Database PostgreSQL & File Storage:** Supabase Free Tier (500MB DB + 1GB Storage) atau Neon.tech Free Tier -> **$0**
* **Telegram Bot + Google Drive API:** -> **$0**
* **AI API (Gemini Flash / Claude):** Pay-as-you-go -> **~$2 – $5 / bln**
* **Total Skenario 1:** **~$2 – $5 / bulan (Rp 35.000 – Rp 80.000 / bulan)**

#### Skenario 2: Production Single-Company / Dedicated VPS (Paling Direkomendasikan)
Semua komponen (Next.js App, PostgreSQL Database, Redis Queue, dan WAHA WhatsApp Container) dibungkus dengan **Docker Compose** di satu VPS (Hetzner / DigitalOcean / Contabo / IDCloudHost).
* **VPS Server (4 vCPU, 8GB RAM, 80GB NVMe):** **~$8 – $15 / bln** (Rp 130.000 – Rp 240.000)
* **Domain (`.com` / `.id`):** ~$1 / bln (Rp 15.000)
* **Cloudflare R2 (Backup File Excel & Database):** **$0** (Gratis hingga 10GB/bulan)
* **AI API (Claude 3.7 Sonnet + Gemini 2.5 Flash):** **~$5 – $10 / bln** (Rp 80.000 – Rp 160.000)
* **WhatsApp Gateway (WAHA di VPS atau Fonnte):** **$0 – $10 / bln**
* **Total Skenario 2:** **~$14 – $36 / bulan (Rp 225.000 – Rp 575.000 / bulan)**

#### Skenario 3: Multi-Tenant SaaS (Jika Dijual ke Banyak Klien/UMKM)
Jika platform ini Anda komersialkan sebagai SaaS untuk puluhan hingga ratusan toko online:
* **Vercel Pro / Coolify Cluster (2x VPS):** **$20 – $40 / bln**
* **Managed PostgreSQL (Supabase Pro / Neon Scale):** **$25 / bln**
* **AI API (untuk ~50 klien aktif):** **~$50 – $120 / bln** (rata-rata hanya Rp 20.000–Rp 35.000 per klien/bulan, sedangkan harga langganan SaaS ke klien bisa Rp 150.000 – Rp 500.000/bulan -> **Gross Margin SaaS > 85%**).
* **Total Skenario 3:** **~$95 – $185 / bulan (Rp 1,5 Juta – Rp 2,9 Juta / bulan untuk menampung 50+ bisnis)**

---

## 3. Kesimpulan & Rekomendasi Eksekusi

1. **Untuk Memulai Sekarang (Development & MVP):** Kita bisa mulai dengan biaya infrastruktur **$0** (menggunakan PostgreSQL lokal/free tier + Telegram Bot + Google Drive API), dan hanya menyiapkan API Key **Anthropic Claude** atau **Google Gemini** (cukup top-up $5 sudah bisa dipakai ribuan kali testing).
2. **Saat Go-Live Production:** Menggunakan **1 VPS Docker (Skenario 2)** seharga ~Rp 250rb–400rb/bulan sudah sangat kencang untuk menjalankan seluruh Web Dashboard, Database Akuntansi, Background Worker, Telegram Bot, sekaligus WhatsApp Bot.
