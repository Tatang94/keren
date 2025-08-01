interface PaydisiniCreatePaymentRequest {
  key: string;
  request: string;
  unique_code: string;
  service: string;
  amount: number;
  note: string;
  valid_time: number;
  type_fee: number;
}

interface PaydisiniCreatePaymentResponse {
  success: boolean;
  data?: {
    unique_code: string;
    service: string;
    service_name: string;
    amount: number;
    balance: number;
    fee: number;
    type_fee: string;
    note: string;
    status: string;
    expired: string;
    checkout_url: string;
    checkout_url_v2: string;
    checkout_url_v3: string;
    checkout_url_beta: string;
  };
  msg?: string;
}

interface PaydisiniCheckStatusResponse {
  success: boolean;
  data?: {
    unique_code: string;
    service: string;
    service_name: string;
    amount: number;
    fee: number;
    type_fee: string;
    note: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  msg?: string;
}

export class PaydisiniService {
  private apiKey: string;
  private baseUrl: string = "https://paydisini.co.id/api/";

  constructor() {
    this.apiKey = process.env.PAYDISINI_API_KEY || "";
  }

  private generateSign(data: string): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(this.apiKey + data).digest('hex');
  }

  async createPayment(
    uniqueCode: string,
    amount: number,
    note: string,
    service: string = "11", // QRIS by default
    validTime: number = 10800 // 3 hours in seconds
  ): Promise<PaydisiniCreatePaymentResponse> {
    try {
      const data = this.apiKey + uniqueCode + service + amount + validTime + "NewTransaction";
      const signature = this.generateSign(data);

      const payload: PaydisiniCreatePaymentRequest = {
        key: this.apiKey,
        request: "new",
        unique_code: uniqueCode,
        service: service,
        amount: amount,
        note: note,
        valid_time: validTime,
        type_fee: 1 // Customer bears the fee
      };

      const formData = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      formData.append('signature', signature);

      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Paydisini API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Paydisini payment:', error);
      throw error;
    }
  }

  async checkPaymentStatus(uniqueCode: string): Promise<PaydisiniCheckStatusResponse> {
    try {
      const data = this.apiKey + uniqueCode + "StatusTransaction";
      const signature = this.generateSign(data);

      const formData = new URLSearchParams();
      formData.append('key', this.apiKey);
      formData.append('request', 'status');
      formData.append('unique_code', uniqueCode);
      formData.append('signature', signature);

      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Paydisini status check error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking Paydisini payment status:', error);
      throw error;
    }
  }

  getAvailableServices(): Record<string, string> {
    return {
      "11": "QRIS",
      "15": "BCA Virtual Account",
      "16": "BNI Virtual Account",
      "17": "BRI Virtual Account",
      "18": "Mandiri Virtual Account",
      "19": "BSI Virtual Account",
      "20": "Maybank Virtual Account",
      "21": "BJB Virtual Account",
      "22": "CIMB Virtual Account"
    };
  }
}

export const paydisiniService = new PaydisiniService();
