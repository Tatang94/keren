import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Smartphone, X, CreditCard, ExternalLink } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: any;
}

export default function PaymentModal({ isOpen, onClose, paymentData }: PaymentModalProps) {
  const { toast } = useToast();

  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      const response = await apiRequest('POST', '/api/transactions', transactionData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.paymentUrl) {
        // Open payment URL in new tab
        window.open(data.paymentUrl, '_blank');
        toast({
          title: "Pembayaran Dibuat",
          description: "Silakan selesaikan pembayaran di tab baru",
        });
        onClose();
      } else {
        throw new Error("Failed to create payment");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal membuat transaksi pembayaran",
        variant: "destructive"
      });
    }
  });

  const handlePayment = () => {
    if (!paymentData) return;

    const transactionData = {
      productType: getProductType(paymentData.productName),
      productName: paymentData.productName,
      targetNumber: paymentData.targetNumber,
      amount: paymentData.amount,
      adminFee: paymentData.adminFee,
      totalAmount: paymentData.totalAmount,
      status: 'pending',
      aiCommand: `Beli ${paymentData.productName} untuk ${paymentData.targetNumber}`
    };

    createTransactionMutation.mutate(transactionData);
  };

  const getProductType = (productName: string): string => {
    const name = productName.toLowerCase();
    if (name.includes('pulsa')) return 'pulsa';
    if (name.includes('token') || name.includes('pln')) return 'token_listrik';
    if (name.includes('mobile legends') || name.includes('free fire') || name.includes('diamond')) return 'game_voucher';
    if (name.includes('gopay') || name.includes('ovo') || name.includes('dana')) return 'ewallet';
    return 'pulsa';
  };

  const getProductIcon = (productName: string) => {
    const name = productName.toLowerCase();
    if (name.includes('pulsa')) return <Smartphone className="h-8 w-8 text-white" />;
    if (name.includes('token') || name.includes('pln')) return <div className="text-white text-2xl">⚡</div>;
    if (name.includes('mobile legends') || name.includes('free fire')) return <div className="text-white text-2xl">🎮</div>;
    if (name.includes('gopay') || name.includes('ovo') || name.includes('dana')) return <CreditCard className="h-8 w-8 text-white" />;
    return <Smartphone className="h-8 w-8 text-white" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  if (!paymentData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Info */}
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              {getProductIcon(paymentData.productName)}
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              {paymentData.productName}
            </h4>
            <p className="text-gray-600">{paymentData.targetNumber}</p>
          </div>
          
          {/* Price Breakdown */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Harga Produk</span>
                  <span className="font-medium">{formatCurrency(paymentData.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Biaya Admin</span>
                  <span className="font-medium">{formatCurrency(paymentData.adminFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total Pembayaran</span>
                  <span className="font-bold text-lg text-primary">
                    {formatCurrency(paymentData.totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Payment Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handlePayment}
              className="w-full bg-primary hover:bg-blue-700"
              disabled={createTransactionMutation.isPending}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {createTransactionMutation.isPending ? 'Memproses...' : 'Bayar dengan Paydisini'}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              onClick={onClose}
              variant="outline" 
              className="w-full"
              disabled={createTransactionMutation.isPending}
            >
              Batal
            </Button>
          </div>

          {/* Payment Info */}
          <div className="text-center text-sm text-gray-500">
            <p>Anda akan diarahkan ke halaman pembayaran Paydisini</p>
            <p>Metode pembayaran: QRIS, Virtual Account, E-Wallet</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
