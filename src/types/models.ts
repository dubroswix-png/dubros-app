export type ProductGender = 'Hombre' | 'Mujer' | 'Unisex' | 'Niños';

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface Product {
  id: string;
  reference: string;
  code: string;
  description: string;
  price: number;
  eyeSize: number;
  bridgeSize?: number;
  templeLength?: number;
  frameSize?: string;
  brand: string;
  material: string;
  gender: ProductGender;
  saleType: string;
  category: string;
  collection?: string;
  quantity: number;
  flex: boolean;
  thumbnailUrl: string;
  largeImageUrl: string;
  extraImages?: string[];
  restrictedCountries?: string[]; // Países donde NO está disponible
}

export interface BlogPost {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  featuredImageUrl: string;
  tags: string[];
  slug: string;
  publishedAt: string;
  author: string;
}

export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'Completada' | 'Pendiente' | 'Cancelada' | 'En Proceso';

export interface Order {
  id: string;
  orderNumber: string;
  switchOrderNumber: string;
  date: string;
  status: OrderStatus;
  clientName: string;
  clientEmail: string;
  clientCode: string;
  items: OrderItem[];
  subtotal: number;
}
