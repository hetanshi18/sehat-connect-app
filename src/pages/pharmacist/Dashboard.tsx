import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, TrendingUp, AlertCircle, LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

export default function PharmacistDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [medicinesRes, ordersRes] = await Promise.all([
        supabase.from('medicines').select('*'),
        supabase.from('pharmacy_orders').select('*'),
      ]);

      if (medicinesRes.error) throw medicinesRes.error;
      if (ordersRes.error) throw ordersRes.error;

      const medicines = medicinesRes.data || [];
      const orders = ordersRes.data || [];

      setStats({
        totalMedicines: medicines.length,
        lowStock: medicines.filter(m => m.stock_quantity < 10 && m.status !== 'discontinued').length,
        pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
        totalRevenue: orders
          .filter(o => o.status === 'completed')
          .reduce((sum, o) => sum + Number(o.total_amount), 0),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Medicines',
      value: stats.totalMedicines,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStock,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pharmacist Dashboard</h1>
          <p className="text-muted-foreground">Manage medicines and orders</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          statCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/pharmacist/medicines')}>
          <CardHeader>
            <CardTitle>Manage Medicines</CardTitle>
            <CardDescription>Add, edit, or remove medicines from inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Package className="mr-2 h-4 w-4" />
              Go to Medicines
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/pharmacist/orders')}>
          <CardHeader>
            <CardTitle>Manage Orders</CardTitle>
            <CardDescription>View and process incoming orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Go to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
