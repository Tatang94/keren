# 📱 Panduan Lengkap Sistem PPOB dengan AI Chatbot

## 🚀 Cara Menggunakan Sistem

### 1. **Cek Harga Produk**
Anda bisa menanyakan harga dengan bahasa natural Indonesia:

```
"cek harga pulsa telkomsel"
"harga token listrik 50rb"
"berapa harga voucher mobile legends"
"cek tarif pulsa xl"
```

### 2. **Membeli Produk**
Format pembelian dengan menyebutkan:
- Jenis produk (pulsa/token/voucher)
- Provider (telkomsel/indosat/xl/tri/pln/dll)
- Nominal
- Nomor tujuan

```
"beli pulsa telkomsel 10rb untuk 08123456789"
"beli token pln 50rb untuk 12345678901"
"beli voucher ml 86 diamond untuk 123456789"
"isi pulsa indosat 25rb ke 08567891234"
```

### 3. **Cek Status Transaksi**
```
"status transaksi TXN123456"
"cek transaksi untuk nomor 08123456789"
"gimana transaksi saya yang tadi"
```

## 🎯 Flow Transaksi Lengkap

```
1. 🤖 Chat dengan AI → "beli pulsa telkomsel 10rb untuk 08123456789"
2. 🔍 AI mencari produk di database Digiflazz (1157 produk)
3. ✅ Konfirmasi pembelian dengan detail harga
4. 💳 Sistem buat link pembayaran Paydisini
5. 💰 User bayar via QRIS/Virtual Account/E-Wallet
6. 🔔 Webhook otomatis kirim notifikasi ke sistem
7. 🚀 Sistem proses transaksi ke Digiflazz
8. ✅ AI kirim notifikasi completion dengan serial number
```

## 🏪 Produk Tersedia

### **Pulsa & Paket Data:**
- Telkomsel: 2K, 5K, 10K, 15K, 20K, 25K, 50K, 100K
- Indosat: 5K, 10K, 15K, 20K, 25K, 50K, 100K
- XL: 5K, 10K, 15K, 20K, 25K, 50K, 100K
- Tri: 5K, 10K, 15K, 20K, 25K, 50K
- Smartfren: 5K, 10K, 20K, 25K, 50K

### **Token Listrik PLN:**
- 20K, 50K, 100K, 200K, 500K

### **Game Vouchers:**
- Mobile Legends: 86, 172, 257, 344 Diamond
- Free Fire: 70, 140, 210, 355 Diamond
- PUBG Mobile: 60, 125, 250, 525 UC
- Genshin Impact: Welkin, Battle Pass

### **E-Wallet Top Up:**
- GoPay: 20K, 50K, 100K, 200K
- OVO: 20K, 50K, 100K, 200K
- DANA: 20K, 50K, 100K, 200K
- ShopeePay: 20K, 50K, 100K

## 💡 Tips Penggunaan

### **Format Yang Benar:**
```
✅ "beli pulsa telkomsel 10rb untuk 08123456789"
✅ "isi pulsa 25k tri ke 08567891234"
✅ "beli token pln 50ribu untuk 12345678901"
```

### **Format Yang Salah:**
```
❌ "beli pulsa" (tidak lengkap)
❌ "pulsa telkomsel 08123456789" (tidak ada nominal)
❌ "10rb telkomsel" (tidak ada nomor tujuan)
```

## 🔧 Troubleshooting

### **Produk Tidak Ditemukan:**
- Coba gunakan nominal yang tersedia (5K, 10K, 15K, 20K, 25K, 50K, 100K)
- Pastikan nama provider benar (telkomsel, bukan tsel)
- Gunakan format nomor yang benar (08xxx atau 62xxx)

### **Pesan Error:**
- "Produk tidak ditemukan" → Cek kembali nominal dan provider
- "Nomor tidak valid" → Pastikan format nomor benar
- "Transaksi gagal" → Hubungi admin untuk bantuan

## 📞 Support

Jika mengalami masalah:
1. Coba ulang dengan format yang benar
2. Pastikan nominal sesuai dengan yang tersedia
3. Hubungi admin jika masih bermasalah

---

*Sistem ini menggunakan AI Gemini untuk memahami bahasa Indonesia natural dan terintegrasi dengan Digiflazz untuk produk PPOB real-time.*