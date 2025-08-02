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
                                  <SelectItem value="Beli pulsa Telkomsel 10rb">📱 Pulsa Telkomsel 10.000</SelectItem>
                                  <SelectItem value="Beli pulsa Telkomsel 25rb">📱 Pulsa Telkomsel 25.000</SelectItem>
                                  <SelectItem value="Beli pulsa Telkomsel 50rb">📱 Pulsa Telkomsel 50.000</SelectItem>
                                  <SelectItem value="Beli pulsa Telkomsel 100rb">📱 Pulsa Telkomsel 100.000</SelectItem>
                                  
                                  <SelectItem value="Beli pulsa Indosat 10rb">📱 Pulsa Indosat 10.000</SelectItem>
                                  <SelectItem value="Beli pulsa Indosat 25rb">📱 Pulsa Indosat 25.000</SelectItem>
                                  <SelectItem value="Beli pulsa Indosat 50rb">📱 Pulsa Indosat 50.000</SelectItem>
                                  
                                  <SelectItem value="Beli pulsa XL 10rb">📱 Pulsa XL 10.000</SelectItem>
                                  <SelectItem value="Beli pulsa XL 25rb">📱 Pulsa XL 25.000</SelectItem>
                                  <SelectItem value="Beli pulsa XL 50rb">📱 Pulsa XL 50.000</SelectItem>
                                  
                                  <SelectItem value="Beli pulsa Tri 5rb">📱 Pulsa Tri 5.000</SelectItem>
                                  <SelectItem value="Beli pulsa Tri 10rb">📱 Pulsa Tri 10.000</SelectItem>
                                  <SelectItem value="Beli pulsa Tri 25rb">📱 Pulsa Tri 25.000</SelectItem>
                                  
                                  <SelectItem value="Beli data Telkomsel 1GB">📶 Data Telkomsel 1GB</SelectItem>
                                  <SelectItem value="Beli data Telkomsel 3GB">📶 Data Telkomsel 3GB</SelectItem>
                                  <SelectItem value="Beli data Telkomsel 8GB">📶 Data Telkomsel 8GB</SelectItem>
                                  
                                  <SelectItem value="Beli token PLN 20rb">⚡ Token PLN 20.000</SelectItem>
                                  <SelectItem value="Beli token PLN 50rb">⚡ Token PLN 50.000</SelectItem>
                                  <SelectItem value="Beli token PLN 100rb">⚡ Token PLN 100.000</SelectItem>
                                  
                                  <SelectItem value="Beli diamond Mobile Legends 86">🎮 Mobile Legends 86 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Mobile Legends 172">🎮 Mobile Legends 172 Diamond</SelectItem>
                                  <SelectItem value="Beli diamond Free Fire 70">🎮 Free Fire 70 Diamond</SelectItem>
                                  
                                  <SelectItem value="Beli GoPay 50rb">💳 GoPay 50.000</SelectItem>
                                  <SelectItem value="Beli GoPay 100rb">💳 GoPay 100.000</SelectItem>
                                  <SelectItem value="Beli OVO 50rb">💳 OVO 50.000</SelectItem>
                                  <SelectItem value="Beli DANA 50rb">💳 DANA 50.000</SelectItem>
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
