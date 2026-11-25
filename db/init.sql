-- Bookventory Double-Entry Accounting, Tax & Perpetual Inventory Schema (PostgreSQL 16)
-- Supports Multi-Company (1 Login = Multiple Companies) & Source Channel Categorization

CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_code VARCHAR(8) NOT NULL,
  tax_id_npwp VARCHAR(64) NOT NULL,
  industry VARCHAR(255) NOT NULL,
  default_tax_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stores (
  id VARCHAR(64) PRIMARY KEY,
  company_id VARCHAR(64) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  platform VARCHAR(64) NOT NULL,
  handle VARCHAR(128) NOT NULL,
  wallet_account_code VARCHAR(16) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  code VARCHAR(16) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL,
  normal_balance VARCHAR(16) NOT NULL CHECK (normal_balance IN ('DEBIT', 'CREDIT')),
  source_channel VARCHAR(64),
  opening_balance NUMERIC(18, 2) NOT NULL DEFAULT 0,
  running_mutation NUMERIC(18, 2) NOT NULL DEFAULT 0,
  closing_balance NUMERIC(18, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id VARCHAR(64) PRIMARY KEY,
  company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  entry_date DATE NOT NULL,
  source_type VARCHAR(64) NOT NULL,
  source_channel VARCHAR(64) NOT NULL DEFAULT 'Operasional',
  store_id VARCHAR(64) REFERENCES stores(id),
  status VARCHAR(32) NOT NULL DEFAULT 'MENUNGGU',
  total_amount NUMERIC(18, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS journal_lines (
  id VARCHAR(64) PRIMARY KEY,
  journal_entry_id VARCHAR(64) NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_code VARCHAR(16) NOT NULL REFERENCES accounts(code),
  source_channel VARCHAR(64),
  debit NUMERIC(18, 2) NOT NULL DEFAULT 0,
  credit NUMERIC(18, 2) NOT NULL DEFAULT 0,
  store_tag VARCHAR(128)
);

-- Seed Companies for Multi-Company Switcher
INSERT INTO companies (id, name, short_code, tax_id_npwp, industry, default_tax_rate_percent) VALUES
  ('comp-topherbal', 'PT Topherbal Nusantara', 'TH', '01.884.291.4-012.000', 'Herbal & Kesehatan (TikTok & Shopee)', 0.50),
  ('comp-kopi', 'CV Kopi Roastery Mandiri', 'KR', '02.419.552.1-044.000', 'F&B & Roastery (Shopee, Tokopedia & POS)', 0.50),
  ('comp-fashion', 'PT Maju Apparel Retail', 'MA', '03.911.008.7-061.000', 'Fashion & Apparel (TikTok Shop & Shopee Mall)', 11.00)
ON CONFLICT (id) DO NOTHING;

-- Seed Standard Indonesian E-Commerce Chart of Accounts (COA)
INSERT INTO accounts (code, name, category, normal_balance, source_channel, opening_balance, running_mutation, closing_balance) VALUES
  ('1102', 'BCA PT', 'ASSET_CASH', 'DEBIT', 'Operasional', 199014118, 57329982, 256344100),
  ('1106', 'Saldo Penjual - TikTok Topherbal Official', 'ASSET_CASH', 'DEBIT', 'TikTok', 1840000, 776561, 2616561),
  ('1109', 'Saldo Penjual - Shopee topherbal.id', 'ASSET_CASH', 'DEBIT', 'Shopee', 1210000, 609562, 1819562),
  ('1206', 'Persediaan Barang Jadi', 'ASSET_RECEIVABLE_INVENTORY', 'DEBIT', NULL, 3850000, -1698544, 2151456),
  ('1209', 'Saldo Iklan Dibayar Dimuka', 'ASSET_RECEIVABLE_INVENTORY', 'DEBIT', 'Shopee', 125629, 71232, 196861),
  ('1213', 'Persediaan Bahan Baku', 'ASSET_RECEIVABLE_INVENTORY', 'DEBIT', NULL, 4520000, -3236317, 1283683),
  ('1214', 'Persediaan Kemasan', 'ASSET_RECEIVABLE_INVENTORY', 'DEBIT', NULL, 2150000, -1186978, 963022),
  ('1217', 'Perlengkapan', 'ASSET_RECEIVABLE_INVENTORY', 'DEBIT', NULL, 1155000, 0, 1155000),
  ('1218', 'PPh 22 Dibayar Dimuka', 'ASSET_RECEIVABLE_INVENTORY', 'DEBIT', NULL, 640000, 272185, 912185),
  ('1301', 'Peralatan', 'ASSET_FIXED', 'DEBIT', NULL, 20050000, 0, 20050000),
  ('2112', 'Utang Iklan TikTok (GMV Pay)', 'LIABILITY_SHORT', 'CREDIT', 'TikTok', 2375454, 401136, 2776590),
  ('3101', 'Modal Disetor - Pemegang Saham A', 'EQUITY', 'CREDIT', NULL, 120000000, 0, 120000000),
  ('3102', 'Modal Disetor - Pemegang Saham B', 'EQUITY', 'CREDIT', NULL, 80000000, 0, 80000000),
  ('3104', 'Laba/Rugi Periode Berjalan', 'EQUITY', 'CREDIT', NULL, 34889162, 49826678, 84715840),
  ('4112', 'Penjualan Marketplace', 'REVENUE', 'CREDIT', NULL, 88200000, 95120000, 183320000),
  ('4201', 'Retur Penjualan', 'CONTRA_REVENUE', 'DEBIT', NULL, 1406827, 2342410, 3749237),
  ('5101', 'HPP Barang Jadi', 'COGS', 'DEBIT', NULL, 14025256, 15013838, 29039094),
  ('5203', 'Beban Fee & Promo Marketplace', 'EXPENSE', 'DEBIT', NULL, 9850000, 11374824, 21224824),
  ('5301', 'By Pemasaran META ADS', 'EXPENSE', 'DEBIT', 'Operasional', 4500000, 5450000, 9950000),
  ('5308', 'Beban Iklan Marketplace', 'EXPENSE', 'DEBIT', NULL, 3200000, 3512250, 6712250),
  ('5401', 'By Gaji Karyawan', 'EXPENSE', 'DEBIT', 'Operasional', 7600000, 7600000, 15200000),
  ('5803', 'Pendapatan Lain: Kompensasi Marketplace', 'OTHER_INCOME', 'CREDIT', 'Shopee', 120000, 18032, 138032)
ON CONFLICT (code) DO NOTHING;
