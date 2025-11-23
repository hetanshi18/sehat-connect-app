export interface Medicine {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  stock_quantity: number;
  manufacturer: string | null;
  prescription_required: boolean;
  image_url: string | null;
  status: 'in_stock' | 'out_of_stock' | 'discontinued';
  created_at: string;
  updated_at: string;
}

export interface PharmacyOrder {
  id: string;
  patient_id: string;
  order_date: string;
  total_amount: number;
  delivery_type: 'home_delivery' | 'pickup';
  delivery_address: string | null;
  pickup_location: string | null;
  status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';
  prescription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  medicine_id: string;
  quantity: number;
  price_at_purchase: number;
  created_at: string;
  medicine?: Medicine;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}
