import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";

export default function AdminDashboard() {
  const { data: stats } = useQuery<{
    todayTransactions: number;
    todayRevenue: number;
    pendingTransactions: number;
    failedTransactions: number;
  }>({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/transactions'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
      case 'paid':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Berhasil</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'paid':
        return <Badge className="bg-blue-100 text-blue-800">Dibayar</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Gagal</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <TrendingUp className="text-white h-4 w-4" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Transaksi Hari Ini
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.todayTransactions || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                  <DollarSign className="text-white h-4 w-4" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pendapatan Hari Ini
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(stats?.todayRevenue || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-600 rounded-md flex items-center justify-center">
                  <Clock className="text-white h-4 w-4" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Transaksi Pending
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.pendingTransactions || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center">
                  <AlertTriangle className="text-white h-4 w-4" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Transaksi Gagal
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.failedTransactions || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Transaksi</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Tujuan</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{transaction.productName}</TableCell>
                    <TableCell>{transaction.targetNumber}</TableCell>
                    <TableCell>{formatCurrency(transaction.totalAmount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(transaction.status)}
                        {getStatusBadge(transaction.status)}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(transaction.createdAt!)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {(!transactions || transactions.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                Belum ada transaksi hari ini
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
