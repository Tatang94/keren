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
      // For now, use fallback products since Digiflazz returns test data
      console.log('Using fallback products due to test data from Digiflazz API');
      
      let syncedCount = 0;
      
      // Clear existing products first
      await storage.clearAllProducts();
      console.log('Cleared existing products');
      
      // Use real Indonesian telecom products
      const realProducts = [
        // Telkomsel Pulsa
        { id: "s5", category: "pulsa", provider: "telkomsel", name: "Pulsa Telkomsel 5.000", price: 6250, adminFee: 750 },
        { id: "s10", category: "pulsa", provider: "telkomsel", name: "Pulsa Telkomsel 10.000", price: 11000, adminFee: 1000 },
        { id: "s20", category: "pulsa", provider: "telkomsel", name: "Pulsa Telkomsel 20.000", price: 21000, adminFee: 1000 },
        { id: "s25", category: "pulsa", provider: "telkomsel", name: "Pulsa Telkomsel 25.000", price: 26250, adminFee: 1250 },
        { id: "s50", category: "pulsa", provider: "telkomsel", name: "Pulsa Telkomsel 50.000", price: 51500, adminFee: 1500 },
        { id: "s100", category: "pulsa", provider: "telkomsel", name: "Pulsa Telkomsel 100.000", price: 102000, adminFee: 2000 },
        
        // Indosat Pulsa
        { id: "i5", category: "pulsa", provider: "indosat", name: "Pulsa Indosat 5.000", price: 6000, adminFee: 750 },
        { id: "i10", category: "pulsa", provider: "indosat", name: "Pulsa Indosat 10.000", price: 10750, adminFee: 1000 },
        { id: "i20", category: "pulsa", provider: "indosat", name: "Pulsa Indosat 20.000", price: 20500, adminFee: 1000 },
        { id: "i25", category: "pulsa", provider: "indosat", name: "Pulsa Indosat 25.000", price: 25750, adminFee: 1250 },
        { id: "i50", category: "pulsa", provider: "indosat", name: "Pulsa Indosat 50.000", price: 50500, adminFee: 1500 },
        { id: "i100", category: "pulsa", provider: "indosat", name: "Pulsa Indosat 100.000", price: 101000, adminFee: 2000 },
        
        // XL Pulsa
        { id: "x5", category: "pulsa", provider: "xl", name: "Pulsa XL 5.000", price: 6000, adminFee: 750 },
        { id: "x10", category: "pulsa", provider: "xl", name: "Pulsa XL 10.000", price: 10750, adminFee: 1000 },
        { id: "x25", category: "pulsa", provider: "xl", name: "Pulsa XL 25.000", price: 25750, adminFee: 1250 },
        { id: "x50", category: "pulsa", provider: "xl", name: "Pulsa XL 50.000", price: 50500, adminFee: 1500 },
        { id: "x100", category: "pulsa", provider: "xl", name: "Pulsa XL 100.000", price: 101000, adminFee: 2000 },
        
        // Tri Pulsa
        { id: "t5", category: "pulsa", provider: "tri", name: "Pulsa Tri 5.000", price: 5500, adminFee: 750 },
        { id: "t10", category: "pulsa", provider: "tri", name: "Pulsa Tri 10.000", price: 10500, adminFee: 1000 },
        { id: "t20", category: "pulsa", provider: "tri", name: "Pulsa Tri 20.000", price: 20000, adminFee: 1000 },
        { id: "t25", category: "pulsa", provider: "tri", name: "Pulsa Tri 25.000", price: 25000, adminFee: 1250 },
        { id: "t50", category: "pulsa", provider: "tri", name: "Pulsa Tri 50.000", price: 50000, adminFee: 1500 },
        { id: "t100", category: "pulsa", provider: "tri", name: "Pulsa Tri 100.000", price: 100000, adminFee: 2000 },
        
        // Smartfren Pulsa
        { id: "sm5", category: "pulsa", provider: "smartfren", name: "Pulsa Smartfren 5.000", price: 5750, adminFee: 750 },
        { id: "sm10", category: "pulsa", provider: "smartfren", name: "Pulsa Smartfren 10.000", price: 10500, adminFee: 1000 },
        { id: "sm20", category: "pulsa", provider: "smartfren", name: "Pulsa Smartfren 20.000", price: 20000, adminFee: 1000 },
        { id: "sm25", category: "pulsa", provider: "smartfren", name: "Pulsa Smartfren 25.000", price: 25000, adminFee: 1250 },
        { id: "sm50", category: "pulsa", provider: "smartfren", name: "Pulsa Smartfren 50.000", price: 50000, adminFee: 1500 },
        { id: "sm100", category: "pulsa", provider: "smartfren", name: "Pulsa Smartfren 100.000", price: 100000, adminFee: 2000 },
        
        // Token Listrik PLN
        { id: "pln20", category: "token_listrik", provider: "pln", name: "Token PLN 20.000", price: 21500, adminFee: 1500 },
        { id: "pln50", category: "token_listrik", provider: "pln", name: "Token PLN 50.000", price: 51500, adminFee: 1500 },
        { id: "pln100", category: "token_listrik", provider: "pln", name: "Token PLN 100.000", price: 101500, adminFee: 1500 },
        { id: "pln200", category: "token_listrik", provider: "pln", name: "Token PLN 200.000", price: 202000, adminFee: 2000 },
        
        // Game Vouchers - Mobile Legends
        { id: "ml86", category: "game_voucher", provider: "mobile_legends", name: "Mobile Legends 86 Diamond", price: 21000, adminFee: 1000 },
        { id: "ml172", category: "game_voucher", provider: "mobile_legends", name: "Mobile Legends 172 Diamond", price: 41000, adminFee: 1500 },
        { id: "ml257", category: "game_voucher", provider: "mobile_legends", name: "Mobile Legends 257 Diamond", price: 61000, adminFee: 1500 },
        { id: "ml344", category: "game_voucher", provider: "mobile_legends", name: "Mobile Legends 344 Diamond", price: 81000, adminFee: 2000 },
        
        // Game Vouchers - Free Fire
        { id: "ff70", category: "game_voucher", provider: "free_fire", name: "Free Fire 70 Diamond", price: 11000, adminFee: 1000 },
        { id: "ff140", category: "game_voucher", provider: "free_fire", name: "Free Fire 140 Diamond", price: 21000, adminFee: 1000 },
        { id: "ff355", category: "game_voucher", provider: "free_fire", name: "Free Fire 355 Diamond", price: 51000, adminFee: 1500 },
        { id: "ff720", category: "game_voucher", provider: "free_fire", name: "Free Fire 720 Diamond", price: 101000, adminFee: 2000 },
        
        // E-Wallet
        { id: "gopay50", category: "ewallet", provider: "gopay", name: "GoPay 50.000", price: 52000, adminFee: 2000 },
        { id: "gopay100", category: "ewallet", provider: "gopay", name: "GoPay 100.000", price: 102500, adminFee: 2500 },
        { id: "ovo50", category: "ewallet", provider: "ovo", name: "OVO 50.000", price: 52000, adminFee: 2000 },
        { id: "ovo100", category: "ewallet", provider: "ovo", name: "OVO 100.000", price: 102500, adminFee: 2500 },
        { id: "dana50", category: "ewallet", provider: "dana", name: "DANA 50.000", price: 52000, adminFee: 2000 },
        { id: "dana100", category: "ewallet", provider: "dana", name: "DANA 100.000", price: 102500, adminFee: 2500 },
      ];
      
      // Sync all products
      for (const product of realProducts) {
        try {
          await storage.createProduct({
            ...product,
            isActive: true
          });
          syncedCount++;
        } catch (error) {
          console.error(`Error syncing product ${product.id}:`, error);
        }
      }
      
      console.log(`Sync completed: ${syncedCount} real products synced`);
      
      res.json({ 
        success: true, 
        message: `Synced ${syncedCount} real products (fallback data)`,
        syncedCount,
        errorCount: 0,
        totalProducts: realProducts.length
      });
    } catch (error) {
      console.error('Sync error:', error);
      res.status(500).json({ error: "Failed to sync products" });
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

      // Log the incoming command for debugging
      console.log('Received command:', command);
      
      // Parse the command using Gemini AI
      const parsedOrder = await parseOrderCommand(command);
      console.log('Parsed order:', parsedOrder);
      
      // Check if this is a non-PPOB question
      if (parsedOrder.confidence === 0) {
        return res.json({
          success: false,
          message: "Maaf, saya hanya dapat membantu dengan layanan PPOB Digiflazz:\n\n🔍 **Cek Harga:** \"Cek harga pulsa Telkomsel\"\n💰 **Transaksi:** \"Beli pulsa Telkomsel 50rb untuk 081234567890\"\n📋 **List Produk:** \"List voucher Mobile Legends\"\n📊 **Status:** \"Status transaksi [ID]\""
        });
      }
      
      if (parsedOrder.confidence < 0.8) {
        return res.json({
          success: false,
          message: "Perintah kurang jelas. Gunakan format yang lebih spesifik:\n\n📱 **Cek Harga:** Cek harga [kategori] [provider]\n🛒 **Beli:** Beli [produk] [nominal] untuk [nomor]\n📋 **List:** List produk [kategori]\n📊 **Status:** Status transaksi [ID]"
        });
      }

      // Handle different intents
      switch (parsedOrder.intent) {
        case "check_price":
          return await handleCheckPrice(parsedOrder, res);
        
        case "list_products":
          return await handleListProducts(parsedOrder, res);
          
        case "check_status":
          return await handleCheckStatus(parsedOrder, res);
          
        case "buy":
          return await handleBuyProduct(parsedOrder, res);
          
        default:
          return res.json({
            success: false,
            message: "Intent tidak dikenali. Gunakan perintah: cek harga, list produk, beli, atau status transaksi."
          });
      }

    } catch (error) {
      console.error('Error processing chat command:', error);
      const errorMsg = await generateErrorMessage("Terjadi kesalahan sistem");
      res.status(500).json({ 
        success: false, 
        message: errorMsg
      });
    }
  });

  // Handler functions for different intents
  async function handleCheckPrice(parsedOrder: any, res: any) {
    try {
      let products = await storage.getProductsByCategory(parsedOrder.productType);
      
      if (parsedOrder.provider) {
        products = products.filter(p => 
          p.provider.toLowerCase().includes(parsedOrder.provider.toLowerCase())
        );
      }

      if (products.length === 0) {
        return res.json({
          success: false,
          message: `Produk ${parsedOrder.productType} ${parsedOrder.provider || ''} tidak ditemukan.`
        });
      }

      // Group products by price
      const priceGroups = products.reduce((acc: any, product: any) => {
        if (!acc[product.price]) {
          acc[product.price] = [];
        }
        acc[product.price].push(product);
        return acc;
      }, {});

      let message = `📋 **Daftar Harga ${parsedOrder.productType.toUpperCase()} ${parsedOrder.provider?.toUpperCase() || ''}:**\n\n`;
      
      Object.keys(priceGroups)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .slice(0, 10) // Limit to 10 items
        .forEach(price => {
          const product = priceGroups[price][0];
          const totalPrice = product.price + product.adminFee;
          message += `💰 **Rp ${parseInt(price).toLocaleString('id-ID')}** (+ admin Rp ${product.adminFee.toLocaleString('id-ID')} = **Rp ${totalPrice.toLocaleString('id-ID')}**)\n`;
          message += `   ${product.name}\n\n`;
        });

      message += `\n💡 Untuk membeli: "Beli ${parsedOrder.productType} ${parsedOrder.provider || '[provider]'} [nominal] untuk [nomor]"`;

      return res.json({
        success: true,
        message
      });
    } catch (error) {
      return res.json({
        success: false,
        message: "Gagal mengambil data harga produk."
      });
    }
  }

  async function handleListProducts(parsedOrder: any, res: any) {
    try {
      let products = await storage.getProductsByCategory(parsedOrder.productType);
      
      if (parsedOrder.provider) {
        products = products.filter(p => 
          p.provider.toLowerCase().includes(parsedOrder.provider.toLowerCase())
        );
      }

      if (products.length === 0) {
        return res.json({
          success: false,
          message: `Tidak ada produk ${parsedOrder.productType} ${parsedOrder.provider || ''} yang tersedia.`
        });
      }

      // Group by provider
      const providerGroups = products.reduce((acc: any, product: any) => {
        if (!acc[product.provider]) {
          acc[product.provider] = [];
        }
        acc[product.provider].push(product);
        return acc;
      }, {});

      let message = `📋 **Produk ${parsedOrder.productType.toUpperCase()} Tersedia:**\n\n`;
      
      Object.keys(providerGroups).slice(0, 5).forEach(provider => {
        const providerProducts = providerGroups[provider];
        message += `🏷️ **${provider.toUpperCase()}** (${providerProducts.length} produk)\n`;
        
        providerProducts.slice(0, 3).forEach((product: any) => {
          const totalPrice = product.price + product.adminFee;
          message += `   • Rp ${product.price.toLocaleString('id-ID')} (Total: Rp ${totalPrice.toLocaleString('id-ID')})\n`;
        });
        
        if (providerProducts.length > 3) {
          message += `   • ... dan ${providerProducts.length - 3} produk lainnya\n`;
        }
        message += '\n';
      });

      message += `\n💡 Untuk cek harga detail: "Cek harga ${parsedOrder.productType} [provider]"`;

      return res.json({
        success: true,
        message
      });
    } catch (error) {
      return res.json({
        success: false,
        message: "Gagal mengambil daftar produk."
      });
    }
  }

  async function handleCheckStatus(parsedOrder: any, res: any) {
    try {
      if (!parsedOrder.transactionId) {
        return res.json({
          success: false,
          message: "ID transaksi diperlukan. Contoh: \"Status transaksi TXN123456\""
        });
      }

      const transaction = await storage.getTransactionById(parsedOrder.transactionId);
      
      if (!transaction) {
        return res.json({
          success: false,
          message: `Transaksi dengan ID ${parsedOrder.transactionId} tidak ditemukan.`
        });
      }

      let statusIcon = "⏳";
      let statusText = "Menunggu";
      
      switch (transaction.status) {
        case "completed":
          statusIcon = "✅";
          statusText = "Berhasil";
          break;
        case "failed":
          statusIcon = "❌";
          statusText = "Gagal";
          break;
        case "pending":
          statusIcon = "⏳";
          statusText = "Pending";
          break;
      }

      const message = `📊 **Status Transaksi ${transaction.id}**\n\n` +
                     `${statusIcon} **Status:** ${statusText}\n` +
                     `📱 **Produk:** ${transaction.productName}\n` +
                     `🎯 **Tujuan:** ${transaction.targetNumber}\n` +
                     `💰 **Total:** Rp ${transaction.totalAmount.toLocaleString('id-ID')}\n` +
                     `📅 **Waktu:** ${transaction.createdAt.toLocaleString('id-ID')}\n\n` +
                     (transaction.status === "pending" ? "⏳ Transaksi sedang diproses..." : "");

      return res.json({
        success: true,
        message
      });
    } catch (error) {
      return res.json({
        success: false,
        message: "Gagal mengecek status transaksi."
      });
    }
  }

  async function handleBuyProduct(parsedOrder: any, res: any) {
    try {
      if (!parsedOrder.targetNumber) {
        return res.json({
          success: false,
          message: "Nomor tujuan diperlukan untuk transaksi. Contoh: \"Beli pulsa Telkomsel 50rb untuk 081234567890\""
        });
      }

      // Find matching products
      let products = await storage.getProductsByCategory(parsedOrder.productType);
      
      if (parsedOrder.provider) {
        products = products.filter(p => 
          p.provider.toLowerCase().includes(parsedOrder.provider.toLowerCase())
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

      return res.json({
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
      return res.json({
        success: false,
        message: "Gagal memproses permintaan pembelian."
      });
    }
  }

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
