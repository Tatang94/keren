import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { parseOrderCommand, generateOrderConfirmation, generateErrorMessage } from "./services/gemini";
import { digiflazzService } from "./services/digiflazz";
import { paydisiniService } from "./services/paydisini";
import { insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Sync products from Digiflazz
  app.post("/api/admin/sync-products", async (req, res) => {
    try {
      const digiflazzProducts = await digiflazzService.getProducts();
      
      // Clear existing products and sync new ones
      for (const dfProduct of digiflazzProducts.slice(0, 50)) { // Limit to first 50 for testing
        if (dfProduct.status === 'available') {
          const category = mapDigiflazzCategory(dfProduct.category);
          const provider = mapDigiflazzBrand(dfProduct.brand);
          
          const product = {
            category: category,
            provider: provider.toLowerCase(),
            name: dfProduct.product_name,
            price: dfProduct.price,
            adminFee: calculateAdminFee(dfProduct.price),
            isActive: true
          };
          
          await storage.createProduct({
            ...product,
            id: dfProduct.buyer_sku_code
          });
        }
      }
      
      res.json({ 
        success: true, 
        message: `Synced ${digiflazzProducts.length} products from Digiflazz`,
        count: digiflazzProducts.length
      });
    } catch (error) {
      console.error('Sync error:', error);
      res.status(500).json({ error: "Failed to sync products from Digiflazz" });
    }
  });

  function mapDigiflazzCategory(dfCategory: string): string {
    const categoryMap: Record<string, string> = {
      'Pulsa': 'pulsa',
      'Paket Data': 'pulsa', 
      'PLN': 'token_listrik',
      'Token Listrik': 'token_listrik',
      'Games': 'game_voucher',
      'Voucher Game': 'game_voucher',
      'E-Money': 'ewallet',
      'E-Wallet': 'ewallet'
    };
    return categoryMap[dfCategory] || 'pulsa';
  }

  function mapDigiflazzBrand(dfBrand: string): string {
    const brandMap: Record<string, string> = {
      'TELKOMSEL': 'telkomsel',
      'INDOSAT': 'indosat', 
      'XL AXIATA': 'xl',
      'TRI': 'tri',
      'SMARTFREN': 'smartfren',
      'AXIS': 'axis',
      'PLN': 'pln',
      'MOBILE LEGENDS': 'mobile_legends',
      'FREE FIRE': 'free_fire',
      'PUBG MOBILE': 'pubg',
      'GOPAY': 'gopay',
      'OVO': 'ovo',
      'DANA': 'dana',
      'SHOPEEPAY': 'shopeepay'
    };
    return brandMap[dfBrand.toUpperCase()] || dfBrand.toLowerCase();
  }

  function calculateAdminFee(price: number): number {
    if (price <= 10000) return 750;
    if (price <= 25000) return 1000;
    if (price <= 50000) return 1500;
    if (price <= 100000) return 2000;
    return 2500;
  }

  // Get products by category
  app.get("/api/products/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products by category" });
    }
  });

  // Process AI chat command
  app.post("/api/chat/process", async (req, res) => {
    try {
      const { command } = req.body;
      
      if (!command || typeof command !== 'string') {
        return res.status(400).json({ error: "Command is required" });
      }

      // Parse the command using Gemini AI
      const parsedOrder = await parseOrderCommand(command);
      
      // Check if this is a non-PPOB question
      if (parsedOrder.confidence === 0) {
        return res.json({
          success: false,
          message: "Maaf, saya hanya dapat membantu dengan pembelian produk digital PPOB seperti pulsa, token listrik, game voucher, dan top up e-wallet.\n\nContoh perintah:\n• Beli pulsa Telkomsel 50rb untuk 081234567890\n• Token listrik 100rb meter 12345678901\n• Top up GoPay 200rb ke 081234567890"
        });
      }
      
      if (parsedOrder.confidence < 0.7) {
        return res.json({
          success: false,
          message: "Perintah kurang jelas. Silakan gunakan format yang lebih spesifik:\n\nContoh:\n• Beli pulsa [provider] [nominal] untuk [nomor]\n• Token listrik [nominal] meter [nomor meter]\n• Top up [e-wallet] [nominal] ke [nomor]"
        });
      }

      // Find matching products
      let products = await storage.getProductsByCategory(parsedOrder.productType);
      
      if (parsedOrder.provider) {
        products = products.filter(p => 
          p.provider.toLowerCase().includes(parsedOrder.provider!.toLowerCase())
        );
      }
      
      if (parsedOrder.amount) {
        products = products.filter(p => p.price === parsedOrder.amount);
      }

      if (products.length === 0) {
        const errorMsg = await generateErrorMessage("Produk tidak ditemukan");
        return res.json({
          success: false,
          message: errorMsg
        });
      }

      // Use the first matching product
      const product = products[0];
      
      // Generate confirmation message
      const confirmationMsg = await generateOrderConfirmation(
        product.name,
        parsedOrder.targetNumber,
        product.price,
        product.adminFee
      );

      res.json({
        success: true,
        message: confirmationMsg,
        productData: {
          productId: product.id,
          productName: product.name,
          targetNumber: parsedOrder.targetNumber,
          amount: product.price,
          adminFee: product.adminFee,
          totalAmount: product.price + product.adminFee
        }
      });

    } catch (error) {
      console.error('Error processing chat command:', error);
      const errorMsg = await generateErrorMessage("Terjadi kesalahan sistem");
      res.status(500).json({ 
        success: false, 
        message: errorMsg
      });
    }
  });

  // Create transaction and payment
  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      
      // Create transaction
      const transaction = await storage.createTransaction(validatedData);
      
      // Create payment with Paydisini
      const paymentResponse = await paydisiniService.createPayment(
        transaction.id,
        transaction.totalAmount,
        `Pembayaran ${transaction.productName} untuk ${transaction.targetNumber}`,
        "11" // QRIS
      );

      if (paymentResponse.success && paymentResponse.data) {
        // Update transaction with payment URL
        await storage.updateTransaction(transaction.id, {
          paymentUrl: paymentResponse.data.checkout_url_v3,
          paydisiniRef: paymentResponse.data.unique_code,
          status: "pending"
        });

        // Update admin stats
        await storage.updateTodayStats({
          pendingTransactions: (await storage.getTodayStats())?.pendingTransactions || 0 + 1
        });

        res.json({
          success: true,
          transaction,
          paymentUrl: paymentResponse.data.checkout_url_v3
        });
      } else {
        throw new Error(paymentResponse.msg || "Failed to create payment");
      }

    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  // Get transaction by ID
  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const transaction = await storage.getTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  });

  // Check transaction status by target number
  app.get("/api/transactions/check/:targetNumber", async (req, res) => {
    try {
      const { targetNumber } = req.params;
      const transactions = await storage.getTransactionsByTargetNumber(targetNumber);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to check transactions" });
    }
  });

  // Admin: Get recent transactions
  app.get("/api/admin/transactions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const transactions = await storage.getRecentTransactions(limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin transactions" });
    }
  });

  // Admin: Get today's statistics
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const todayTransactions = await storage.getTodayTransactions();
      const stats = {
        todayTransactions: todayTransactions.length,
        todayRevenue: todayTransactions
          .filter(t => t.status === 'success')
          .reduce((sum, t) => sum + t.totalAmount, 0),
        pendingTransactions: todayTransactions.filter(t => t.status === 'pending').length,
        failedTransactions: todayTransactions.filter(t => t.status === 'failed').length,
      };

      await storage.updateTodayStats(stats);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

  // Webhook endpoint for Paydisini payment callbacks
  app.post("/api/webhook/paydisini", async (req, res) => {
    try {
      const { unique_code, status } = req.body;
      
      // Find transaction by Paydisini reference
      const transactions = await storage.getRecentTransactions(1000);
      const transaction = transactions.find(t => t.paydisiniRef === unique_code);
      
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      // Update transaction status based on payment status
      let newStatus = 'pending';
      if (status === 'Success') {
        newStatus = 'paid';
        
        // Process with Digiflazz
        try {
          const product = await storage.getProduct(transaction.productName.split(' ')[0].toLowerCase());
          if (product) {
            const digiflazzRef = await digiflazzService.createTransaction(
              product.id,
              transaction.targetNumber,
              transaction.id
            );
            
            await storage.updateTransaction(transaction.id, {
              status: 'success',
              digiflazzRef: digiflazzRef.data.ref_id
            });
          }
        } catch (digiflazzError) {
          console.error('Digiflazz processing failed:', digiflazzError);
          // Keep status as paid, manual intervention needed
        }
      } else if (status === 'Canceled' || status === 'Expired') {
        newStatus = 'failed';
      }

      await storage.updateTransaction(transaction.id, { status: newStatus });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
