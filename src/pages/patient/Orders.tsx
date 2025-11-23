import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { PharmacyOrder, OrderItem } from '@/types/pharmacy';
import { Eye, Package, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';

export default function PatientOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<PharmacyOrder | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('pharmacy_orders')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data || []) as PharmacyOrder[]);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;

      // Fetch medicine details
      const itemsWithMedicines = await Promise.all(
        (data || []).map(async (item) => {
          const { data: medicine } = await supabase
            .from('medicines')
            .select('name, category')
            .eq('id', item.medicine_id)
            .single();
          
          return {
            ...item,
            medicine
          };
        })
      );

      setOrderItems(itemsWithMedicines as any);
    } catch (error: any) {
      console.error('Error fetching order items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load order items',
        variant: 'destructive',
      });
    }
  };

  const handleViewOrder = async (order: PharmacyOrder) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.id);
    setShowDetails(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'ready': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <DashboardLayout role="patient">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">View your pharmacy orders</p>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No orders yet</p>
            <p className="text-sm text-muted-foreground">Your pharmacy orders will appear here</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.order_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{parseFloat(order.total_amount.toString()).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.delivery_type === 'home_delivery' ? 'Home Delivery' : 'Pickup'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.prescription_id && (
                          <Button
                            size="icon"
                            variant="outline"
                            asChild
                          >
                            <a 
                              href={`https://qwsfjkaylxykyxaynsgq.supabase.co/storage/v1/object/public/prescriptions/${order.prescription_id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <FileText className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Order ID: {selectedOrder?.id.substring(0, 8)}
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Order Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedOrder.order_date), 'PPP')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Status</h4>
                    <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Delivery Type</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.delivery_type === 'home_delivery' ? 'Home Delivery' : 'Pickup'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Total Amount</h4>
                    <p className="text-sm font-bold text-primary">
                      ₹{parseFloat(selectedOrder.total_amount.toString()).toFixed(2)}
                    </p>
                  </div>
                </div>

                {selectedOrder.delivery_type === 'home_delivery' && selectedOrder.delivery_address && (
                  <div>
                    <h4 className="font-medium mb-1">Delivery Address</h4>
                    <p className="text-sm text-muted-foreground">{selectedOrder.delivery_address}</p>
                  </div>
                )}

                {selectedOrder.delivery_type === 'pickup' && selectedOrder.pickup_location && (
                  <div>
                    <h4 className="font-medium mb-1">Pickup Location</h4>
                    <p className="text-sm text-muted-foreground">{selectedOrder.pickup_location}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Order Items</h4>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medicine</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.medicine?.name}</TableCell>
                            <TableCell>{item.medicine?.category}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₹{parseFloat(item.price_at_purchase).toFixed(2)}</TableCell>
                            <TableCell className="font-medium">
                              ₹{(parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
