-- Create medicines table
CREATE TABLE IF NOT EXISTS public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  manufacturer TEXT,
  prescription_required BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'in_stock',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pharmacy_orders table
CREATE TABLE IF NOT EXISTS public.pharmacy_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_type TEXT NOT NULL,
  delivery_address TEXT,
  pickup_location TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  prescription_id UUID REFERENCES public.prescriptions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.pharmacy_orders(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medicines
CREATE POLICY "Everyone can view medicines"
  ON public.medicines FOR SELECT
  USING (true);

CREATE POLICY "Pharmacists can insert medicines"
  ON public.medicines FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Pharmacists can update medicines"
  ON public.medicines FOR UPDATE
  USING (has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Pharmacists can delete medicines"
  ON public.medicines FOR DELETE
  USING (has_role(auth.uid(), 'pharmacist'));

-- RLS Policies for pharmacy_orders
CREATE POLICY "Patients can view own orders"
  ON public.pharmacy_orders FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Pharmacists can view all orders"
  ON public.pharmacy_orders FOR SELECT
  USING (has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Patients can create orders"
  ON public.pharmacy_orders FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Pharmacists can update orders"
  ON public.pharmacy_orders FOR UPDATE
  USING (has_role(auth.uid(), 'pharmacist'));

-- RLS Policies for order_items
CREATE POLICY "Users can view order items for their orders"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pharmacy_orders
      WHERE pharmacy_orders.id = order_items.order_id
      AND (pharmacy_orders.patient_id = auth.uid() OR has_role(auth.uid(), 'pharmacist'))
    )
  );

CREATE POLICY "Patients can insert order items for their orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pharmacy_orders
      WHERE pharmacy_orders.id = order_items.order_id
      AND pharmacy_orders.patient_id = auth.uid()
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_medicines_updated_at
  BEFORE UPDATE ON public.medicines
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_pharmacy_orders_updated_at
  BEFORE UPDATE ON public.pharmacy_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();