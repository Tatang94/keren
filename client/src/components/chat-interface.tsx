import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, User, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
  productData?: any;
  showDropdownForm?: boolean;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSelect: (productData: any) => void;
}

export default function ChatInterface({ isOpen, onClose, onProductSelect }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      message: 'Halo! Saya siap membantu pembelian pulsa, token listrik, dan voucher game.\n\nSilakan pilih produk dan masukkan nomor tujuan di form di bawah ini:',
      timestamp: new Date(),
      showDropdownForm: true
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedCommand, setSelectedCommand] = useState('');
  const [customNumber, setCustomNumber] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processChatMutation = useMutation({
    mutationFn: async (command: string) => {
      const response = await apiRequest('POST', '/api/chat/process', { command });
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        message: data.message,
        timestamp: new Date(),
        productData: data.productData
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onError: (error) => {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        message: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: "Error",
        description: "Gagal memproses perintah",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: input,
      timestamp: new Date()
    };

    console.log('Sending message:', input);
    setMessages(prev => [...prev, userMessage]);
    processChatMutation.mutate(input);
    setInput('');
  };

  const handleConfirmPayment = (productData: any) => {
    onProductSelect(productData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (command: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: command,
      timestamp: new Date()
    };

    console.log('Sending message:', command);
    setMessages(prev => [...prev, userMessage]);
    processChatMutation.mutate(command);
  };

  const handleDropdownCommand = () => {
    if (!selectedCommand || !customNumber.trim()) {
      toast({
        title: "Lengkapi Data",
        description: "Pilih jenis produk dan masukkan nomor tujuan",
        variant: "destructive"
      });
      return;
    }

    const fullCommand = `${selectedCommand} untuk ${customNumber}`;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: fullCommand,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    processChatMutation.mutate(fullCommand);
    setSelectedCommand('');
    setCustomNumber('');
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh] h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Bot className="text-white h-6 w-6" />
            </div>
            <div className="ml-4">
              <DialogTitle className="text-lg font-semibold">AI Assistant PPOB</DialogTitle>
              <span className="text-sm text-green-500 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Siap membantu Anda
              </span>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 p-6 overflow-y-auto chat-scroll">
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="flex">
                <div className={`rounded-lg px-6 py-4 max-w-2xl whitespace-pre-wrap ${
                  message.type === 'user' 
                    ? 'chat-message-user ml-auto bg-primary text-white' 
                    : 'chat-message-ai bg-gray-100 text-gray-900'
                }`}>
                  <div className="flex items-start space-x-2">
                    {message.type === 'ai' && (
                      <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    {message.type === 'user' && (
                      <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-base leading-relaxed">{message.message}</p>
                      
                      {/* Dropdown Form dalam chat AI */}
                      {message.showDropdownForm && (
                        <div className="mt-4 p-3 bg-white rounded-md border border-gray-200 shadow-sm">
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">
                                🛒 Pilih Produk:
                              </label>
                              <Select value={selectedCommand} onValueChange={setSelectedCommand}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Pilih produk yang ingin dibeli..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {/* === PRABAYAR === */}
                                  {/* Pulsa */}
                                  <SelectItem value="Beli pulsa Telkomsel 5rb">📱 Pulsa Telkomsel 5.000</SelectItem>
                                  <SelectItem value="Beli pulsa Telkomsel 10rb">📱 Pulsa Telkomsel 10.000</SelectItem>
                                  <SelectItem value="Beli pulsa Telkomsel 25rb">📱 Pulsa Telkomsel 25.000</SelectItem>
                                  <SelectItem value="Beli pulsa Telkomsel 50rb">📱 Pulsa Telkomsel 50.000</SelectItem>
                                  <SelectItem value="Beli pulsa Telkomsel 100rb">📱 Pulsa Telkomsel 100.000</SelectItem>
                                  
                                  <SelectItem value="Beli pulsa Indosat 5rb">📱 Pulsa Indosat 5.000</SelectItem>
                                  <SelectItem value="Beli pulsa Indosat 10rb">📱 Pulsa Indosat 10.000</SelectItem>
                                  <SelectItem value="Beli pulsa Indosat 25rb">📱 Pulsa Indosat 25.000</SelectItem>
                                  <SelectItem value="Beli pulsa Indosat 50rb">📱 Pulsa Indosat 50.000</SelectItem>
                                  <SelectItem value="Beli pulsa Indosat 100rb">📱 Pulsa Indosat 100.000</SelectItem>
                                  
                                  <SelectItem value="Beli pulsa XL 5rb">📱 Pulsa XL 5.000</SelectItem>
                                  <SelectItem value="Beli pulsa XL 10rb">📱 Pulsa XL 10.000</SelectItem>
                                  <SelectItem value="Beli pulsa XL 25rb">📱 Pulsa XL 25.000</SelectItem>
                                  <SelectItem value="Beli pulsa XL 50rb">📱 Pulsa XL 50.000</SelectItem>
                                  <SelectItem value="Beli pulsa XL 100rb">📱 Pulsa XL 100.000</SelectItem>
                                  
                                  <SelectItem value="Beli pulsa Tri 5rb">📱 Pulsa Tri 5.000</SelectItem>
                                  <SelectItem value="Beli pulsa Tri 10rb">📱 Pulsa Tri 10.000</SelectItem>
                                  <SelectItem value="Beli pulsa Tri 25rb">📱 Pulsa Tri 25.000</SelectItem>
                                  <SelectItem value="Beli pulsa Tri 50rb">📱 Pulsa Tri 50.000</SelectItem>
                                  
                                  <SelectItem value="Beli pulsa Smartfren 5rb">📱 Pulsa Smartfren 5.000</SelectItem>
                                  <SelectItem value="Beli pulsa Smartfren 10rb">📱 Pulsa Smartfren 10.000</SelectItem>
                                  <SelectItem value="Beli pulsa Smartfren 25rb">📱 Pulsa Smartfren 25.000</SelectItem>
                                  <SelectItem value="Beli pulsa Smartfren 50rb">📱 Pulsa Smartfren 50.000</SelectItem>
                                  
                                  <SelectItem value="Beli pulsa Axis 5rb">📱 Pulsa Axis 5.000</SelectItem>
                                  <SelectItem value="Beli pulsa Axis 10rb">📱 Pulsa Axis 10.000</SelectItem>
                                  <SelectItem value="Beli pulsa Axis 25rb">📱 Pulsa Axis 25.000</SelectItem>
                                  <SelectItem value="Beli pulsa Axis 50rb">📱 Pulsa Axis 50.000</SelectItem>
                                  
                                  {/* Data/Internet */}
                                  <SelectItem value="Beli data Telkomsel 1GB">📶 Data Telkomsel 1GB</SelectItem>
                                  <SelectItem value="Beli data Telkomsel 3GB">📶 Data Telkomsel 3GB</SelectItem>
                                  <SelectItem value="Beli data Telkomsel 8GB">📶 Data Telkomsel 8GB</SelectItem>
                                  <SelectItem value="Beli data Telkomsel 15GB">📶 Data Telkomsel 15GB</SelectItem>
                                  
                                  <SelectItem value="Beli data Indosat 1GB">📶 Data Indosat 1GB</SelectItem>
                                  <SelectItem value="Beli data Indosat 3GB">📶 Data Indosat 3GB</SelectItem>
                                  <SelectItem value="Beli data Indosat 8GB">📶 Data Indosat 8GB</SelectItem>
                                  
                                  <SelectItem value="Beli data XL 1GB">📶 Data XL 1GB</SelectItem>
                                  <SelectItem value="Beli data XL 3GB">📶 Data XL 3GB</SelectItem>
                                  <SelectItem value="Beli data XL 8GB">📶 Data XL 8GB</SelectItem>
                                  
                                  <SelectItem value="Beli data Tri 1GB">📶 Data Tri 1GB</SelectItem>
                                  <SelectItem value="Beli data Tri 3GB">📶 Data Tri 3GB</SelectItem>
                                  <SelectItem value="Beli data Tri 8GB">📶 Data Tri 8GB</SelectItem>
                                  
                                  {/* Games & Voucher */}
                                  <SelectItem value="Beli diamond Mobile Legends 86">🎮 Mobile Legends 86 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Mobile Legends 172">🎮 Mobile Legends 172 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Mobile Legends 344">🎮 Mobile Legends 344 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Mobile Legends 720">🎮 Mobile Legends 720 Diamond</SelectItem>
                                  
                                  <SelectItem value="Beli diamond Free Fire 70">🎮 Free Fire 70 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Free Fire 140">🎮 Free Fire 140 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Free Fire 355">🎮 Free Fire 355 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Free Fire 720">🎮 Free Fire 720 Diamond</SelectItem>
                                  
                                  <SelectItem value="Beli UC PUBG 60">🎮 PUBG Mobile 60 UC</SelectItem>
                                  <SelectItem value="Beli UC PUBG 300">🎮 PUBG Mobile 300 UC</SelectItem>
                                  <SelectItem value="Beli UC PUBG 600">🎮 PUBG Mobile 600 UC</SelectItem>
                                  
                                  <SelectItem value="Beli Robux Roblox 80">🎮 Roblox 80 Robux</SelectItem>
                                  <SelectItem value="Beli Robux Roblox 400">🎮 Roblox 400 Robux</SelectItem>
                                  <SelectItem value="Beli Robux Roblox 800">🎮 Roblox 800 Robux</SelectItem>
                                  
                                  <SelectItem value="Beli voucher Steam 60rb">🎮 Steam Wallet 60.000</SelectItem>
                                  <SelectItem value="Beli voucher Steam 120rb">🎮 Steam Wallet 120.000</SelectItem>
                                  <SelectItem value="Beli voucher Steam 250rb">🎮 Steam Wallet 250.000</SelectItem>
                                  
                                  <SelectItem value="Beli voucher Google Play 25rb">🎮 Google Play 25.000</SelectItem>
                                  <SelectItem value="Beli voucher Google Play 50rb">🎮 Google Play 50.000</SelectItem>
                                  <SelectItem value="Beli voucher Google Play 100rb">🎮 Google Play 100.000</SelectItem>
                                  
                                  {/* E-Money */}
                                  <SelectItem value="Beli GoPay 25rb">💳 GoPay 25.000</SelectItem>
                                  <SelectItem value="Beli GoPay 50rb">💳 GoPay 50.000</SelectItem>
                                  <SelectItem value="Beli GoPay 100rb">💳 GoPay 100.000</SelectItem>
                                  <SelectItem value="Beli GoPay 200rb">💳 GoPay 200.000</SelectItem>
                                  
                                  <SelectItem value="Beli OVO 25rb">💳 OVO 25.000</SelectItem>
                                  <SelectItem value="Beli OVO 50rb">💳 OVO 50.000</SelectItem>
                                  <SelectItem value="Beli OVO 100rb">💳 OVO 100.000</SelectItem>
                                  <SelectItem value="Beli OVO 200rb">💳 OVO 200.000</SelectItem>
                                  
                                  <SelectItem value="Beli DANA 25rb">💳 DANA 25.000</SelectItem>
                                  <SelectItem value="Beli DANA 50rb">💳 DANA 50.000</SelectItem>
                                  <SelectItem value="Beli DANA 100rb">💳 DANA 100.000</SelectItem>
                                  <SelectItem value="Beli DANA 200rb">💳 DANA 200.000</SelectItem>
                                  
                                  <SelectItem value="Beli ShopeePay 25rb">💳 ShopeePay 25.000</SelectItem>
                                  <SelectItem value="Beli ShopeePay 50rb">💳 ShopeePay 50.000</SelectItem>
                                  <SelectItem value="Beli ShopeePay 100rb">💳 ShopeePay 100.000</SelectItem>
                                  
                                  {/* PLN Prabayar */}
                                  <SelectItem value="Beli token PLN 20rb">⚡ Token PLN 20.000</SelectItem>
                                  <SelectItem value="Beli token PLN 50rb">⚡ Token PLN 50.000</SelectItem>
                                  <SelectItem value="Beli token PLN 100rb">⚡ Token PLN 100.000</SelectItem>
                                  <SelectItem value="Beli token PLN 200rb">⚡ Token PLN 200.000</SelectItem>
                                  <SelectItem value="Beli token PLN 500rb">⚡ Token PLN 500.000</SelectItem>
                                  
                                  {/* Streaming & TV */}
                                  <SelectItem value="Beli Netflix 1 bulan">📺 Netflix 1 Bulan</SelectItem>
                                  <SelectItem value="Beli Disney+ 1 bulan">📺 Disney+ 1 Bulan</SelectItem>
                                  <SelectItem value="Beli Spotify Premium 1 bulan">🎵 Spotify Premium 1 Bulan</SelectItem>
                                  <SelectItem value="Beli YouTube Premium 1 bulan">📺 YouTube Premium 1 Bulan</SelectItem>
                                  <SelectItem value="Beli Vidio Premier 1 bulan">📺 Vidio Premier 1 Bulan</SelectItem>
                                  
                                  {/* Paket SMS & Telpon */}
                                  <SelectItem value="Beli paket nelpon Telkomsel 100 menit">📞 Telkomsel Nelpon 100 Menit</SelectItem>
                                  <SelectItem value="Beli paket nelpon Indosat 100 menit">📞 Indosat Nelpon 100 Menit</SelectItem>
                                  <SelectItem value="Beli paket SMS Telkomsel 1000 SMS">💬 Telkomsel 1000 SMS</SelectItem>
                                  
                                  {/* === PASCABAYAR === */}
                                  {/* PLN Pascabayar */}
                                  <SelectItem value="Bayar tagihan PLN">⚡ Tagihan PLN Pascabayar</SelectItem>
                                  
                                  {/* PDAM */}
                                  <SelectItem value="Bayar tagihan PDAM">💧 Tagihan PDAM</SelectItem>
                                  
                                  {/* HP Pascabayar */}
                                  <SelectItem value="Bayar tagihan Telkomsel Halo">📱 Telkomsel Halo</SelectItem>
                                  <SelectItem value="Bayar tagihan Indosat Matrix">📱 Indosat Matrix</SelectItem>
                                  <SelectItem value="Bayar tagihan XL Postpaid">📱 XL Postpaid</SelectItem>
                                  
                                  {/* Internet Pascabayar */}
                                  <SelectItem value="Bayar tagihan IndiHome">🌐 IndiHome</SelectItem>
                                  <SelectItem value="Bayar tagihan Firstmedia">🌐 Firstmedia</SelectItem>
                                  <SelectItem value="Bayar tagihan MNC Play">🌐 MNC Play</SelectItem>
                                  <SelectItem value="Bayar tagihan Biznet">🌐 Biznet</SelectItem>
                                  
                                  {/* BPJS */}
                                  <SelectItem value="Bayar BPJS Kesehatan">🏥 BPJS Kesehatan</SelectItem>
                                  <SelectItem value="Bayar BPJS Ketenagakerjaan">👷 BPJS Ketenagakerjaan</SelectItem>
                                  
                                  {/* Asuransi & Multifinance */}
                                  <SelectItem value="Bayar asuransi FWD">🛡️ FWD Insurance</SelectItem>
                                  <SelectItem value="Bayar finance Adira">💰 Adira Finance</SelectItem>
                                  <SelectItem value="Bayar finance BAF">💰 BAF Finance</SelectItem>
                                  
                                  {/* TV Pascabayar */}
                                  <SelectItem value="Bayar tagihan Indovision">📺 Indovision</SelectItem>
                                  <SelectItem value="Bayar tagihan Orange TV">📺 Orange TV</SelectItem>
                                  <SelectItem value="Bayar tagihan K-Vision">📺 K-Vision</SelectItem>
                                  
                                  {/* Pajak & PBB */}
                                  <SelectItem value="Bayar PBB">🏠 PBB (Pajak Bumi Bangunan)</SelectItem>
                                  <SelectItem value="Bayar SAMSAT">🚗 SAMSAT</SelectItem>
                                  
                                  {/* Gas */}
                                  <SelectItem value="Bayar tagihan Gas Negara">🔥 Gas Negara (PGN)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">
                                📱 Nomor Tujuan:
                              </label>
                              <Input
                                value={customNumber}
                                onChange={(e) => setCustomNumber(e.target.value)}
                                placeholder="Masukkan nomor HP/ID tujuan (contoh: 081234567890)"
                                className="w-full"
                                disabled={processChatMutation.isPending}
                              />
                            </div>

                            <Button 
                              onClick={handleDropdownCommand}
                              disabled={!selectedCommand || !customNumber.trim() || processChatMutation.isPending}
                              className="w-full bg-primary hover:bg-blue-700"
                              size="sm"
                            >
                              <Send className="h-3 w-3 mr-2" />
                              Proses Transaksi
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {message.productData && (
                        <div className="mt-3 space-y-2">
                          <Button 
                            size="sm" 
                            className="w-full bg-primary hover:bg-blue-700"
                            onClick={() => handleConfirmPayment(message.productData)}
                          >
                            Lanjutkan Pembayaran
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {processChatMutation.isPending && (
              <div className="flex">
                <div className="chat-message-ai rounded-lg px-6 py-4 max-w-2xl">
                  <div className="flex items-center space-x-3">
                    <Bot className="h-5 w-5 text-primary" />
                    <span className="text-base text-gray-600">AI sedang memproses...</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200">
          {/* Tambahan: Tombol Quick Browse */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Lihat katalog produk lengkap:</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7"
                onClick={() => handleQuickAction("List semua pulsa")}
                disabled={processChatMutation.isPending}
              >
                📱 Semua Pulsa
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7"
                onClick={() => handleQuickAction("List semua data")}
                disabled={processChatMutation.isPending}
              >
                📶 Semua Data
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7"
                onClick={() => handleQuickAction("List semua games")}
                disabled={processChatMutation.isPending}
              >
                🎮 Games
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
