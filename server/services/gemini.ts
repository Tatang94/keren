import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "AIzaSyCGNnI10A6xLryJ8LjxJkM_FkA6NLNULlU" });

export interface ParsedOrder {
  intent: string; // "buy", "check_price", "list_products", "check_status"
  productType: string;
  provider?: string;
  amount?: number;
  targetNumber?: string;
  transactionId?: string;
  confidence: number;
}

export async function parseOrderCommand(command: string): Promise<ParsedOrder> {
  try {
    const systemPrompt = `Anda adalah AI assistant khusus untuk platform PPOB Indonesia terintegrasi dengan Digiflazz API.

KATEGORI PRODUK DIGIFLAZZ:
• **Pulsa & Paket Data:** Telkomsel, Indosat, XL, Tri, Smartfren, Axis
• **Token Listrik:** PLN (meteran/token prabayar)
• **Game Voucher:** Mobile Legends, Free Fire, PUBG Mobile, Valorant, Steam
• **E-Wallet:** GoPay, OVO, DANA, ShopeePay, LinkAja
• **TV Streaming:** Netflix, Disney+, Vidio, iQiyi

PERINTAH YANG DIDUKUNG:
1. **CEK HARGA:** "Cek harga [produk] [provider]" atau "Harga [produk]"
2. **LIST PRODUK:** "List [kategori]" atau "Produk [kategori] tersedia"
3. **BELI/TRANSAKSI:** "Beli [produk] [nominal] untuk [nomor/ID]"
4. **CEK STATUS:** "Status transaksi [ID]" atau "Cek pembayaran [ID]"

KONVERSI NOMINAL:
- "5rb" / "lima ribu" = 5000
- "10rb" / "sepuluh ribu" = 10000  
- "25rb" / "dua puluh lima ribu" = 25000
- "50rb" / "lima puluh ribu" = 50000
- "100rb" / "seratus ribu" = 100000

PROVIDER YANG DIKENALI:
- Pulsa: telkomsel, indosat, xl, tri, smartfren, axis
- PLN: pln
- Game: mobile_legends, free_fire, pubg, valorant, steam
- E-Wallet: gopay, ovo, dana, shopeepay, linkaja

EKSTRAKSI DATA:
- intent: "buy", "check_price", "list_products", "check_status"
- productType: "pulsa", "token_listrik", "game_voucher", "ewallet", "tv_streaming"
- provider: nama provider yang dikenali
- amount: nominal dalam rupiah (angka penuh)
- targetNumber: nomor HP/meter/ID game (untuk intent "buy")
- transactionId: ID transaksi (untuk intent "check_status")
- confidence: 0.8-1.0 untuk valid, 0.0 untuk non-PPOB

CONTOH:
"Cek harga pulsa Telkomsel" -> {"intent": "check_price", "productType": "pulsa", "provider": "telkomsel", "confidence": 0.95}
"Beli pulsa Telkomsel 50rb untuk 081234567890" -> {"intent": "buy", "productType": "pulsa", "provider": "telkomsel", "amount": 50000, "targetNumber": "081234567890", "confidence": 0.95}
"Token PLN 100rb meter 12345678901" -> {"intent": "buy", "productType": "token_listrik", "provider": "pln", "amount": 100000, "targetNumber": "12345678901", "confidence": 0.95}
"Diamond ML 172 untuk 081234567890" -> {"intent": "buy", "productType": "game_voucher", "provider": "mobile_legends", "amount": 172, "targetNumber": "081234567890", "confidence": 0.9}

Respond dengan JSON valid saja.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            intent: { type: "string" },
            productType: { type: "string" },
            provider: { type: "string" },
            amount: { type: "number" },
            targetNumber: { type: "string" },
            transactionId: { type: "string" },
            confidence: { type: "number" },
          },
          required: ["intent", "confidence"],
        },
      },
      contents: command,
    });

    const rawJson = response.text;
    if (rawJson) {
      const parsed: ParsedOrder = JSON.parse(rawJson);
      return parsed;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    throw new Error(`Failed to parse order command: ${error}`);
  }
}

export async function generateOrderConfirmation(
  productName: string,
  targetNumber: string,
  amount: number,
  adminFee: number
): Promise<string> {
  try {
    const prompt = `Buatkan konfirmasi pembelian yang singkat dan profesional dalam bahasa Indonesia untuk:

Produk: ${productName}
Nomor tujuan: ${targetNumber}
Harga: Rp ${amount.toLocaleString('id-ID')}
Biaya admin: Rp ${adminFee.toLocaleString('id-ID')}
Total: Rp ${(amount + adminFee).toLocaleString('id-ID')}

Format yang diinginkan:
"Konfirmasi pembelian Anda:
Anda akan [action] [produk] ke [nomor].
Detail: Rp [harga] + admin Rp [admin].
Total: Rp [total]. Lanjutkan pembayaran?"

Buatlah respons singkat dan mudah dipahami.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Konfirmasi pembelian tidak dapat dibuat";
  } catch (error) {
    return `Baik! Saya akan memproses pembelian ${productName} untuk ${targetNumber}. Total pembayaran Rp ${(amount + adminFee).toLocaleString('id-ID')}. Lanjutkan ke pembayaran?`;
  }
}

export async function generateErrorMessage(error: string): Promise<string> {
  try {
    const prompt = `Buatkan pesan error yang ramah dalam bahasa Indonesia untuk masalah berikut: ${error}
Berikan saran atau alternatif jika memungkinkan. Gunakan bahasa yang sopan dan helpful.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || `Maaf, terjadi masalah: ${error}`;
  } catch (aiError) {
    return `Maaf, terjadi masalah: ${error}. Silakan coba lagi atau hubungi customer service.`;
  }
}

// Fungsi baru untuk menganalisis produk Digiflazz dengan AI
export async function analyzeDigiflazzProducts(products: any[], userQuery: string): Promise<string> {
  try {
    const systemPrompt = `Anda adalah AI assistant untuk platform PPOB yang menganalisis produk Digiflazz.

TUGAS: Analisis produk yang tersedia dan berikan rekomendasi berdasarkan query user.

FORMAT RESPONSE:
- Gunakan emoji yang sesuai (📱💰⚡🎮)
- Tampilkan max 5-8 produk terbaik
- Urutkan berdasarkan popularitas/harga
- Sertakan harga, biaya admin, dan total
- Berikan tips memilih produk
- Bahasa Indonesia yang ramah

CONTOH FORMAT:
📱 **PULSA TELKOMSEL TERSEDIA:**

💰 **Rp 5.000** (+ admin Rp 750 = **Rp 5.750**)
   Pulsa Telkomsel 5K - Cocok untuk emergency

💰 **Rp 10.000** (+ admin Rp 1.000 = **Rp 11.000**)
   Pulsa Telkomsel 10K - Paling populer

💡 **Tips:** Nominal 10K dan 25K paling sering dibeli customer.`;

    const productsData = products.slice(0, 20).map(p => ({
      name: p.product_name || p.name,
      category: p.category,
      brand: p.brand || p.provider,
      price: p.price,
      status: p.status
    }));

    const prompt = `Query user: "${userQuery}"

Produk tersedia:
${JSON.stringify(productsData, null, 2)}

Analisis dan berikan rekomendasi terbaik untuk user.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: prompt,
    });

    return response.text || "Tidak dapat menganalisis produk saat ini.";
  } catch (error) {
    console.error('Failed to analyze Digiflazz products:', error);
    return "Gagal menganalisis produk. Silakan coba lagi.";
  }
}

// Fungsi untuk memberikan saran transaksi berbasis AI
export async function generateTransactionAdvice(
  productType: string, 
  provider: string, 
  amount: number,
  availableProducts: any[]
): Promise<string> {
  try {
    const systemPrompt = `Anda adalah AI advisor untuk transaksi PPOB yang memberikan saran cerdas.

TUGAS: Berikan saran terbaik untuk transaksi berdasarkan data produk yang tersedia.

FORMAT RESPONSE:
- Konfirmasi produk yang diminta
- Alternatif jika tidak tersedia
- Perbandingan harga dengan provider lain
- Tips hemat atau promo yang mungkin ada
- Warning jika ada yang perlu diperhatikan
- Bahasa Indonesia yang informatif

CONTOH:
✅ **KONFIRMASI PEMBELIAN**

🎯 **Produk:** Pulsa Telkomsel 50K
💰 **Harga:** Rp 50.000 + admin Rp 1.500 = **Rp 51.500**

📊 **PERBANDINGAN:**
• Indosat 50K: Rp 50.500 (hemat Rp 1.000)
• XL 50K: Rp 50.500 (hemat Rp 1.000)

💡 **SARAN:** Pertimbangkan Indosat/XL untuk hemat, atau lanjut Telkomsel jika preferensi jaringan.`;

    const productsData = availableProducts.map(p => ({
      name: p.product_name || p.name,
      category: p.category,
      brand: p.brand || p.provider,
      price: p.price,
      adminFee: p.adminFee || 0
    }));

    const prompt = `User ingin: ${productType} ${provider} ${amount}

Produk tersedia:
${JSON.stringify(productsData, null, 2)}

Berikan saran transaksi terbaik.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: prompt,
    });

    return response.text || "Tidak dapat memberikan saran transaksi saat ini.";
  } catch (error) {
    console.error('Failed to generate transaction advice:', error);
    return "Gagal memberikan saran transaksi. Silakan coba lagi.";
  }
}

// Generate completion notification message
export async function generateCompletionNotification(
  productName: string,
  targetNumber: string,
  totalAmount: number,
  serialNumber?: string
): Promise<string> {
  const prompt = `
Buat pesan notifikasi completion transaksi PPOB yang ramah dan informatif dalam bahasa Indonesia untuk:
- Produk: ${productName}
- Nomor tujuan: ${targetNumber}
- Total pembayaran: Rp ${totalAmount.toLocaleString('id-ID')}
- Serial Number/SN: ${serialNumber || 'Tidak tersedia'}

Format pesan harus:
1. Menggunakan emoji yang sesuai (✅ untuk sukses, 📱 untuk produk, dll)
2. Mengucapkan selamat/terima kasih
3. Menyebutkan detail transaksi
4. Jika ada SN, tampilkan dengan jelas
5. Ramah dan profesional dalam bahasa Indonesia
6. Maksimal 200 kata

Contoh format yang diinginkan:
"✅ **TRANSAKSI BERHASIL!**

Selamat! Pembelian Anda telah berhasil diproses.
📱 **Produk:** [nama produk]
🎯 **Tujuan:** [nomor]
💰 **Total:** Rp [jumlah]
📋 **SN:** [serial number jika ada]

Terima kasih telah menggunakan layanan kami!"
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });
    
    return response.text || `✅ **TRANSAKSI BERHASIL!**\n\nPembelian ${productName} untuk ${targetNumber} sebesar Rp ${totalAmount.toLocaleString('id-ID')} telah berhasil diproses.\n\n${serialNumber ? `📋 **SN:** ${serialNumber}\n\n` : ''}Terima kasih telah menggunakan layanan kami!`;
  } catch (error) {
    console.error('Error generating completion notification:', error);
    return `✅ **TRANSAKSI BERHASIL!**\n\nPembelian ${productName} untuk ${targetNumber} sebesar Rp ${totalAmount.toLocaleString('id-ID')} telah berhasil diproses.\n\n${serialNumber ? `📋 **SN:** ${serialNumber}\n\n` : ''}Terima kasih telah menggunakan layanan kami!`;
  }
}
