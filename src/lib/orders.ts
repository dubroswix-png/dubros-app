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
}: CreateOrderParams): Promise<{ success: boolean; orderNumber?: string; whatsappUrl?: string; error?: string }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      return { success: false, error: 'Debes estar autenticado para realizar un pedido.' };
    }

    // Fetch user profile for metadata
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `DB-2026-${randomSuffix}`;

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    // 1. Insert order header
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        customer_email: user.email || '',
        customer_name: profile?.name || user.email?.split('@')[0],
        company_name: profile?.company_name || '',
        phone: whatsappPhone || profile?.phone || '',
        shipping_address: shippingAddress,
        notes: notes,
        status: 'Pendiente',
        total_items: totalItems,
        subtotal: subtotal,
      })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error('Error inserting order:', orderError);
      return { success: false, error: orderError?.message || 'Error al registrar el pedido.' };
    }

    // 2. Insert order items
    const itemsToInsert = cartItems.map((item) => ({
      order_id: orderData.id,
      product_id: item.product.id,
      reference: item.product.reference,
      code: item.product.code,
      brand: item.product.brand,
      material: item.product.material,
      unit_price: item.product.price,
      quantity: item.quantity,
      total_price: item.product.price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);

    if (itemsError) {
      console.error('Error inserting order items:', itemsError);
    }

    // 3. Generate WhatsApp summary URL
    const dubrosWhatsApp = '50760000000'; // Número oficial de ventas
    let message = `*NUEVO PEDIDO DUBROS B2B*\n`;
    message += `📋 *Orden:* #${orderNumber}\n`;
    message += `🏢 *Empresa:* ${profile?.company_name || 'N/A'}\n`;
    message += `👤 *Cliente:* ${profile?.name || user.email}\n`;
    message += `📍 *Dirección:* ${shippingAddress || 'No especificada'}\n`;
    message += `-------------------------\n`;

    cartItems.forEach((item) => {
      message += `• ${item.product.brand} ${item.product.reference} (x${item.quantity}) - $${(item.product.price * item.quantity).toFixed(2)}\n`;
    });

    message += `-------------------------\n`;
    message += `📦 *Total piezas:* ${totalItems}\n`;
    message += `💰 *Subtotal:* $${subtotal.toFixed(2)}\n`;

    if (notes) {
      message += `📝 *Notas:* ${notes}\n`;
    }

    const whatsappUrl = `https://wa.me/${dubrosWhatsApp}?text=${encodeURIComponent(message)}`;

    return {
      success: true,
      orderNumber,
      whatsappUrl,
    };
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
      .select('*, order_items(*)')
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
