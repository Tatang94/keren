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
        
        // Filter produk aktif berdasarkan status yang tersedia
        const activeProducts = data.data.filter((product: any) => 
          product.buyer_product_status === true
        );
        
        console.log(`📊 Produk aktif: ${activeProducts.length}/${data.data.length}`);
        return activeProducts.length > 0 ? activeProducts : data.data;
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
      console.log(`🔍 Mencari produk: ${productType} ${provider} ${amount} dari ${products.length} produk`);
      
      // Cari produk berdasarkan brand dan kategori dulu
      const brandProducts = products.filter(product => 
        product.brand.toLowerCase().includes(provider.toLowerCase()) &&
        (product.category.toLowerCase().includes('pulsa') || 
         product.category.toLowerCase().includes('data'))
      );
      
      console.log(`📦 Produk ${provider}: ${brandProducts.length} ditemukan`);
      
      if (brandProducts.length > 0) {
        // Log beberapa produk untuk debugging
        console.log('🎯 Contoh produk yang ditemukan:', 
          brandProducts.slice(0, 3).map(p => `${p.product_name} (${p.price})`).join(', '));
        
        // Cari yang sesuai nominal dengan toleransi
        const exactMatch = brandProducts.find(product => {
          const productName = product.product_name.toLowerCase();
          const amountStr = amount.toString();
          const amountK = (amount/1000).toString();
          
          return productName.includes(amountStr) ||
                 productName.includes(amountK + '.000') ||
                 productName.includes(amountK + 'k') ||
                 Math.abs(product.price - amount) <= 1000;
        });
        
        if (exactMatch) {
          console.log(`✅ Exact match: ${exactMatch.product_name} (${exactMatch.buyer_sku_code})`);
          return exactMatch.buyer_sku_code;
        }
        
        // Jika tidak ada exact match, ambil yang terdekat harganya
        const closest = brandProducts.reduce((prev, curr) => {
          const prevDiff = Math.abs(prev.price - amount);
          const currDiff = Math.abs(curr.price - amount);
          return currDiff < prevDiff ? curr : prev;
        });
        
        console.log(`🎯 Closest match: ${closest.product_name} (${closest.price}) - ${closest.buyer_sku_code}`);
        return closest.buyer_sku_code;
      }

      console.log(`❌ Tidak ditemukan produk ${provider}`);
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
