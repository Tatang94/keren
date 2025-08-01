import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Mic, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
  productData?: any;
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
      message: 'Halo! Saya PPOB Assistant yang siap membantu pembelian produk digital Anda.\n\nContoh perintah:\n• "Beli pulsa Telkomsel 50rb untuk 081234567890"\n• "Token listrik PLN 100rb meter 12345678901"\n• "Top up GoPay 200rb ke 081234567890"\n• "Voucher Mobile Legends 100rb untuk 081234567890"\n\nKetik perintah Anda...',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
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

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Error",
          description: "Gagal mengenali suara. Silakan coba lagi.",
          variant: "destructive"
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({
        title: "Not Supported",
        description: "Fitur voice input tidak didukung di browser ini.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
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
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex">
                <div className={`rounded-lg px-4 py-3 max-w-sm whitespace-pre-wrap ${
                  message.type === 'user' 
                    ? 'chat-message-user ml-auto' 
                    : 'chat-message-ai'
                }`}>
                  <div className="flex items-start space-x-2">
                    {message.type === 'ai' && (
                      <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    {message.type === 'user' && (
                      <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.message}</p>
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
                <div className="chat-message-ai">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ketik perintah pembelian Anda..."
              className="flex-1"
              disabled={processChatMutation.isPending}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || processChatMutation.isPending}
              className="bg-primary hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button 
              onClick={startVoiceInput}
              variant="outline"
              disabled={isListening || processChatMutation.isPending}
              className={isListening ? "animate-pulse" : ""}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
          {isListening && (
            <p className="text-sm text-primary mt-2 text-center">
              Mendengarkan... Silakan bicara
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
