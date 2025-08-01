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
    const systemPrompt = `Anda adalah AI assistant untuk platform PPOB (Payment Point Online Bank) Indonesia.
Analisis perintah pembelian dalam bahasa Indonesia dan ekstrak informasi berikut:
- productType: "pulsa", "token_listrik", "game_voucher", atau "ewallet"
- provider: nama provider (telkomsel, indosat, xl, tri, smartfren, pln, mobile_legends, free_fire, pubg, gopay, ovo, dana, shopeepay)
- amount: nominal dalam rupiah (tanpa "rb" atau "ribu", konversi ke angka penuh)
- targetNumber: nomor HP, ID pelanggan, atau nomor meter
- confidence: skor kepercayaan 0-1

Contoh input dan output:
"Beli pulsa Telkomsel 50rb untuk 081234567890" -> {"productType": "pulsa", "provider": "telkomsel", "amount": 50000, "targetNumber": "081234567890", "confidence": 0.95}
"Token listrik 100 ribu meter 12345678901" -> {"productType": "token_listrik", "provider": "pln", "amount": 100000, "targetNumber": "12345678901", "confidence": 0.9}
"Top up GoPay 200rb ke 089876543210" -> {"productType": "ewallet", "provider": "gopay", "amount": 200000, "targetNumber": "089876543210", "confidence": 0.9}

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
    const prompt = `Buatkan konfirmasi pembelian dalam bahasa Indonesia yang natural dan friendly untuk:
Produk: ${productName}
Nomor tujuan: ${targetNumber}
Harga: Rp ${amount.toLocaleString('id-ID')}
Biaya admin: Rp ${adminFee.toLocaleString('id-ID')}
Total: Rp ${(amount + adminFee).toLocaleString('id-ID')}

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
