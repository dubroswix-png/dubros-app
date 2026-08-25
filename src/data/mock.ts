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
  brand: string;
  material: string;
  gender: 'Hombre' | 'Mujer' | 'Unisex' | 'Niños';
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



import bubbleBlog from './bubble_blog.json';

export const MOCK_BLOG_POSTS: BlogPost[] = bubbleBlog as BlogPost[];

export const LATAM_COUNTRIES = [
  { name: 'Panamá', code: 'PA', dialCode: '+507', flag: '🇵🇦' },
  { name: 'Colombia', code: 'CO', dialCode: '+57', flag: '🇨🇴' },
  { name: 'Ecuador', code: 'EC', dialCode: '+593', flag: '🇪🇨' },
  { name: 'Costa Rica', code: 'CR', dialCode: '+506', flag: '🇨🇷' },
  { name: 'Guatemala', code: 'GT', dialCode: '+502', flag: '🇬🇹' },
  { name: 'Honduras', code: 'HN', dialCode: '+504', flag: '🇭🇳' },
  { name: 'Venezuela', code: 'VE', dialCode: '+58', flag: '🇻🇪' },
  { name: 'México', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
  { name: 'Perú', code: 'PE', dialCode: '+51', flag: '🇵🇪' },
  { name: 'Chile', code: 'CL', dialCode: '+56', flag: '🇨🇱' },
  { name: 'República Dominicana', code: 'DO', dialCode: '+1', flag: '🇩🇴' },
  { name: 'El Salvador', code: 'SV', dialCode: '+503', flag: '🇸🇻' },
  { name: 'Argentina', code: 'AR', dialCode: '+54', flag: '🇦🇷' },
  { name: 'Uruguay', code: 'UY', dialCode: '+598', flag: '🇺🇾' },
  { name: 'Paraguay', code: 'PY', dialCode: '+595', flag: '🇵🇾' },
  { name: 'Bolivia', code: 'BO', dialCode: '+591', flag: '🇧🇴' },
  { name: 'Nicaragua', code: 'NI', dialCode: '+505', flag: '🇳🇮' },
  { name: 'Cuba', code: 'CU', dialCode: '+53', flag: '🇨🇺' },
  { name: 'Puerto Rico', code: 'PR', dialCode: '+1', flag: '🇵🇷' },
  { name: 'Brasil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'España', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Estados Unidos', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'Belice', code: 'BZ', dialCode: '+501', flag: '🇧🇿' },
  { name: 'Guyana', code: 'GY', dialCode: '+592', flag: '🇬🇾' },
  { name: 'Surinam', code: 'SR', dialCode: '+597', flag: '🇸🇷' },
  { name: 'Trinidad y Tobago', code: 'TT', dialCode: '+1', flag: '🇹🇹' },
  { name: 'Jamaica', code: 'JM', dialCode: '+1', flag: '🇯🇲' },
  { name: 'Haití', code: 'HT', dialCode: '+509', flag: '🇭🇹' },
  { name: 'Curazao', code: 'CW', dialCode: '+599', flag: '🇨🇼' },
  { name: 'Aruba', code: 'AW', dialCode: '+297', flag: '🇦🇼' },
];

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  switchOrderNumber: string;
  date: string;
  status: 'Completada' | 'Pendiente' | 'Cancelada';
  clientName: string;
  clientEmail: string;
  clientCode: string;
  items: OrderItem[];
  subtotal: number;
}


