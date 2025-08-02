import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  Search,
  Filter,
  Download,
  UserCheck,
  UserX,
  Plus,
  ShoppingCart
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Transaction } from "@shared/schema";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: stats } = useQuery<{
    todayTransactions: number;
    todayRevenue: number;
    pendingTransactions: number;
    failedTransactions: number;
  }>({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/transactions'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    refetchInterval: 30000,
  });

  // Mutations for admin actions
  const syncProductsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/sync-products');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sukses",
        description: `Berhasil sinkronisasi ${data.syncedCount || data.count} produk dari Digiflazz`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal sinkronisasi produk dari Digiflazz",
        variant: "destructive"
      });
    }
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/transactions/${transactionId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sukses",
        description: "Transaksi berhasil dihapus",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menghapus transaksi",
        variant: "destructive"
      });
    }
  });

  const updateTransactionStatusMutation = useMutation({
    mutationFn: async ({ transactionId, status }: { transactionId: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/transactions/${transactionId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sukses",
        description: "Status transaksi berhasil diupdate",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal mengupdate status transaksi",
        variant: "destructive"
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/products/${productId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sukses",
        description: "Produk berhasil dihapus",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menghapus produk",
        variant: "destructive"
      });
    }
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

  // Filter transactions based on search and status
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.targetNumber?.includes(searchTerm) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter products based on search
  const filteredProducts = products.filter((product: any) => {
    return product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product.category?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              onClick={() => setActiveTab("dashboard")}
              className="flex-1"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "transactions" ? "default" : "ghost"}
              onClick={() => setActiveTab("transactions")}
              className="flex-1"
            >
              <Clock className="mr-2 h-4 w-4" />
              Transaksi
            </Button>
            <Button
              variant={activeTab === "products" ? "default" : "ghost"}
              onClick={() => setActiveTab("products")}
              className="flex-1"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Produk
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <>
          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <Button
                  onClick={() => syncProductsMutation.mutate()}
                  disabled={syncProductsMutation.isPending}
                  className="bg-primary hover:bg-blue-700"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${syncProductsMutation.isPending ? 'animate-spin' : ''}`} />
                  {syncProductsMutation.isPending ? 'Syncing...' : 'Sync Produk Digiflazz'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const csvData = transactions.map(t => ({
                      ID: t.id,
                      Produk: t.productName,
                      Tujuan: t.targetNumber,
                      Jumlah: t.totalAmount,
                      Status: t.status,
                      Waktu: t.createdAt
                    }));
                    const csv = "data:text/csv;charset=utf-8," + 
                      "ID,Produk,Tujuan,Jumlah,Status,Waktu\n" +
                      (csvData.map(row => Object.values(row).join(",")).join("\n") || "");
                    const link = document.createElement("a");
                    link.setAttribute("href", encodeURI(csv));
                    link.setAttribute("download", `transaksi_${new Date().toISOString().slice(0,10)}.csv`);
                    link.click();
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Transaksi
                </Button>
              </div>
            </CardContent>
          </Card>

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
                    {transactions.slice(0, 10).map((transaction) => (
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
                
                {transactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Belum ada transaksi hari ini
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Manajemen Transaksi</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Cari transaksi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Dibayar</SelectItem>
                    <SelectItem value="success">Berhasil</SelectItem>
                    <SelectItem value="failed">Gagal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Tujuan</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{transaction.productName}</TableCell>
                    <TableCell>{transaction.targetNumber}</TableCell>
                    <TableCell>{formatCurrency(transaction.totalAmount)}</TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>{formatDate(transaction.createdAt!)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select
                          value={transaction.status}
                          onValueChange={(newStatus) => 
                            updateTransactionStatusMutation.mutate({
                              transactionId: transaction.id,
                              status: newStatus
                            })
                          }
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Dibayar</SelectItem>
                            <SelectItem value="success">Berhasil</SelectItem>
                            <SelectItem value="failed">Gagal</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Transaksi</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => deleteTransactionMutation.mutate(transaction.id)}
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Tidak ada transaksi yang ditemukan
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Manajemen Produk ({products.length} produk)</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.slice(0, 50).map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell>{product.provider}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      {product.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Nonaktif</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus produk "{product.name}"? Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => deleteProductMutation.mutate(product.id)}
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Tidak ada produk yang ditemukan
              </div>
            )}
            
            {filteredProducts.length > 50 && (
              <div className="text-center py-4 text-gray-500">
                Menampilkan 50 dari {filteredProducts.length} produk. Gunakan pencarian untuk hasil yang lebih spesifik.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}