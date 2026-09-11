import { supabase } from '@/lib/supabase';
import { CartItem } from '@/context/CartContext';

export interface OrderItemRecord {
  id?: string;
  order_id?: string;
  product_id: string;
  reference: string;
  code: string;
  brand?: string;
  material?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  product?: any;
}

export interface OrderRecord {
  id: string;
  order_number: string;
  user_id?: string;
  customer_email: string;
  customer_name?: string;
  company_name?: string;
  phone?: string;
  shipping_address?: string;
  notes?: string;
  status: 'Pendiente' | 'En Proceso' | 'Completada' | 'Cancelada';
  total_items: number;
  subtotal: number;
  switch_order_number?: string;
  switch_synced?: boolean;
  payment_url?: string;
  erp_order_id?: string;
  created_at: string;
  order_items?: OrderItemRecord[];
}

export interface CreateOrderParams {
  cartItems: CartItem[];
  shippingAddress?: string;
  notes?: string;
  whatsappPhone?: string;
}

export async function createOrder({
  cartItems,
  shippingAddress = '',
  notes = '',
  whatsappPhone = '',
}: CreateOrderParams): Promise<{ success: boolean; orderId?: string; orderNumber?: string; whatsappUrl?: string; error?: string }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const user = sessionData?.session?.user;

    if (!user) {
      return { success: false, error: 'Debes estar autenticado para realizar un pedido.' };
    }

    const res = await fetch('/api/checkout/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        cartItems,
        shippingAddress,
        notes,
        whatsappPhone,
        userId: user.id,
        userEmail: user.email,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        whatsappUrl: data.whatsappUrl,
      };
    }

    return { success: false, error: data.error || 'Error al procesar la orden en el servidor.' };
  } catch (e: any) {
    console.error('Unexpected error creating order:', e);
    return { success: false, error: e?.message || 'Error inesperado al procesar la orden.' };
  }
}

export async function getUserOrders(): Promise<OrderRecord[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return [];

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(id, reference, code, description, price, eye_size, material, sale_type, thumbnail_url, large_image_url, brand_id, brands(name)))')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error || !orders) {
      console.error('Error fetching user orders:', error);
      return [];
    }

    return orders as OrderRecord[];
  } catch (e) {
    console.error('Error in getUserOrders:', e);
    return [];
  }
}

export async function getAllOrders(): Promise<OrderRecord[]> {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(id, reference, code, description, price, material, sale_type, thumbnail_url, brand_id, brands(name)))')
      .order('created_at', { ascending: false });

    if (error || !orders) {
      console.error('Error fetching all orders:', error);
      return [];
    }

    return orders as OrderRecord[];
  } catch (e) {
    console.error('Error in getAllOrders:', e);
    return [];
  }
}
