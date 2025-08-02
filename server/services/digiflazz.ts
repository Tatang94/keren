import { Product } from "@shared/schema";

interface DigiflazzProduct {
  buyer_sku_code: string;
  product_name: string;
  category: string;
  brand: string;
  type: string;
  price: number;
  status: string;
}

interface DigiflazzTransactionRequest {
  commands: string;
  username: string;
  buyer_sku_code: string;
  customer_no: string;
  ref_id: string;
  sign: string;
}

interface DigiflazzTransactionResponse {
  data: {
    ref_id: string;
    status: string;
    customer_no: string;
    buyer_sku_code: string;
    message: string;
    balance: number;
    elapsed_time: number;
    sn?: string;
  };
}

export class DigiflazzService {
  private username: string;
  private apiKey: string;
  private baseUrl: string = "https://api.digiflazz.com/v1";

  constructor() {
    this.username = process.env.DIGIFLAZZ_USERNAME || "";
    this.apiKey = process.env.DIGIFLAZZ_API_KEY || "";
  }

  private async generateSign(refId: string, customerNo?: string, buyerSkuCode?: string): Promise<string> {
    const crypto = await import('crypto');
    // Sesuai dokumentasi Digiflazz: sign = md5(username + apikey + refId)
    const data = this.username + this.apiKey + refId;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  async getProducts(): Promise<DigiflazzProduct[]> {
    try {
      // Sesuai dokumentasi Digiflazz API
      const refId = "pricelist" + Date.now(); // Ref ID unik
      const sign = await this.generateSign(refId);
      
      const payload = {
        cmd: "prepaid", // Command untuk produk prepaid
        username: this.username,
        sign: sign
      };

      console.log('Requesting Digiflazz products with payload:', payload);

      const response = await fetch(`${this.baseUrl}/price-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Digiflazz API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('Digiflazz API Response status:', data);
      
      // Periksa struktur response sesuai dokumentasi
      if (data.data && Array.isArray(data.data)) {
        console.log(`✅ Digiflazz berhasil mengembalikan ${data.data.length} produk`);
        
        // Log sample produk untuk debug
        if (data.data.length > 0) {
          console.log('📦 Contoh produk:', JSON.stringify(data.data[0], null, 2));
        }
        
        // Filter produk yang aktif saja
        const activeProducts = data.data.filter((product: DigiflazzProduct) => 
          product.status === 'available' || product.status === 'normal'
        );
        
        console.log(`📊 Produk aktif: ${activeProducts.length}/${data.data.length}`);
        return activeProducts;
      } else {
        console.log('❌ Response tidak sesuai format:', data);
        return [];
      }
    } catch (error) {
      console.error('❌ Error mengambil produk Digiflazz:', error);
      return [];
    }
  }

  async findProduct(productType: string, provider: string, amount: number): Promise<string | null> {
    try {
      // Ambil semua produk dari Digiflazz
      const products = await this.getProducts();
      
      // Map kategori internal ke kategori Digiflazz
      const categoryMap: Record<string, string[]> = {
        'pulsa': ['Pulsa', 'Paket Data'],
        'token_listrik': ['PLN', 'Token Listrik'],
        'game_voucher': ['Games', 'Voucher Game'],
        'ewallet': ['E-Money', 'E-Wallet'],
        'tv_streaming': ['TV', 'Streaming']
      };

      const allowedCategories = categoryMap[productType];
      if (!allowedCategories) {
        console.log(`❌ Kategori produk tidak dikenali: ${productType}`);
        return null;
      }

      // Filter produk berdasarkan kategori, brand, dan nominal
      const matchingProducts = products.filter(product => {
        const categoryMatch = allowedCategories.some(cat => 
          product.category.toLowerCase().includes(cat.toLowerCase())
        );
        const brandMatch = product.brand.toLowerCase().includes(provider.toLowerCase());
        
        // Untuk pulsa dan token listrik, cocokkan nominal dari nama produk
        const nameMatch = product.product_name.toLowerCase().includes(amount.toString()) ||
                         product.product_name.toLowerCase().includes((amount/1000).toString() + 'k') ||
                         product.product_name.toLowerCase().includes((amount/1000).toString() + '.000');
        
        return categoryMatch && brandMatch && nameMatch;
      });

      if (matchingProducts.length > 0) {
        console.log(`✅ Ditemukan ${matchingProducts.length} produk matching:`, 
          matchingProducts.map(p => p.product_name).join(', '));
        
        // Pilih produk dengan harga paling dekat
        const closestProduct = matchingProducts.reduce((prev, curr) => {
          const prevDiff = Math.abs(prev.price - amount);
          const currDiff = Math.abs(curr.price - amount);
          return currDiff < prevDiff ? curr : prev;
        });
        
        console.log(`🎯 Produk terpilih: ${closestProduct.product_name} (${closestProduct.buyer_sku_code})`);
        return closestProduct.buyer_sku_code;
      }

      console.log(`❌ Tidak ditemukan produk: ${productType} ${provider} ${amount}`);
      return null;
    } catch (error) {
      console.error('❌ Error mencari produk Digiflazz:', error);
      return null;
    }
  }

  async createTransaction(
    buyerSkuCode: string,
    customerNo: string,
    refId: string
  ): Promise<DigiflazzTransactionResponse> {
    try {
      // Sesuai dokumentasi: sign = md5(username + apikey + refId)
      const sign = await this.generateSign(refId);
      
      const payload: DigiflazzTransactionRequest = {
        commands: "inq-pasca", // Command untuk inquiry transaksi
        username: this.username,
        buyer_sku_code: buyerSkuCode,
        customer_no: customerNo,
        ref_id: refId,
        sign: sign
      };

      console.log('🔄 Membuat transaksi Digiflazz:', {
        sku: buyerSkuCode,
        customer: customerNo,
        ref: refId
      });

      const response = await fetch(`${this.baseUrl}/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Digiflazz transaction error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('✅ Response transaksi Digiflazz:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error membuat transaksi Digiflazz:', error);
      throw error;
    }
  }

  async checkTransactionStatus(refId: string): Promise<DigiflazzTransactionResponse> {
    try {
      // Sesuai dokumentasi: sign = md5(username + apikey + refId)
      const sign = await this.generateSign(refId);
      
      const payload = {
        commands: "status-pasca", // Command untuk cek status
        username: this.username,
        ref_id: refId,
        sign: sign
      };

      console.log('🔍 Mengecek status transaksi:', refId);

      const response = await fetch(`${this.baseUrl}/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Digiflazz status check error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('📊 Status transaksi Digiflazz:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error mengecek status Digiflazz:', error);
      throw error;
    }
  }
}

export const digiflazzService = new DigiflazzService();
