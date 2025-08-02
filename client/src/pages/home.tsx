import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChatInterface from "@/components/chat-interface";

import PaymentModal from "@/components/payment-modal";
import { Bot, Settings, MessageCircle, ShoppingCart } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const handleProductSelection = (productData: any) => {
    setPaymentData(productData);
    setShowPayment(true);
    setShowChat(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary">PPOB AI</h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <span className="text-gray-700 px-3 py-2 text-sm font-medium">
                  PPOB AI Platform
                </span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowChat(true)}
                className="bg-primary text-white hover:bg-blue-700"
              >
                <Bot className="mr-2 h-4 w-4" />
                Chat AI
              </Button>
              <Link href="/admin">
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="beranda" className="gradient-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Pembayaran Online dengan AI Cerdas
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Bayar pulsa, token listrik, dan tagihan lainnya cukup dengan chat ke AI kami. Mudah, cepat, dan aman!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setShowChat(true)}
                  className="bg-white text-primary hover:bg-gray-100"
                  size="lg"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Mulai Chat dengan AI
                </Button>
              </div>
            </div>
            <div className="relative">
              {/* Features Preview */}
              <Card className="bg-white text-gray-800 shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="text-white h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">AI Powered PPOB</h3>
                    <p className="text-gray-600">Transaksi dengan perintah natural</p>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="text-left p-4 bg-blue-50 rounded-lg">
                      <MessageCircle className="h-6 w-6 text-primary mb-2" />
                      <p className="text-sm font-medium">💬 Chat AI untuk semua kebutuhan PPOB</p>
                      <p className="text-xs text-gray-600">Cek harga, list produk, transaksi, dan status</p>
                    </div>
                    <div className="text-left p-4 bg-green-50 rounded-lg">
                      <ShoppingCart className="h-6 w-6 text-green-600 mb-2" />
                      <p className="text-sm font-medium">🛒 1157+ Produk dari Digiflazz</p>
                      <p className="text-xs text-gray-600">Pulsa, Token PLN, Game, E-wallet</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">💡 Contoh perintah:</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>• "Cek harga pulsa Telkomsel"</p>
                      <p>• "Beli pulsa XL 25rb untuk 081234567890"</p>
                      <p>• "List voucher Mobile Legends"</p>
                    </div>
                    <Button 
                      onClick={() => setShowChat(true)}
                      className="w-full bg-primary hover:bg-blue-700 mt-4"
                    >
                      <Bot className="mr-2 h-4 w-4" />
                      Mulai Chat AI
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>



      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Fitur Chat AI Digiflazz</h3>
            <p className="text-xl text-gray-600">Semua kebutuhan PPOB dengan AI pintar</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Cek Harga</h4>
              <p className="text-gray-600 text-sm mb-4">Lihat harga semua produk digital terbaru</p>
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                "Cek harga pulsa Telkomsel"
              </div>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Transaksi</h4>
              <p className="text-gray-600 text-sm mb-4">Beli produk digital dengan mudah</p>
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                "Beli pulsa XL 25rb untuk 081234567890"
              </div>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">List Produk</h4>
              <p className="text-gray-600 text-sm mb-4">Daftar semua produk tersedia</p>
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                "List voucher Mobile Legends"
              </div>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Cek Status</h4>
              <p className="text-gray-600 text-sm mb-4">Status transaksi real-time</p>
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                "Status transaksi TXN123456"
              </div>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => setShowChat(true)}
              className="bg-primary hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              <Bot className="mr-3 h-5 w-5" />
              Mulai Chat AI Sekarang
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-300">
            <p>&copy; 2024. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button 
          onClick={() => setShowChat(true)}
          className="w-16 h-16 rounded-full shadow-lg bg-primary hover:bg-blue-700 hover:scale-110 transition-all duration-300"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Modals */}
      <ChatInterface 
        isOpen={showChat} 
        onClose={() => setShowChat(false)}
        onProductSelect={handleProductSelection}
      />
      
      <PaymentModal 
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        paymentData={paymentData}
      />
    </div>
  );
}
