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

  private async generateSign(refId: string, customerNo: string, buyerSkuCode: string): Promise<string> {
    const crypto = await import('crypto');
    const data = this.username + this.apiKey + refId;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  async getProducts(): Promise<DigiflazzProduct[]> {
    try {
      const sign = await this.generateSign("pricelist", "", "");
      const payload = {
        cmd: "prepaid",
        username: this.username,
        sign: sign
      };

      const response = await fetch(`${this.baseUrl}/price-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Digiflazz API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching Digiflazz products:', error);
      return [];
    }
  }

  async findProduct(productType: string, provider: string, amount: number): Promise<string | null> {
    try {
      // Map internal product types to Digiflazz categories
      const categoryMap: Record<string, string> = {
        'pulsa': 'Pulsa',
        'token_listrik': 'PLN',
        'game_voucher': 'Games',
        'ewallet': 'E-Money'
      };

      const category = categoryMap[productType];
      if (!category) return null;

      // For demonstration, return a mock SKU code based on the product
      // In real implementation, this would query Digiflazz API
      const skuMapping: Record<string, Record<string, string>> = {
        'pulsa': {
          'telkomsel': `tsel${amount/1000}`,
          'indosat': `isat${amount/1000}`,
          'xl': `xl${amount/1000}`
        },
        'token_listrik': {
          'pln': `pln${amount/1000}`
        }
      };

      return skuMapping[productType]?.[provider] || null;
    } catch (error) {
      console.error('Error finding Digiflazz product:', error);
      return null;
    }
  }

  async createTransaction(
    buyerSkuCode: string,
    customerNo: string,
    refId: string
  ): Promise<DigiflazzTransactionResponse> {
    try {
      const sign = await this.generateSign(refId, customerNo, buyerSkuCode);
      
      const payload: DigiflazzTransactionRequest = {
        commands: "inq-pasca",
        username: this.username,
        buyer_sku_code: buyerSkuCode,
        customer_no: customerNo,
        ref_id: refId,
        sign: sign
      };

      const response = await fetch(`${this.baseUrl}/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Digiflazz transaction error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Digiflazz transaction:', error);
      throw error;
    }
  }

  async checkTransactionStatus(refId: string): Promise<DigiflazzTransactionResponse> {
    try {
      const sign = await this.generateSign(refId, "", "");
      
      const payload = {
        commands: "status-pasca",
        username: this.username,
        ref_id: refId,
        sign: sign
      };

      const response = await fetch(`${this.baseUrl}/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Digiflazz status check error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking Digiflazz transaction status:', error);
      throw error;
    }
  }
}

export const digiflazzService = new DigiflazzService();
