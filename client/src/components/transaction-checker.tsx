import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, Clock, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Transaction } from "@shared/schema";

export default function TransactionChecker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [shouldSearch, setShouldSearch] = useState(false);
  const { toast } = useToast();

  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['/api/transactions/check', searchQuery],
    enabled: shouldSearch && searchQuery.length > 0,
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Masukkan ID transaksi atau nomor HP",
        variant: "destructive"
      });
      return;
    }
    setShouldSearch(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
      case 'paid':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="status-success">Berhasil</Badge>;
      case 'pending':
        return <Badge className="status-pending">Menunggu Pembayaran</Badge>;
      case 'paid':
        return <Badge className="status-pending">Sedang Diproses</Badge>;
      case 'failed':
        return <Badge className="status-failed">Gagal</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Cek Status Transaksi</h3>
          <p className="text-xl text-gray-600">Pantau transaksi Anda secara real-time</p>
        </div>
        
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center space-x-4 mb-6">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan ID Transaksi atau nomor HP"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-primary hover:bg-blue-700"
              >
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? 'Mencari...' : 'Cek Status'}
              </Button>
            </div>
            
            {/* Transaction Results */}
            {transactions && transactions.length > 0 && (
              <div className="space-y-4">
                {transactions.map((transaction: Transaction) => (
                  <Card key={transaction.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(transaction.status)}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {transaction.productName}
                            </p>
                            <p className="text-sm text-gray-600">
                              ID: {transaction.id}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Nomor Tujuan</p>
                          <p className="font-medium">{transaction.targetNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Bayar</p>
                          <p className="font-medium">{formatCurrency(transaction.totalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Waktu</p>
                          <p className="font-medium">{formatDate(transaction.createdAt!)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Metode Bayar</p>
                          <p className="font-medium">Paydisini</p>
                        </div>
                      </div>
                      {transaction.aiCommand && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-gray-600 text-sm">Perintah AI:</p>
                          <p className="text-sm italic">"{transaction.aiCommand}"</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {transactions && transactions.length === 0 && shouldSearch && (
              <div className="text-center py-8">
                <p className="text-gray-500">Tidak ada transaksi ditemukan</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-500">Gagal mengambil data transaksi</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
