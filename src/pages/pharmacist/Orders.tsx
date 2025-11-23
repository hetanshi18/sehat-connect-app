import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { PharmacyOrder, OrderItem } from '@/types/pharmacy';
import { Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function Orders() {
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<PharmacyOrder | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacy_orders')
        .select(`
          *,
          profiles:patient_id (name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data || []) as any);
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
        .select(`
          *,
          medicine:medicine_id (name, category)
        `)
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems((data || []) as any);
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

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('pharmacy_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({ title: 'Success', description: 'Order status updated' });
      fetchOrders();
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
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
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">View and manage pharmacy orders</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.id.substring(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.profiles?.name}</div>
                      <div className="text-sm text-muted-foreground">{order.profiles?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.order_date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">
                    ₹{parseFloat(order.total_amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {order.delivery_type === 'home_delivery' ? 'Home Delivery' : 'Pickup'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusUpdate(order.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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
  );
}
