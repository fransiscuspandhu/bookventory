# 4. Panduan Instalasi & Konfigurasi VPS (Bookventory + OpenClaw / Hermes + Gemini)

Dokumen ini berisi panduan langkah demi langkah (*step-by-step installation guide*) untuk men-deploy **Bookventory Web App**, **PostgreSQL Database**, serta **OpenClaw** atau **Hermes Agent** (WhatsApp & Telegram Gateway dengan model **Google Gemini Pro/Flash**) di VPS Anda sendiri.

---

## Arsitektur Deployment di VPS Anda

Seluruh layanan berjalan di dalam 1 VPS yang sama sehingga komunikasi antar-layanan sangat cepat (`localhost` / internal Docker network) dan **Rp 0 biaya tambahan**:

```mermaid
flowchart LR
    subgraph External ["User Channels"]
        WA["WhatsApp (Personal / Bot Number)"]
        TG["Telegram Bot"]
        Browser["Browser (HP / Laptop)"]
        GDrive["Google Drive Folder"]
    end

    subgraph VPS ["VPS Anda (Ubuntu 22.04 / 24.04)"]
        ReverseProxy["Nginx / Caddy (Auto HTTPS)"]
        WebApp["Bookventory App\n(Next.js :3000)"]
        DB[("PostgreSQL 16\n(:5432)")]
        Agent["OpenClaw / Hermes Agent\n(Gemini Pro + WA/TG Bridge)"]
    end

    Browser --> ReverseProxy --> WebApp
    WebApp --> DB
    GDrive --> WebApp
    WA <--> Agent
    TG <--> Agent
    Agent -- "Bookventory Skill / REST API\n(http://localhost:3000/api/agent)" --> WebApp
```

---

## Tahap 1: Persiapan Awal VPS (Prerequisites)

Pastikan VPS Anda menggunakan **Ubuntu 22.04 atau 24.04 LTS** (minimal 2 vCPU, 4GB RAM direkomendasikan agar WhatsApp bridge + Next.js + Postgres berjalan lega).

### 1.1. Install Docker, Docker Compose, Node.js 22 & Python 3.12
Jalankan perintah berikut di terminal SSH VPS Anda:

```bash
# 1. Update package & install dependencies dasar
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl git unzip build-essential ca-certificates gnupg

# 2. Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# 3. Install Node.js 22 LTS & pnpm (Dibutuhkan oleh Bookventory & OpenClaw)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo corepack enable
corepack prepare pnpm@latest --activate
```

---

## Tahap 2: Setup Database & Aplikasi Bookventory (`docker-compose.yml`)

### 2.1. Clone Repository Bookventory
```bash
git clone https://github.com/fransiscuspandhu/bookventory.git
cd bookventory
```

### 2.2. Buat File `.env`
Buat file `.env` di root folder `bookventory`:

```env
# Database PostgreSQL
DATABASE_URL="postgresql://bookventory:password_rahasia_anda@localhost:5432/bookventory_db?schema=public"

# Security & Internal Agent Token (Dipakai oleh OpenClaw / Hermes untuk panggil API Bookventory)
APP_URL="https://pembukuan.domainanda.com"
AGENT_API_SECRET="bv_secret_token_untuk_openclaw_hermes_12345"

# Google Gemini API / OAuth (Untuk AI Fallback Parser & In-App Assistant)
GEMINI_API_KEY="AIzaSy..."
GEMINI_MODEL="gemini-2.5-pro"

# Google Drive Sync (Opsional - Folder ID tempat menaruh file Excel laporan)
GOOGLE_DRIVE_WATCH_FOLDER_ID=""
```

### 2.3. Jalankan PostgreSQL & Bookventory via Docker Compose
File `docker-compose.yml` yang akan kita siapkan di repo:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: bookventory-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: bookventory
      POSTGRES_PASSWORD: password_rahasia_anda
      POSTGRES_DB: bookventory_db
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  web:
    build: .
    container_name: bookventory-web
    restart: unless-stopped
    env_file: .env
    ports:
      - "127.0.0.1:3000:3000"
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads

volumes:
  pgdata:
```

Jalankan database dan migrasi skema awal (termasuk seeding Chart of Accounts standar):
```bash
docker compose up -d postgres
pnpm install
pnpm db:push
pnpm db:seed   # Mengisi COA: 1102 BCA, 1206 Persediaan, 1218 PPh 22, 4112 Penjualan, 5101 HPP, dll
pnpm build && pnpm start
```

---

## Tahap 3: Setup Integrasi Chat & Gemini Pro (Pilih OpenClaw ATAU Hermes Agent)

Anda dapat memilih **Opsi A (OpenClaw)** atau **Opsi B (Hermes Agent)**. Keduanya sama-sama open-source, gratis, mendukung **WhatsApp (QR Scan)**, **Telegram (Bot Token)**, dan **Google Gemini Pro/Flash**.

---

### Opsi A: Instalasi & Konfigurasi OpenClaw (`openclaw`)

**OpenClaw** berbasis TypeScript/Node.js (sama dengan stack Next.js kita) dan menggunakan `grammY` untuk Telegram serta `Baileys` untuk WhatsApp.

#### Langkah A.1: Install OpenClaw & Login Gemini
```bash
# Install OpenClaw CLI secara global atau clone dari repo
npm install -g openclaw
# Jalankan wizard onboarding
openclaw onboard
```
Saat wizard `openclaw onboard` menanyakan **Model Provider**:
* Pilih **Google Gemini** (`google` / `gemini-cli-oauth` atau masukkan `GEMINI_API_KEY`).
* Pilih model default: `gemini-2.5-pro` (atau `gemini-2.5-flash` untuk respons super cepat).

#### Langkah A.2: Hubungkan Telegram Bot ke OpenClaw
1. Buka Telegram, chat ke `@BotFather`, ketik `/newbot`, dan salin **Bot Token** Anda.
2. Daftarkan ke OpenClaw:
```bash
openclaw channels add --channel telegram --token "<TELEGRAM_BOT_TOKEN_ANDA>"
```

#### Langkah A.3: Hubungkan WhatsApp ke OpenClaw (Scan QR)
1. Install plugin WhatsApp OpenClaw dan batasi hanya nomor HP Anda/tim keuangan yang boleh mengakses bot (`allowlist`):
```bash
openclaw plugins install @openclaw/whatsapp
openclaw channels login --channel whatsapp
```
2. Terminal akan menampilkan **QR Code**. Buka aplikasi WhatsApp di HP -> **Perangkat Tertaut (Linked Devices)** -> **Tautkan Perangkat** -> Scan QR tersebut.

#### Langkah A.4: Pasang Custom Skill `bookventory` di OpenClaw
Kita akan menaruh folder skill di `~/.openclaw/skills/bookventory/SKILL.md` zodat OpenClaw tahu cara meneruskan file Excel, foto nota, dan perintah chat ke Bookventory:
```bash
# Copy skill bookventory yang sudah kita sediakan di repo ke folder OpenClaw
mkdir -p ~/.openclaw/skills/
cp -r ./integrations/openclaw-skill ~/.openclaw/skills/bookventory

# Jalankan OpenClaw Gateway di background (systemd / pm2)
openclaw gateway
```

---

### Opsi B: Instalasi & Konfigurasi Hermes Agent (`NousResearch/hermes-agent`)

Jika Anda lebih menyukai ekosistem Python dari Nous Research, **Hermes Agent** sangat ringan dan memiliki fitur `hermes gateway` bawaan.

#### Langkah B.1: Install Hermes Agent
```bash
git clone https://github.com/NousResearch/hermes-agent.git ~/hermes-agent
cd ~/hermes-agent
pip install -e .
```

#### Langkah B.2: Setup Model Gemini Pro & Messaging Gateway
```bash
# Konfigurasi provider model ke Gemini
hermes config set model gemini/gemini-2.5-pro
hermes config set GEMINI_API_KEY "AIzaSy..."

# Jalankan setup wizard untuk Telegram & WhatsApp
hermes gateway setup
```
1. **Untuk Telegram:** Pilih `Telegram`, masukkan token dari `@BotFather`, dan masukkan Telegram User ID Anda ke dalam `allowlist`.
2. **Untuk WhatsApp:** Pilih `WhatsApp (Baileys Bridge)` atau jalankan:
   ```bash
   hermes whatsapp
   ```
   Scan QR Code yang muncul di terminal menggunakan WhatsApp di HP Anda.

#### Langkah B.3: Pasang Bookventory Skill di Hermes Agent
```bash
# Copy skill bookventory ke direktori skills Hermes
cp -r /path/to/bookventory/integrations/hermes-skill ~/.hermes/skills/bookventory

# Jalankan Hermes Gateway sebagai service
hermes gateway start
```

---

## Tahap 4: Alur Kerja Setelah Terinstal (End-to-End Flow)

Begitu **Bookventory + OpenClaw/Hermes** aktif di VPS Anda, berikut cara penggunaannya sehari-hari:

1. **Upload Laporan Penjualan via Chat (WA / Telegram):**
   * Anda kirim file `Income.sudah_dilepas.Shopee.xlsx` atau `All_order_TikTok.csv` ke chat WhatsApp/Telegram.
   * OpenClaw/Hermes menerima file tersebut dan memanggil endpoint internal Bookventory (`POST http://localhost:3000/api/agent/import`).
   * Bookventory mem-parsing file, menghitung Omzet, Fee Marketplace, **PPh 22 Dibayar Dimuka (`1218`)**, serta **HPP (`5101`)**, lalu membuat **Draft Jurnal**.
   * Bot membalas di WA/Telegram:
     > *"✅ File `Income.sudah_dilepas.Shopee.xlsx` berhasil dianalisis (14 order, periode 19-24 Nov). Terbentuk 2 Draft Jurnal Settlement (Total Cair: Rp 1.120.229, HPP: Rp 209.361, PPh 22: Rp 6.437). Ketik **'Setujui semua'** atau tinjau di Web Dashboard."*

2. **Catat Biaya Operasional / Iklan via Chat:**
   * Anda chat di WA/Telegram: *"Bayar iklan Meta 1.500.000 dari BCA"* atau kirim foto nota pembelian kardus kemasan.
   * Gemini Pro di OpenClaw/Hermes mengekstrak transaksi tersebut dan memanggil `POST http://localhost:3000/api/agent/draft-journal`.
   * Bot membalas:
     > *"Siap! Draft jurnal telah dibuat: **Debit 5301 - Pemasaran Meta Ads Rp 1.500.000 / Kredit 1102 - BCA PT Rp 1.500.000**. Ketik **'Setujui'** untuk membukukan ke Neraca."*

3. **Tanya Laporan Keuangan, HPP & Pajak via Chat:**
   * Anda chat: *"Berapa laba bersih, total HPP, dan kredit pajak PPh 22 bulan ini?"*
   * OpenClaw/Hermes memanggil `GET http://localhost:3000/api/agent/reports/summary?period=2026-11`.
   * Bot langsung membalas angka presisi dari database PostgreSQL (Neraca, Laba Rugi, ROAS/ACOS per toko, dan Peringatan Stok Gudang yang kritis).
