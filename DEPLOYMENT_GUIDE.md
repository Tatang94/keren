# 🚀 Deployment Guide - Platform PPOB

## 📋 Checklist Migrasi Project

### 1. **Persiapan Environment**
```bash
# Clone repository
git clone <your-repo-url>
cd ppob-platform

# Install dependencies
npm install
```

### 2. **Setup API Keys** ⚠️ **PENTING**
Copy API keys dari file backup ke environment:

**Cara 1: Via Environment Variables**
```bash
# Masuk ke Replit Secrets atau environment
DIGIFLAZZ_USERNAME=<dari-backup>
DIGIFLAZZ_API_KEY=<dari-backup>
GEMINI_API_KEY=<dari-backup>
```

**Cara 2: Via .env file**
```bash
# Copy template dan edit
cp .env.example .env
nano .env  # isi dengan nilai dari API_KEYS_BACKUP.md
```

### 3. **Database Setup**
```bash
# Push schema ke database
npm run db:push

# Verifikasi koneksi
npm run db:studio  # (jika tersedia)
```

### 4. **Test API Integrations**
```bash
# Start server
npm run dev

# Test Digiflazz (harus return 1157 produk)
curl http://localhost:5000/api/products

# Test Gemini AI
curl -X POST http://localhost:5000/api/chat/process \
  -H "Content-Type: application/json" \
  -d '{"command": "cek harga pulsa telkomsel"}'
```

### 5. **Deployment ke Production**

**Replit Deployment:**
1. Push code ke repository
2. Import ke Replit
3. Set environment variables di Secrets
4. Run: `npm install && npm run dev`

**Vercel/Netlify:**
1. Connect GitHub repository
2. Set environment variables
3. Build command: `npm run build`
4. Start command: `npm start`

**VPS/Docker:**
```bash
# Install dependencies
npm install

# Build production
npm run build

# Start with PM2
pm2 start "npm run start" --name ppob-platform
```

## 🔧 Troubleshooting

### API Keys Tidak Bekerja:
1. Cek `API_KEYS_BACKUP.md` untuk nilai yang benar
2. Pastikan environment variables ter-set dengan benar
3. Restart server setelah mengubah environment

### Database Error:
```bash
# Reset database schema
npm run db:push --force-reset
```

### Produk Tidak Ditemukan:
- Pastikan DIGIFLAZZ credentials benar
- Cek network connectivity ke digiflazz.com
- Lihat console logs untuk error details

## ✅ Production Checklist

- [ ] API Keys ter-backup di `API_KEYS_BACKUP.md`
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] All 1157 Digiflazz products accessible
- [ ] Gemini AI responding correctly
- [ ] Chat interface functional
- [ ] Transaction flow working end-to-end

## 📞 Support
Jika ada masalah saat migrasi:
1. Cek file `API_KEYS_BACKUP.md` untuk referensi
2. Lihat logs di console untuk debug
3. Pastikan semua dependencies ter-install
4. Verifikasi database connection string

---
*Platform sudah production-ready dengan semua API terintegrasi*