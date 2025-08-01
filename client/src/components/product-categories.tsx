import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Zap, Gamepad2, CreditCard } from "lucide-react";

interface ProductCategoriesProps {
  onCategorySelect: (category: string) => void;
}

export default function ProductCategories({ onCategorySelect }: ProductCategoriesProps) {
  const categories = [
    {
      id: 'pulsa',
      name: 'Pulsa & Paket Data',
      description: 'Semua operator: Telkomsel, Indosat, XL, Tri, Smartfren',
      icon: Smartphone,
      color: 'bg-blue-100 text-blue-600',
      startingPrice: 'Mulai dari Rp 5.000'
    },
    {
      id: 'token_listrik',
      name: 'Token Listrik PLN',
      description: 'Token listrik prabayar semua golongan',
      icon: Zap,
      color: 'bg-yellow-100 text-yellow-600',
      startingPrice: 'Mulai dari Rp 20.000'
    },
    {
      id: 'game_voucher',
      name: 'Game Voucher',
      description: 'Mobile Legends, Free Fire, PUBG, dan lainnya',
      icon: Gamepad2,
      color: 'bg-green-100 text-green-600',
      startingPrice: 'Mulai dari Rp 10.000'
    },
    {
      id: 'ewallet',
      name: 'E-Wallet',
      description: 'Top up GoPay, OVO, DANA, ShopeePay',
      icon: CreditCard,
      color: 'bg-purple-100 text-purple-600',
      startingPrice: 'Mulai dari Rp 10.000'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Produk & Layanan</h3>
          <p className="text-xl text-gray-600">Berbagai produk digital tersedia dengan AI assistant</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={category.id}
                className="hover:shadow-xl transition-shadow cursor-pointer border border-gray-200"
                onClick={() => onCategorySelect(category.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    {category.description}
                  </p>
                  <div className="text-primary font-medium text-sm">
                    {category.startingPrice}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
