import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ParsedOrder {
  productType: string;
  provider?: string;
  amount?: number;
  targetNumber: string;
  confidence: number;
}

export async function parseOrderCommand(command: string): Promise<ParsedOrder> {
  try {
    const systemPrompt = `Anda adalah AI assistant khusus untuk platform PPOB (Payment Point Online Bank) Indonesia.

PENTING: Hanya proses perintah yang berkaitan dengan pembelian produk digital seperti:
- Pulsa (Telkomsel, Indosat, XL, Tri, Smartfren, Axis, by.U)
- Token listrik PLN 
- Game voucher (Mobile Legends, Free Fire, PUBG, Call of Duty)
- E-wallet top up (GoPay, OVO, DANA, Grab)

KHUSUS UNTUK INPUT SUARA: 
- Perintah mungkin tidak sempurna karena voice recognition
- Toleransi ejaan yang mirip (contoh: "lima puluh ribu" = "50000", "telkomsel" bisa jadi "telkom sel")
- Cari makna dari konteks meski ada kesalahan ejaan

Jika pertanyaan BUKAN tentang pembelian produk digital PPOB, return dengan confidence: 0.

Analisis perintah pembelian dan ekstrak:
- productType: "pulsa", "token_listrik", "game_voucher", "ewallet", atau "tv_streaming"
- provider: nama provider (normalisasi nama brand yang mirip)
- amount: nominal dalam rupiah (konversi semua format: "50rb", "lima puluh ribu", "50000", "50 ribu")
- targetNumber: nomor HP/ID pelanggan/nomor meter (bersihkan dari spasi atau karakter aneh)
- confidence: 0.7-1.0 untuk perintah PPOB yang valid (lebih toleran untuk voice input)

Contoh input suara:
"beli pulsa telkom sel lima puluh ribu untuk nol delapan satu dua tiga empat lima enam tujuh delapan sembilan nol" -> {"productType": "pulsa", "provider": "telkomsel", "amount": 50000, "targetNumber": "081234567890", "confidence": 0.9}
"token listrik PLN seratus ribu meter satu dua tiga empat lima enam tujuh delapan sembilan nol satu" -> {"productType": "token_listrik", "provider": "pln", "amount": 100000, "targetNumber": "12345678901", "confidence": 0.9}

Respond hanya dengan JSON yang valid.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            productType: { type: "string" },
            provider: { type: "string" },
            amount: { type: "number" },
            targetNumber: { type: "string" },
            confidence: { type: "number" },
          },
          required: ["productType", "targetNumber", "confidence"],
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
