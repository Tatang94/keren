import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChatInterface from "@/components/chat-interface";
import ProductCategories from "@/components/product-categories";
import TransactionChecker from "@/components/transaction-checker";
import PaymentModal from "@/components/payment-modal";
import { Bot, Settings, MessageCircle, ShoppingCart, Search } from "lucide-react";
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

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
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
                <button 
                  onClick={() => scrollToSection('beranda')}
                  className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium"
                >
                  Beranda
                </button>
                <button 
                  onClick={() => scrollToSection('produk')}
                  className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium"
                >
                  Produk
                </button>
                <button 
                  onClick={() => scrollToSection('transaksi')}
                  className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium"
                >
                  Cek Transaksi
                </button>
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
                Bayar pulsa, token listrik, dan tagihan lainnya cukup dengan perintah suara atau chat ke AI kami. Mudah, cepat, dan aman!
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
                <Button 
                  onClick={() => scrollToSection('produk')}
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold"
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  <span className="text-white hover:text-primary">Lihat Produk</span>
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
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <MessageCircle className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Chat AI</p>
                      <p className="text-xs text-gray-600">Perintah natural</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <ShoppingCart className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">1000+ Produk</p>
                      <p className="text-xs text-gray-600">Digital terlengkap</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      onClick={() => setShowChat(true)}
                      className="w-full bg-primary hover:bg-blue-700"
                    >
                      <Bot className="mr-2 h-4 w-4" />
                      Coba Chat AI Sekarang
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section id="produk">
        <ProductCategories onCategorySelect={() => {}} />
      </section>

      {/* Transaction Status */}
      <section id="transaksi">
        <TransactionChecker />
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">PPOB AI</h3>
              <p className="text-gray-300 mb-4">
                Platform pembayaran online cerdas dengan teknologi AI untuk kemudahan transaksi digital Anda.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">
                  <i className="fab fa-facebook-f text-xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <i className="fab fa-whatsapp text-xl"></i>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Layanan</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Pulsa & Paket Data</a></li>
                <li><a href="#" className="hover:text-white">Token Listrik PLN</a></li>
                <li><a href="#" className="hover:text-white">Game Voucher</a></li>
                <li><a href="#" className="hover:text-white">E-Wallet Top Up</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Bantuan</a></li>
                <li><a href="#" className="hover:text-white">Kontak Kami</a></li>
                <li><a href="#" className="hover:text-white">Syarat & Ketentuan</a></li>
                <li><a href="#" className="hover:text-white">Kebijakan Privasi</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 PPOB AI. Semua hak dilindungi.</p>
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
