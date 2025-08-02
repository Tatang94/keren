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
      productId: paymentData.productId || paymentData.productName.replace(/\s+/g, '-').toLowerCase(),
      productType: getProductType(paymentData.productName),
      productCategory: getProductType(paymentData.productName),
      productName: paymentData.productName,
      targetNumber: paymentData.targetNumber,
      amount: paymentData.amount,
      adminFee: paymentData.adminFee,
      totalAmount: paymentData.totalAmount,
      status: 'pending',
      digiflazzSku: paymentData.digiflazzSku || null,
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
          <DialogTitle>Konfirmasi Bayar</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Product Info - Simplified */}
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-1">
              {paymentData.productName}
            </h4>
            <p className="text-gray-600 mb-4">{paymentData.targetNumber}</p>
          </div>
          
          {/* Simple Total */}
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-1">Total Pembayaran</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(paymentData.totalAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              (Termasuk biaya admin)
            </p>
          </div>
          
          {/* Simple Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={onClose}
              variant="outline" 
              className="flex-1"
              disabled={createTransactionMutation.isPending}
            >
              Batal
            </Button>
            <Button 
              onClick={handlePayment}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={createTransactionMutation.isPending}
            >
              {createTransactionMutation.isPending ? 'Proses...' : 'Bayar'}
            </Button>
          </div>

          {/* Simple Info */}
          <p className="text-center text-sm text-gray-500">
            Pembayaran via QRIS, Transfer Bank, E-Wallet
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
