'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/data/mock';
import { isDocena, getProductUnitPrice } from '@/lib/products';
import { supabase } from '@/lib/supabase';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalArticles: number;
  totalPieces: number;
  subtotal: number;
  getItemUnitPrice: (product: Product) => number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const syncTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sync cart to server orders table with status 'Carrito'
  const syncCartWithServer = (itemsToSync: CartItem[], immediate = false) => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    const performSync = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) return; // Only sync to database for logged in clients

        await fetch('/api/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartItems: itemsToSync,
            userId: user.id,
            userEmail: user.email,
          }),
        });
      } catch (err) {
        console.error('Error syncing cart with server:', err);
      }
    };

    if (immediate) {
      performSync();
    } else {
      syncTimeoutRef.current = setTimeout(performSync, 1200);
    }
  };

  // Load saved cart on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('dubros_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCartItems(parsed);
        // Sync existing cart to server if user is logged in
        if (parsed.length > 0) {
          syncCartWithServer(parsed, false);
        }
      }
    } catch (e) {
      console.error('Error loading cart from localStorage', e);
    }
  }, []);

  // Sync cart to localStorage and server on change
  const updateCartState = (newItems: CartItem[], immediate = false) => {
    setCartItems(newItems);
    try {
      localStorage.setItem('dubros_cart', JSON.stringify(newItems));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
    syncCartWithServer(newItems, immediate);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Product, quantity: number = 1) => {
    const existing = cartItems.find((item) => item.product.id === product.id);
    let updated: CartItem[];
    if (existing) {
      updated = cartItems.map((item) =>
        item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      updated = [...cartItems, { product, quantity }];
    }
    updateCartState(updated);
    openCart();
  };

  const updateQuantity = (productId: string, delta: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];
    updateCartState(updated);
  };

  const removeFromCart = (productId: string) => {
    const updated = cartItems.filter((item) => item.product.id !== productId);
    updateCartState(updated);
  };

  const clearCart = () => {
    updateCartState([], true);
  };

  const getItemUnitPrice = (product: Product): number => {
    return getProductUnitPrice(product.price, product.saleType);
  };

  const totalArticles = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPieces = totalArticles;
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalArticles,
        totalPieces,
        subtotal,
        getItemUnitPrice,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
}
