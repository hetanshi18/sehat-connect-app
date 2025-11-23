import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { Medicine, CartItem } from '@/types/pharmacy';
import { ShoppingCart, Plus, Minus, Trash2, Search, Pill, Package, Upload, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PharmacyKiosk() {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'home_delivery' | 'pickup'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Main Pharmacy');
  const [submitting, setSubmitting] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    filterMedicines();
  }, [searchTerm, categoryFilter, medicines]);

  const fetchMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('status', 'in_stock')
        .gt('stock_quantity', 0)
        .order('name');

      if (error) throw error;

      setMedicines((data || []) as Medicine[]);
      
      // Extract unique categories
      const uniqueCategories = [...new Set((data || []).map(m => m.category))];
      setCategories(uniqueCategories);
    } catch (error: any) {
      console.error('Error fetching medicines:', error);
      toast({
        title: 'Error',
        description: 'Failed to load medicines',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterMedicines = () => {
    let filtered = medicines;

    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(m => m.category === categoryFilter);
    }

    setFilteredMedicines(filtered);
  };

  const addToCart = (medicine: Medicine) => {
    const existingItem = cart.find(item => item.medicine.id === medicine.id);
    
    if (existingItem) {
      if (existingItem.quantity >= medicine.stock_quantity) {
        toast({
          title: 'Stock limit',
          description: 'Cannot add more than available stock',
          variant: 'destructive',
        });
        return;
      }
      setCart(cart.map(item =>
        item.medicine.id === medicine.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { medicine, quantity: 1 }]);
    }
    
    toast({
      title: 'Added to cart',
      description: `${medicine.name} added to cart`,
    });
  };

  const updateQuantity = (medicineId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.medicine.id === medicineId) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) return item;
        if (newQuantity > item.medicine.stock_quantity) return item;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (medicineId: string) => {
    setCart(cart.filter(item => item.medicine.id !== medicineId));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0);
  };

  const hasPrescriptionRequired = () => {
    return cart.some(item => item.medicine.prescription_required);
  };

  const handlePrescriptionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, or PDF file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setPrescriptionFile(file);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Empty cart',
        description: 'Please add items to cart before checkout',
        variant: 'destructive',
      });
      return;
    }

    if (deliveryType === 'home_delivery' && !deliveryAddress.trim()) {
      toast({
        title: 'Address required',
        description: 'Please enter delivery address',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let prescriptionId = null;

      // Upload prescription if provided
      if (prescriptionFile) {
        setUploading(true);
        const fileExt = prescriptionFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('prescriptions')
          .upload(fileName, prescriptionFile);

        if (uploadError) throw uploadError;
        prescriptionId = fileName;
        setUploading(false);
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('pharmacy_orders')
        .insert({
          patient_id: user.id,
          total_amount: getTotalAmount(),
          delivery_type: deliveryType,
          delivery_address: deliveryType === 'home_delivery' ? deliveryAddress : null,
          pickup_location: deliveryType === 'pickup' ? pickupLocation : null,
          status: 'pending',
          prescription_id: prescriptionId,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        medicine_id: item.medicine.id,
        quantity: item.quantity,
        price_at_purchase: item.medicine.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: 'Order placed!',
        description: `Order ID: ${order.id.substring(0, 8)}`,
      });

      setCart([]);
      setPrescriptionFile(null);
      setShowCheckout(false);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast({
        title: 'Error',
        description: 'Failed to place order',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pharmacy Kiosk</h1>
          <p className="text-muted-foreground">Order your medicines</p>
        </div>
        <Button onClick={() => setShowCheckout(true)} size="lg">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Cart ({cartItemCount})
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicines.map(medicine => (
            <Card key={medicine.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-primary" />
                      {medicine.name}
                    </CardTitle>
                    <CardDescription>{medicine.category}</CardDescription>
                  </div>
                  {medicine.prescription_required && (
                    <Badge variant="outline">Rx Required</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {medicine.description || 'No description available'}
                </p>
                {medicine.manufacturer && (
                  <p className="text-xs text-muted-foreground">
                    Manufacturer: {medicine.manufacturer}
                  </p>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-2xl font-bold text-primary">
                    ₹{medicine.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Stock: {medicine.stock_quantity}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => addToCart(medicine)} 
                  className="w-full"
                  disabled={medicine.stock_quantity === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredMedicines.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">No medicines found</p>
        </div>
      )}

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>Review your order and complete checkout</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.medicine.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.medicine.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          ₹{item.medicine.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(item.medicine.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(item.medicine.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => removeFromCart(item.medicine.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right font-bold">
                        ₹{(item.medicine.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-primary">₹{getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Delivery Method</Label>
                  <RadioGroup value={deliveryType} onValueChange={(v: any) => setDeliveryType(v)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup">Pickup from Pharmacy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="home_delivery" id="home_delivery" />
                      <Label htmlFor="home_delivery">Home Delivery</Label>
                    </div>
                  </RadioGroup>

                  {deliveryType === 'home_delivery' ? (
                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your delivery address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        rows={3}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="pickup-location">Pickup Location</Label>
                      <Select value={pickupLocation} onValueChange={setPickupLocation}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Main Pharmacy">Main Pharmacy</SelectItem>
                          <SelectItem value="Branch 1">Branch 1</SelectItem>
                          <SelectItem value="Branch 2">Branch 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {hasPrescriptionRequired() && (
                  <div className="space-y-3 pt-4 border-t">
                    <Label className="text-sm font-medium">Prescription Upload (Required)</Label>
                    <p className="text-xs text-muted-foreground">Some medicines in your cart require a prescription</p>
                    
                    {!prescriptionFile ? (
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={() => document.getElementById('prescription-upload')?.click()}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Prescription
                        </Button>
                        <input
                          id="prescription-upload"
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,application/pdf"
                          className="hidden"
                          onChange={handlePrescriptionUpload}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2 border rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{prescriptionFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(prescriptionFile.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setPrescriptionFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)}>
              Continue Shopping
            </Button>
            <Button 
              onClick={handleCheckout} 
              disabled={cart.length === 0 || submitting || uploading || (hasPrescriptionRequired() && !prescriptionFile)}
            >
              {uploading ? 'Uploading...' : submitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
