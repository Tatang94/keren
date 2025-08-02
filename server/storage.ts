import { type Transaction, type InsertTransaction, type Product, type InsertProduct, type AdminStats, type InsertAdminStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Transactions
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionsByTargetNumber(targetNumber: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined>;
  getRecentTransactions(limit?: number): Promise<Transaction[]>;
  getTodayTransactions(): Promise<Transaction[]>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  clearAllProducts(): Promise<void>;
  getTransactionById(id: string): Promise<Transaction | undefined>;
  
  // Admin Stats
  getTodayStats(): Promise<AdminStats | undefined>;
  updateTodayStats(stats: Partial<AdminStats>): Promise<AdminStats>;
}

export class MemStorage implements IStorage {
  private transactions: Map<string, Transaction>;
  private products: Map<string, Product>;
  private adminStats: Map<string, AdminStats>;

  constructor() {
    this.transactions = new Map();
    this.products = new Map();
    this.adminStats = new Map();
    this.initializeProducts();
    this.syncDigiflazzProducts();
  }

  private initializeProducts() {
    const defaultProducts: Product[] = [
      // Pulsa Telkomsel
      { id: "tsel-5k", category: "pulsa", provider: "telkomsel", name: "Pulsa Telkomsel 5.000", price: 5000, adminFee: 750, isActive: true },
      { id: "tsel-10k", category: "pulsa", provider: "telkomsel", name: "Pulsa Telkomsel 10.000", price: 10000, adminFee: 1000, isActive: true },
      { id: "tsel-25k", category: "pulsa", provider: "telkomsel", name: "Pulsa Telkomsel 25.000", price: 25000, adminFee: 1250, isActive: true },
      { id: "tsel-50k", category: "pulsa", provider: "telkomsel", name: "Pulsa Telkomsel 50.000", price: 50000, adminFee: 1500, isActive: true },
      { id: "tsel-100k", category: "pulsa", provider: "telkomsel", name: "Pulsa Telkomsel 100.000", price: 100000, adminFee: 2000, isActive: true },
      
      // Pulsa Indosat
      { id: "isat-5k", category: "pulsa", provider: "indosat", name: "Pulsa Indosat 5.000", price: 5000, adminFee: 750, isActive: true },
      { id: "isat-10k", category: "pulsa", provider: "indosat", name: "Pulsa Indosat 10.000", price: 10000, adminFee: 1000, isActive: true },
      { id: "isat-25k", category: "pulsa", provider: "indosat", name: "Pulsa Indosat 25.000", price: 25000, adminFee: 1250, isActive: true },
      { id: "isat-50k", category: "pulsa", provider: "indosat", name: "Pulsa Indosat 50.000", price: 50000, adminFee: 1500, isActive: true },
      
      // Token Listrik PLN
      { id: "pln-20k", category: "token_listrik", provider: "pln", name: "Token PLN 20.000", price: 20000, adminFee: 1500, isActive: true },
      { id: "pln-50k", category: "token_listrik", provider: "pln", name: "Token PLN 50.000", price: 50000, adminFee: 1500, isActive: true },
      { id: "pln-100k", category: "token_listrik", provider: "pln", name: "Token PLN 100.000", price: 100000, adminFee: 1500, isActive: true },
      { id: "pln-200k", category: "token_listrik", provider: "pln", name: "Token PLN 200.000", price: 200000, adminFee: 2000, isActive: true },
      
      // Game Vouchers
      { id: "ml-86-dm", category: "game_voucher", provider: "mobile_legends", name: "Mobile Legends 86 Diamond", price: 20000, adminFee: 1000, isActive: true },
      { id: "ml-172-dm", category: "game_voucher", provider: "mobile_legends", name: "Mobile Legends 172 Diamond", price: 40000, adminFee: 1500, isActive: true },
      { id: "ff-70-dm", category: "game_voucher", provider: "free_fire", name: "Free Fire 70 Diamond", price: 10000, adminFee: 1000, isActive: true },
      { id: "ff-140-dm", category: "game_voucher", provider: "free_fire", name: "Free Fire 140 Diamond", price: 20000, adminFee: 1000, isActive: true },
      
      // E-Wallet
      { id: "gopay-50k", category: "ewallet", provider: "gopay", name: "GoPay 50.000", price: 50000, adminFee: 2000, isActive: true },
      { id: "gopay-100k", category: "ewallet", provider: "gopay", name: "GoPay 100.000", price: 100000, adminFee: 2500, isActive: true },
      { id: "ovo-50k", category: "ewallet", provider: "ovo", name: "OVO 50.000", price: 50000, adminFee: 2000, isActive: true },
      { id: "dana-50k", category: "ewallet", provider: "dana", name: "DANA 50.000", price: 50000, adminFee: 2000, isActive: true },
    ];

    defaultProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  private async syncDigiflazzProducts() {
    try {
      const { digiflazzService } = await import("./services/digiflazz");
      const digiflazzProducts = await digiflazzService.getProducts();
      
      // Check if digiflazzProducts is an array
      if (!Array.isArray(digiflazzProducts)) {
        console.log('Digiflazz API returned no products, using default products only');
        return;
      }
      
      // Convert Digiflazz products to our format
      digiflazzProducts.forEach(dfProduct => {
        if (dfProduct.status === 'available') {
          const category = this.mapDigiflazzCategory(dfProduct.category);
          const provider = this.mapDigiflazzBrand(dfProduct.brand);
          
          const product: Product = {
            id: dfProduct.buyer_sku_code,
            category: category,
            provider: provider.toLowerCase(),
            name: dfProduct.product_name,
            price: dfProduct.price,
            adminFee: this.calculateAdminFee(dfProduct.price),
            isActive: true
          };
          
          this.products.set(product.id, product);
        }
      });
      
      console.log(`Synced ${digiflazzProducts.length} products from Digiflazz`);
    } catch (error) {
      console.error('Failed to sync Digiflazz products:', error);
    }
  }

  private mapDigiflazzCategory(dfCategory: string): string {
    // Mapping berdasarkan kategori sebenarnya dari API Digiflazz
    const categoryMap: Record<string, string> = {
      'Pulsa': 'pulsa',
      'Data': 'pulsa', // Paket data masuk kategori pulsa
      'E-Money': 'ewallet',
      'Voucher': 'game_voucher',
      'Aktivasi Voucher': 'game_voucher',
      'Paket SMS & Telpon': 'pulsa',
      'Games': 'game_voucher',
      'TV': 'tv_streaming',
      'PLN': 'token_listrik',
      'eSIM': 'pulsa'
    };
    return categoryMap[dfCategory] || 'pulsa';
  }

  private mapDigiflazzBrand(dfBrand: string): string {
    // Mapping berdasarkan brand sebenarnya dari API Digiflazz
    const brandMap: Record<string, string> = {
      'TELKOMSEL': 'telkomsel',
      'INDOSAT': 'indosat',
      'XL': 'xl',
      'TRI': 'tri',
      'SMARTFREN': 'smartfren',
      'AXIS': 'axis',
      'by.U': 'byu',
      'PLN': 'pln',
      'FREE FIRE': 'free_fire',
      'PUBG MOBILE': 'pubg',
      'Call of Duty MOBILE': 'cod_mobile',
      'GOOGLE PLAY INDONESIA': 'google_play',
      'Minecraft': 'minecraft',
      'Mango Live': 'mango_live',
      'OVO': 'ovo',
      'DANA': 'dana',
      'GRAB': 'grab',
      'TAPCASH BNI': 'tapcash',
      'MANDIRI E-TOLL': 'mandiri_etoll',
      'BRI BRIZZI': 'brizzi',
      'INDOMARET': 'indomaret'
    };
    return brandMap[dfBrand.toUpperCase()] || dfBrand.toLowerCase().replace(/\s+/g, '_');
  }

  private calculateAdminFee(price: number): number {
    if (price <= 10000) return 750;
    if (price <= 25000) return 1000;
    if (price <= 50000) return 1500;
    if (price <= 100000) return 2000;
    return 2500;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByTargetNumber(targetNumber: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      transaction => transaction.targetNumber === targetNumber
    ).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const now = new Date();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      status: insertTransaction.status || 'pending',
      paymentUrl: insertTransaction.paymentUrl || null,
      digiflazzRef: insertTransaction.digiflazzRef || null,
      paydisiniRef: insertTransaction.paydisiniRef || null,
      aiCommand: insertTransaction.aiCommand || null,
      createdAt: now,
      updatedAt: now,
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const updatedTransaction: Transaction = {
      ...transaction,
      ...updates,
      updatedAt: new Date(),
    };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  async getTodayTransactions(): Promise<Transaction[]> {
    const today = new Date().toISOString().split('T')[0];
    return Array.from(this.transactions.values()).filter(
      transaction => transaction.createdAt!.toISOString().startsWith(today)
    );
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.isActive);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.category === category && product.isActive
    );
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct, 
      id,
      isActive: insertProduct.isActive ?? true
    };
    this.products.set(id, product);
    return product;
  }

  async getTodayStats(): Promise<AdminStats | undefined> {
    const today = new Date().toISOString().split('T')[0];
    return this.adminStats.get(today);
  }

  async updateTodayStats(statsUpdate: Partial<AdminStats>): Promise<AdminStats> {
    const today = new Date().toISOString().split('T')[0];
    const existingStats = this.adminStats.get(today);
    
    const stats: AdminStats = {
      id: existingStats?.id || randomUUID(),
      date: today,
      totalTransactions: 0,
      totalRevenue: 0,
      pendingTransactions: 0,
      failedTransactions: 0,
      ...existingStats,
      ...statsUpdate,
    };
    
    this.adminStats.set(today, stats);
    return stats;
  }
}

// Use database storage
import { eq, desc } from "drizzle-orm";
import { db, transactions, products, adminStats } from "@shared/schema";

export class DbStorage implements IStorage {
  async clearAllProducts(): Promise<void> {
    await db.delete(products);
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
    return result[0];
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    return this.getTransaction(id);
  }

  async getTransactionsByTargetNumber(targetNumber: string): Promise<Transaction[]> {
    return db.select().from(transactions)
      .where(eq(transactions.targetNumber, targetNumber))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const newTransaction = {
      id: randomUUID(),
      ...transaction,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.insert(transactions).values(newTransaction);
    return newTransaction as Transaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    await db.update(transactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(transactions.id, id));
    
    return this.getTransaction(id);
  }

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    return db.select().from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getTodayTransactions(): Promise<Transaction[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return db.select().from(transactions);
  }

  async getProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return db.select().from(products)
      .where(eq(products.category, category));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct = {
      ...product,
    };
    
    await db.insert(products).values(newProduct);
    return newProduct as Product;
  }

  async getTodayStats(): Promise<AdminStats | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const result = await db.select().from(adminStats).where(eq(adminStats.date, today)).limit(1);
    return result[0];
  }

  async updateTodayStats(stats: Partial<AdminStats>): Promise<AdminStats> {
    const today = new Date().toISOString().split('T')[0];
    const existing = await this.getTodayStats();
    
    if (existing) {
      await db.update(adminStats)
        .set(stats)
        .where(eq(adminStats.date, today));
      return { ...existing, ...stats };
    } else {
      const newStats = {
        id: randomUUID(),
        date: today,
        totalTransactions: 0,
        completedTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
        totalRevenue: 0,
        ...stats
      };
      
      await db.insert(adminStats).values(newStats);
      return newStats as AdminStats;
    }
  }
}

export const storage = new DbStorage();
