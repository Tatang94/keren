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
                                <SelectContent className="max-h-96">
                                  {/* ========== PRABAYAR ========== */}
                                  
                                  {/* === PULSA === */}
                                  <div className="font-bold text-sm text-blue-600 px-2 py-1 bg-blue-50 border-b">📱 PULSA</div>
                                  
                                  {/* Telkomsel */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">🔴 TELKOMSEL</div>
                                  <SelectItem value="Beli pulsa Telkomsel 5rb">📱 Telkomsel 5.000</SelectItem>
                                  <SelectItem value="Beli pulsa Telkomsel 10rb">📱 Telkomsel 10.000</SelectItem>
                                  <SelectItem value="Beli pulsa Telkomsel 15rb">📱 Telkomsel 15.000</SelectItem>
                                  <SelectItem value="Beli pulsa Telkomsel 20rb">📱 Telkomsel 20.000</SelectItem>
                                  <SelectItem value="Beli pulsa Telkomsel 25rb">📱 Telkomsel 25.000</SelectItem>
                                  <SelectItem value="Beli pulsa Telkomsel 50rb">📱 Telkomsel 50.000</SelectItem>
                                  <SelectItem value="Beli pulsa Telkomsel 100rb">📱 Telkomsel 100.000</SelectItem>
                                  
                                  {/* Indosat */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">🟡 INDOSAT</div>
                                  <SelectItem value="Beli pulsa Indosat 5rb">📱 Indosat 5.000</SelectItem>
                                  <SelectItem value="Beli pulsa Indosat 10rb">📱 Indosat 10.000</SelectItem>
                                  <SelectItem value="Beli pulsa Indosat 15rb">📱 Indosat 15.000</SelectItem>
                                  <SelectItem value="Beli pulsa Indosat 20rb">📱 Indosat 20.000</SelectItem>
                                  <SelectItem value="Beli pulsa Indosat 25rb">📱 Indosat 25.000</SelectItem>
                                  <SelectItem value="Beli pulsa Indosat 50rb">📱 Indosat 50.000</SelectItem>
                                  <SelectItem value="Beli pulsa Indosat 100rb">📱 Indosat 100.000</SelectItem>
                                  
                                  {/* XL Axiata */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">🔵 XL AXIATA</div>
                                  <SelectItem value="Beli pulsa XL 5rb">📱 XL 5.000</SelectItem>
                                  <SelectItem value="Beli pulsa XL 10rb">📱 XL 10.000</SelectItem>
                                  <SelectItem value="Beli pulsa XL 15rb">📱 XL 15.000</SelectItem>
                                  <SelectItem value="Beli pulsa XL 25rb">📱 XL 25.000</SelectItem>
                                  <SelectItem value="Beli pulsa XL 50rb">📱 XL 50.000</SelectItem>
                                  <SelectItem value="Beli pulsa XL 100rb">📱 XL 100.000</SelectItem>
                                  
                                  {/* Tri */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">⚫ TRI</div>
                                  <SelectItem value="Beli pulsa Tri 5rb">📱 Tri 5.000</SelectItem>
                                  <SelectItem value="Beli pulsa Tri 10rb">📱 Tri 10.000</SelectItem>
                                  <SelectItem value="Beli pulsa Tri 15rb">📱 Tri 15.000</SelectItem>
                                  <SelectItem value="Beli pulsa Tri 25rb">📱 Tri 25.000</SelectItem>
                                  <SelectItem value="Beli pulsa Tri 50rb">📱 Tri 50.000</SelectItem>
                                  <SelectItem value="Beli pulsa Tri 100rb">📱 Tri 100.000</SelectItem>
                                  
                                  {/* Smartfren */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">🟣 SMARTFREN</div>
                                  <SelectItem value="Beli pulsa Smartfren 5rb">📱 Smartfren 5.000</SelectItem>
                                  <SelectItem value="Beli pulsa Smartfren 10rb">📱 Smartfren 10.000</SelectItem>
                                  <SelectItem value="Beli pulsa Smartfren 20rb">📱 Smartfren 20.000</SelectItem>
                                  <SelectItem value="Beli pulsa Smartfren 25rb">📱 Smartfren 25.000</SelectItem>
                                  <SelectItem value="Beli pulsa Smartfren 50rb">📱 Smartfren 50.000</SelectItem>
                                  <SelectItem value="Beli pulsa Smartfren 100rb">📱 Smartfren 100.000</SelectItem>
                                  
                                  {/* Axis */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">🟢 AXIS</div>
                                  <SelectItem value="Beli pulsa Axis 5rb">📱 Axis 5.000</SelectItem>
                                  <SelectItem value="Beli pulsa Axis 10rb">📱 Axis 10.000</SelectItem>
                                  <SelectItem value="Beli pulsa Axis 15rb">📱 Axis 15.000</SelectItem>
                                  <SelectItem value="Beli pulsa Axis 25rb">📱 Axis 25.000</SelectItem>
                                  <SelectItem value="Beli pulsa Axis 50rb">📱 Axis 50.000</SelectItem>
                                  <SelectItem value="Beli pulsa Axis 100rb">📱 Axis 100.000</SelectItem>
                                  
                                  {/* by.U */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">🔶 by.U</div>
                                  <SelectItem value="Beli pulsa byU 10rb">📱 by.U 10.000</SelectItem>
                                  <SelectItem value="Beli pulsa byU 25rb">📱 by.U 25.000</SelectItem>
                                  <SelectItem value="Beli pulsa byU 50rb">📱 by.U 50.000</SelectItem>
                                  <SelectItem value="Beli pulsa byU 100rb">📱 by.U 100.000</SelectItem>
                                  
                                  {/* === DATA/INTERNET === */}
                                  <div className="font-bold text-sm text-green-600 px-2 py-1 bg-green-50 border-b border-t">📶 DATA / INTERNET</div>
                                  
                                  {/* Telkomsel Data */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">🔴 TELKOMSEL</div>
                                  <SelectItem value="Beli data Telkomsel 1GB">📶 Telkomsel 1GB</SelectItem>
                                  <SelectItem value="Beli data Telkomsel 2GB">📶 Telkomsel 2GB</SelectItem>
                                  <SelectItem value="Beli data Telkomsel 3GB">📶 Telkomsel 3GB</SelectItem>
                                  <SelectItem value="Beli data Telkomsel 5GB">📶 Telkomsel 5GB</SelectItem>
                                  <SelectItem value="Beli data Telkomsel 8GB">📶 Telkomsel 8GB</SelectItem>
                                  <SelectItem value="Beli data Telkomsel 15GB">📶 Telkomsel 15GB</SelectItem>
                                  <SelectItem value="Beli data Telkomsel 25GB">📶 Telkomsel 25GB</SelectItem>
                                  <SelectItem value="Beli data Telkomsel 50GB">📶 Telkomsel 50GB</SelectItem>
                                  
                                  {/* Indosat Data */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">🟡 INDOSAT</div>
                                  <SelectItem value="Beli data Indosat 1GB">📶 Indosat 1GB</SelectItem>
                                  <SelectItem value="Beli data Indosat 2GB">📶 Indosat 2GB</SelectItem>
                                  <SelectItem value="Beli data Indosat 3GB">📶 Indosat 3GB</SelectItem>
                                  <SelectItem value="Beli data Indosat 5GB">📶 Indosat 5GB</SelectItem>
                                  <SelectItem value="Beli data Indosat 8GB">📶 Indosat 8GB</SelectItem>
                                  <SelectItem value="Beli data Indosat 15GB">📶 Indosat 15GB</SelectItem>
                                  <SelectItem value="Beli data Indosat 25GB">📶 Indosat 25GB</SelectItem>
                                  
                                  {/* XL Data */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">🔵 XL AXIATA</div>
                                  <SelectItem value="Beli data XL 1GB">📶 XL 1GB</SelectItem>
                                  <SelectItem value="Beli data XL 2GB">📶 XL 2GB</SelectItem>
                                  <SelectItem value="Beli data XL 3GB">📶 XL 3GB</SelectItem>
                                  <SelectItem value="Beli data XL 5GB">📶 XL 5GB</SelectItem>
                                  <SelectItem value="Beli data XL 8GB">📶 XL 8GB</SelectItem>
                                  <SelectItem value="Beli data XL 15GB">📶 XL 15GB</SelectItem>
                                  
                                  {/* Tri Data */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">⚫ TRI</div>
                                  <SelectItem value="Beli data Tri 1GB">📶 Tri 1GB</SelectItem>
                                  <SelectItem value="Beli data Tri 2GB">📶 Tri 2GB</SelectItem>
                                  <SelectItem value="Beli data Tri 3GB">📶 Tri 3GB</SelectItem>
                                  <SelectItem value="Beli data Tri 5GB">📶 Tri 5GB</SelectItem>
                                  <SelectItem value="Beli data Tri 8GB">📶 Tri 8GB</SelectItem>
                                  <SelectItem value="Beli data Tri 15GB">📶 Tri 15GB</SelectItem>
                                  
                                  {/* === GAMES & VOUCHER === */}
                                  <div className="font-bold text-sm text-purple-600 px-2 py-1 bg-purple-50 border-b border-t">🎮 GAMES & VOUCHER</div>
                                  
                                  {/* Mobile Legends */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">🎮 MOBILE LEGENDS</div>
                                  <SelectItem value="Beli diamond Mobile Legends 86">🎮 ML 86 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Mobile Legends 172">🎮 ML 172 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Mobile Legends 257">🎮 ML 257 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Mobile Legends 344">🎮 ML 344 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Mobile Legends 429">🎮 ML 429 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Mobile Legends 514">🎮 ML 514 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Mobile Legends 706">🎮 ML 706 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Mobile Legends 878">🎮 ML 878 Diamond</SelectItem>
                                  
                                  {/* Free Fire */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">🔥 FREE FIRE</div>
                                  <SelectItem value="Beli diamond Free Fire 70">🔥 FF 70 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Free Fire 140">🔥 FF 140 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Free Fire 210">🔥 FF 210 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Free Fire 355">🔥 FF 355 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Free Fire 720">🔥 FF 720 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Free Fire 1450">🔥 FF 1450 Diamond</SelectItem>
                                  
                                  {/* PUBG Mobile */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">🎯 PUBG MOBILE</div>
                                  <SelectItem value="Beli UC PUBG 60">🎯 PUBG 60 UC</SelectItem>
                                  <SelectItem value="Beli UC PUBG 300">🎯 PUBG 300 UC</SelectItem>
                                  <SelectItem value="Beli UC PUBG 600">🎯 PUBG 600 UC</SelectItem>
                                  <SelectItem value="Beli UC PUBG 1500">🎯 PUBG 1500 UC</SelectItem>
                                  <SelectItem value="Beli UC PUBG 3000">🎯 PUBG 3000 UC</SelectItem>
                                  
                                  {/* Genshin Impact */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">⭐ GENSHIN IMPACT</div>
                                  <SelectItem value="Beli Genesis Crystal 60">⭐ Genshin 60 Genesis</SelectItem>
                                  <SelectItem value="Beli Genesis Crystal 300">⭐ Genshin 300 Genesis</SelectItem>
                                  <SelectItem value="Beli Genesis Crystal 980">⭐ Genshin 980 Genesis</SelectItem>
                                  <SelectItem value="Beli Genesis Crystal 1980">⭐ Genshin 1980 Genesis</SelectItem>
                                  
                                  {/* Steam */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">💨 STEAM</div>
                                  <SelectItem value="Beli voucher Steam 60rb">💨 Steam 60.000</SelectItem>
                                  <SelectItem value="Beli voucher Steam 120rb">💨 Steam 120.000</SelectItem>
                                  <SelectItem value="Beli voucher Steam 250rb">💨 Steam 250.000</SelectItem>
                                  <SelectItem value="Beli voucher Steam 400rb">💨 Steam 400.000</SelectItem>
                                  
                                  {/* Google Play */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">📱 GOOGLE PLAY</div>
                                  <SelectItem value="Beli voucher Google Play 10rb">📱 GP 10.000</SelectItem>
                                  <SelectItem value="Beli voucher Google Play 25rb">📱 GP 25.000</SelectItem>
                                  <SelectItem value="Beli voucher Google Play 50rb">📱 GP 50.000</SelectItem>
                                  <SelectItem value="Beli voucher Google Play 100rb">📱 GP 100.000</SelectItem>
                                  <SelectItem value="Beli voucher Google Play 150rb">📱 GP 150.000</SelectItem>
                                  
                                  {/* === E-MONEY === */}
                                  <div className="font-bold text-sm text-orange-600 px-2 py-1 bg-orange-50 border-b border-t">💳 E-MONEY</div>
                                  
                                  {/* GoPay */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">💚 GOPAY</div>
                                  <SelectItem value="Beli GoPay 10rb">💚 GoPay 10.000</SelectItem>
                                  <SelectItem value="Beli GoPay 20rb">💚 GoPay 20.000</SelectItem>
                                  <SelectItem value="Beli GoPay 25rb">💚 GoPay 25.000</SelectItem>
                                  <SelectItem value="Beli GoPay 50rb">💚 GoPay 50.000</SelectItem>
                                  <SelectItem value="Beli GoPay 100rb">💚 GoPay 100.000</SelectItem>
                                  <SelectItem value="Beli GoPay 200rb">💚 GoPay 200.000</SelectItem>
                                  
                                  {/* OVO */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">💜 OVO</div>
                                  <SelectItem value="Beli OVO 10rb">💜 OVO 10.000</SelectItem>
                                  <SelectItem value="Beli OVO 20rb">💜 OVO 20.000</SelectItem>
                                  <SelectItem value="Beli OVO 25rb">💜 OVO 25.000</SelectItem>
                                  <SelectItem value="Beli OVO 50rb">💜 OVO 50.000</SelectItem>
                                  <SelectItem value="Beli OVO 100rb">💜 OVO 100.000</SelectItem>
                                  <SelectItem value="Beli OVO 200rb">💜 OVO 200.000</SelectItem>
                                  
                                  {/* DANA */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">💙 DANA</div>
                                  <SelectItem value="Beli DANA 10rb">💙 DANA 10.000</SelectItem>
                                  <SelectItem value="Beli DANA 20rb">💙 DANA 20.000</SelectItem>
                                  <SelectItem value="Beli DANA 25rb">💙 DANA 25.000</SelectItem>
                                  <SelectItem value="Beli DANA 50rb">💙 DANA 50.000</SelectItem>
                                  <SelectItem value="Beli DANA 100rb">💙 DANA 100.000</SelectItem>
                                  <SelectItem value="Beli DANA 200rb">💙 DANA 200.000</SelectItem>
                                  
                                  {/* ShopeePay */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">🧡 SHOPEEPAY</div>
                                  <SelectItem value="Beli ShopeePay 10rb">🧡 ShopeePay 10.000</SelectItem>
                                  <SelectItem value="Beli ShopeePay 25rb">🧡 ShopeePay 25.000</SelectItem>
                                  <SelectItem value="Beli ShopeePay 50rb">🧡 ShopeePay 50.000</SelectItem>
                                  <SelectItem value="Beli ShopeePay 100rb">🧡 ShopeePay 100.000</SelectItem>
                                  <SelectItem value="Beli ShopeePay 200rb">🧡 ShopeePay 200.000</SelectItem>
                                  
                                  {/* LinkAja */}
                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">❤️ LINKAJA</div>
                                  <SelectItem value="Beli LinkAja 10rb">❤️ LinkAja 10.000</SelectItem>
                                  <SelectItem value="Beli LinkAja 20rb">❤️ LinkAja 20.000</SelectItem>
                                  <SelectItem value="Beli LinkAja 50rb">❤️ LinkAja 50.000</SelectItem>
                                  <SelectItem value="Beli LinkAja 100rb">❤️ LinkAja 100.000</SelectItem>
                                  
                                  {/* === PLN === */}
                                  <div className="font-bold text-sm text-yellow-600 px-2 py-1 bg-yellow-50 border-b border-t">⚡ TOKEN PLN</div>
                                  <SelectItem value="Beli token PLN 20rb">⚡ PLN 20.000</SelectItem>
                                  <SelectItem value="Beli token PLN 50rb">⚡ PLN 50.000</SelectItem>
                                  <SelectItem value="Beli token PLN 100rb">⚡ PLN 100.000</SelectItem>
                                  <SelectItem value="Beli token PLN 200rb">⚡ PLN 200.000</SelectItem>
                                  <SelectItem value="Beli token PLN 500rb">⚡ PLN 500.000</SelectItem>
                                  <SelectItem value="Beli token PLN 1jt">⚡ PLN 1.000.000</SelectItem>
                                  
                                  {/* === STREAMING & TV === */}
                                  <div className="font-bold text-sm text-red-600 px-2 py-1 bg-red-50 border-b border-t">📺 STREAMING & TV</div>
                                  <SelectItem value="Beli Netflix 1 bulan">📺 Netflix 1 Bulan</SelectItem>
                                  <SelectItem value="Beli Disney+ 1 bulan">📺 Disney+ 1 Bulan</SelectItem>
                                  <SelectItem value="Beli Spotify Premium 1 bulan">🎵 Spotify 1 Bulan</SelectItem>
                                  <SelectItem value="Beli YouTube Premium 1 bulan">📺 YouTube Premium</SelectItem>
                                  <SelectItem value="Beli Vidio Premier 1 bulan">📺 Vidio Premier</SelectItem>
                                  <SelectItem value="Beli Amazon Prime 1 bulan">📺 Amazon Prime</SelectItem>
                                  
                                  {/* ========== PASCABAYAR ========== */}
                                  <div className="font-bold text-sm text-gray-800 px-2 py-1 bg-gray-100 border-b border-t mt-2">💰 PASCABAYAR</div>
                                  
                                  {/* PLN Pascabayar */}
                                  <SelectItem value="Bayar tagihan PLN">⚡ Tagihan PLN</SelectItem>
                                  
                                  {/* PDAM */}
                                  <SelectItem value="Bayar tagihan PDAM">💧 Tagihan PDAM</SelectItem>
                                  
                                  {/* HP Pascabayar */}
                                  <SelectItem value="Bayar tagihan Telkomsel Halo">📱 Telkomsel Halo</SelectItem>
                                  <SelectItem value="Bayar tagihan Indosat Matrix">📱 Indosat Matrix</SelectItem>
                                  <SelectItem value="Bayar tagihan XL Postpaid">📱 XL Postpaid</SelectItem>
                                  
                                  {/* Internet */}
                                  <SelectItem value="Bayar tagihan IndiHome">🌐 IndiHome</SelectItem>
                                  <SelectItem value="Bayar tagihan Firstmedia">🌐 Firstmedia</SelectItem>
                                  <SelectItem value="Bayar tagihan MNC Play">🌐 MNC Play</SelectItem>
                                  <SelectItem value="Bayar tagihan Biznet">🌐 Biznet</SelectItem>
                                  
                                  {/* BPJS */}
                                  <SelectItem value="Bayar BPJS Kesehatan">🏥 BPJS Kesehatan</SelectItem>
                                  <SelectItem value="Bayar BPJS Ketenagakerjaan">👷 BPJS Ketenagakerjaan</SelectItem>
                                  
                                  {/* TV Pascabayar */}
                                  <SelectItem value="Bayar tagihan Indovision">📺 Indovision</SelectItem>
                                  <SelectItem value="Bayar tagihan Orange TV">📺 Orange TV</SelectItem>
                                  <SelectItem value="Bayar tagihan K-Vision">📺 K-Vision</SelectItem>
                                  
                                  {/* Pajak & Lainnya */}
                                  <SelectItem value="Bayar PBB">🏠 PBB</SelectItem>
                                  <SelectItem value="Bayar SAMSAT">🚗 SAMSAT</SelectItem>
                                  <SelectItem value="Bayar tagihan Gas Negara">🔥 Gas Negara</SelectItem>
                                  <SelectItem value="Bayar finance Adira">💰 Adira Finance</SelectItem>
                                  <SelectItem value="Bayar finance BAF">💰 BAF Finance</SelectItem>
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
