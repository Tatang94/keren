import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, User, Send } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
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

  // Fetch real products from API
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Group products by category and provider for dropdown
  const groupedProducts = React.useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return {};
    
    const groups: Record<string, Record<string, any[]>> = {};
    
    products.forEach((product: any) => {
      const category = product.category || 'others';
      const provider = product.provider || 'unknown';
      
      if (!groups[category]) groups[category] = {};
      if (!groups[category][provider]) groups[category][provider] = [];
      
      groups[category][provider].push(product);
    });
    
    // Sort products within each provider by price
    Object.keys(groups).forEach(category => {
      Object.keys(groups[category]).forEach(provider => {
        groups[category][provider].sort((a, b) => a.price - b.price);
      });
    });
    
    return groups;
  }, [products]);

  // Helper functions for category and provider configuration
  const getCategoryConfig = (category: string) => {
    const configs: Record<string, { name: string; icon: string; headerClass: string }> = {
      'pulsa': { name: 'PULSA', icon: '📱', headerClass: 'text-blue-600 bg-blue-50' },
      'data': { name: 'DATA / INTERNET', icon: '📶', headerClass: 'text-green-600 bg-green-50' },
      'games': { name: 'GAMES & VOUCHER', icon: '🎮', headerClass: 'text-purple-600 bg-purple-50' },
      'ewallet': { name: 'E-MONEY', icon: '💳', headerClass: 'text-orange-600 bg-orange-50' },
      'e-money': { name: 'E-MONEY', icon: '💳', headerClass: 'text-orange-600 bg-orange-50' },
      'pln': { name: 'TOKEN PLN', icon: '⚡', headerClass: 'text-yellow-600 bg-yellow-50' },
      'streaming': { name: 'STREAMING & TV', icon: '📺', headerClass: 'text-red-600 bg-red-50' },
      'voucher': { name: 'VOUCHER', icon: '🎫', headerClass: 'text-indigo-600 bg-indigo-50' },
      'sms_telpon': { name: 'SMS & TELPON', icon: '📞', headerClass: 'text-cyan-600 bg-cyan-50' },
      'pln_pascabayar': { name: 'PLN PASCABAYAR', icon: '⚡', headerClass: 'text-gray-800 bg-gray-100' },
      'pdam': { name: 'PDAM', icon: '💧', headerClass: 'text-blue-800 bg-blue-100' },
      'hp_pascabayar': { name: 'HP PASCABAYAR', icon: '📱', headerClass: 'text-gray-800 bg-gray-100' },
      'bpjs_kesehatan': { name: 'BPJS KESEHATAN', icon: '🏥', headerClass: 'text-green-800 bg-green-100' },
      'tv': { name: 'TV', icon: '📺', headerClass: 'text-red-600 bg-red-50' },
      'internet_pascabayar': { name: 'INTERNET PASCABAYAR', icon: '🌐', headerClass: 'text-blue-800 bg-blue-100' },
    };
    return configs[category] || { name: category.toUpperCase(), icon: '📦', headerClass: 'text-gray-600 bg-gray-50' };
  };

  const getProviderConfig = (provider: string, category: string) => {
    const configs: Record<string, { name: string; icon: string }> = {
      'telkomsel': { name: 'TELKOMSEL', icon: '🔴' },
      'indosat': { name: 'INDOSAT', icon: '🟡' },
      'xl': { name: 'XL AXIATA', icon: '🔵' },
      'tri': { name: 'TRI', icon: '⚫' },
      'smartfren': { name: 'SMARTFREN', icon: '🟣' },
      'axis': { name: 'AXIS', icon: '🟢' },
      'by_u': { name: 'by.U', icon: '🔶' },
      'byu': { name: 'by.U', icon: '🔶' },
      'mobile_legends': { name: 'MOBILE LEGENDS', icon: '🎮' },
      'free_fire': { name: 'FREE FIRE', icon: '🔥' },
      'pubg': { name: 'PUBG MOBILE', icon: '🎯' },
      'steam': { name: 'STEAM', icon: '💨' },
      'google_play': { name: 'GOOGLE PLAY', icon: '📱' },
      'gopay': { name: 'GOPAY', icon: '💚' },
      'ovo': { name: 'OVO', icon: '💜' },
      'dana': { name: 'DANA', icon: '💙' },
      'shopeepay': { name: 'SHOPEEPAY', icon: '🧡' },
      'linkaja': { name: 'LINKAJA', icon: '❤️' },
      'pln': { name: 'PLN', icon: '⚡' },
      'netflix': { name: 'NETFLIX', icon: '📺' },
    };
    return configs[provider] || { name: provider.toUpperCase().replace(/_/g, ' '), icon: '🏢' };
  };

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
                                  {!Array.isArray(products) || products.length === 0 ? (
                                    <div className="text-center py-4 text-gray-500">Loading produk...</div>
                                  ) : (
                                    <>
                                      {Object.entries(groupedProducts).map(([category, providers]) => {
                                        const categoryConfig = getCategoryConfig(category);
                                        return (
                                          <div key={category}>
                                            <div className={`font-bold text-sm px-2 py-1 border-b ${categoryConfig.headerClass}`}>
                                              {categoryConfig.icon} {categoryConfig.name}
                                            </div>
                                            
                                            {Object.entries(providers).map(([provider, productList]) => {
                                              const providerConfig = getProviderConfig(provider, category);
                                              return (
                                                <div key={`${category}-${provider}`}>
                                                  <div className="font-medium text-xs text-gray-600 px-3 py-1 bg-gray-50">
                                                    {providerConfig.icon} {providerConfig.name}
                                                  </div>
                                                  {productList.slice(0, 10).map((product: any) => (
                                                    <SelectItem 
                                                      key={product.id} 
                                                      value={`Beli ${product.name} untuk nomor`}
                                                    >
                                                      {categoryConfig.icon} {product.name} - Rp {product.price?.toLocaleString('id-ID') || 'N/A'}
                                                    </SelectItem>
                                                  ))}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        );
                                      })}
                                    </>
                                  )}
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
      </DialogContent>
    </Dialog>
  );
}
