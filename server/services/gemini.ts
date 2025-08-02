import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
    const systemPrompt = `Anda adalah AI assistant khusus untuk platform PPOB (Payment Point Online Bank) Indonesia yang terintegrasi dengan Digiflazz.

PERINTAH YANG DIDUKUNG:
1. **CEK HARGA/LIST PRODUK:**
   - "Cek harga pulsa Telkomsel"
   - "Harga token PLN" 
   - "List voucher Mobile Legends"
   - "Produk tersedia kategori pulsa"

2. **TRANSAKSI/PEMBELIAN:**
   - "Beli pulsa Telkomsel 50rb untuk 081234567890"
   - "Token listrik PLN 100rb meter 12345678901"
   - "Voucher ML 172 diamond untuk 081234567890"

3. **CEK STATUS:**
   - "Status transaksi [ID]"
   - "Cek pembayaran [ID]"

Jika pertanyaan BUKAN tentang PPOB, return dengan confidence: 0.

Analisis perintah dan ekstrak:
- intent: "buy" (beli/transaksi), "check_price" (cek harga), "list_products" (list produk), "check_status" (cek status)
- productType: "pulsa", "token_listrik", "game_voucher", "ewallet", "tv_streaming"
- provider: nama provider (telkomsel, indosat, xl, tri, smartfren, axis, pln, mobile_legends, free_fire, dll)
- amount: nominal dalam rupiah (konversi: "50rb"/"lima puluh ribu" = 50000)
- targetNumber: nomor HP/meter/ID (hanya untuk intent "buy")
- transactionId: ID transaksi (hanya untuk intent "check_status")
- confidence: 0.8-1.0 untuk perintah valid

Contoh:
"Cek harga pulsa Telkomsel" -> {"intent": "check_price", "productType": "pulsa", "provider": "telkomsel", "confidence": 0.95}
"Beli pulsa Telkomsel 50rb untuk 081234567890" -> {"intent": "buy", "productType": "pulsa", "provider": "telkomsel", "amount": 50000, "targetNumber": "081234567890", "confidence": 0.95}
"List produk game voucher" -> {"intent": "list_products", "productType": "game_voucher", "confidence": 0.9}

Respond hanya dengan JSON yang valid.`;

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

PENTING: 
- Gunakan kata perintah yang konsisten dengan contoh: "Beli pulsa", "Token listrik PLN", "Top up", "Voucher"
- Respons maksimal 3-4 baris saja
- Format: konfirmasi singkat + detail + total + instruksi lanjut
- Jangan gunakan emoji atau variasi berlebihan

Buatlah konfirmasi yang ramah dan jelas, minta konfirmasi untuk melanjutkan pembayaran.`;

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
