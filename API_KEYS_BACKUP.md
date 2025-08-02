# 🔐 Backup API Keys untuk Platform PPOB

> **PENTING**: File ini berisi backup API keys yang sudah dikonfigurasi.
> Saat migrasi project, copy nilai ini ke environment variables.

## 📋 API Keys yang Diperlukan:

### 1. **Digiflazz API** (Provider PPOB)
```
DIGIFLAZZ_USERNAME: [sudah dikonfigurasi di environment]
DIGIFLAZZ_API_KEY: [sudah dikonfigurasi di environment]
```
- **URL**: https://digiflazz.com
- **Fungsi**: Provider utama untuk semua transaksi PPOB
- **Produk**: 1157 produk (pulsa, token, voucher game, e-wallet)

### 2. **Google Gemini AI** (Natural Language Processing)
```
GEMINI_API_KEY: [sudah dikonfigurasi di environment]
```
- **URL**: https://ai.google.dev
- **Fungsi**: Parsing command dalam bahasa Indonesia
- **Fitur**: Chat interface, analisis produk, rekomendasi

### 3. **Paydisini Payment Gateway** (Optional)
```
PAYDISINI_API_KEY: [akan dikonfigurasi jika diperlukan]
```
- **URL**: https://paydisini.co.id
- **Fungsi**: Payment gateway untuk checkout
- **Fitur**: QRIS, Virtual Account, E-Wallet

## 🚀 Cara Migrasi Project:

1. **Copy Repository**
   ```bash
   git clone <repository-url>
   cd ppob-platform
   ```

2. **Setup Environment Variables**
   ```bash
   # Copy template
   cp .env.example .env
   
   # Edit dengan API keys yang benar
   nano .env
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Setup Database**
   ```bash
   npm run db:push
   ```

5. **Run Application**
   ```bash
   npm run dev
   ```

## ✅ Verifikasi API Keys:

### Test Digiflazz:
```bash
curl -X GET http://localhost:5000/api/products
```

### Test Gemini AI:
```bash
curl -X POST http://localhost:5000/api/chat/process \
  -H "Content-Type: application/json" \
  -d '{"command": "cek harga pulsa telkomsel"}'
```

## 📝 Notes:
- Semua API keys sudah dikonfigurasi dan berfungsi
- Database menggunakan PostgreSQL dari Replit/Neon
- Project siap untuk production deployment
- Dokumentasi lengkap ada di `PANDUAN_PENGGUNAAN.md`

---
*Last updated: August 2, 2025*
*Platform: Replit dengan integrasi Digiflazz + Gemini AI*