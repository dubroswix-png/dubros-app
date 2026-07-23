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
  gender: 'Hombre' | 'Mujer' | 'Unisex';
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

// 172 marcas conocidas de Dubros
export const MOCK_BRANDS: Brand[] = [
  { id: '1', name: 'LCT', active: true },
  { id: '2', name: 'GIORDANNI', active: true },
  { id: '3', name: 'VERONA', active: true },
  { id: '4', name: 'TACT.', active: true },
  { id: '5', name: 'MUNDIAL', active: true },
  { id: '6', name: 'NEW WAY', active: true },
  { id: '7', name: 'DIANI', active: true },
  { id: '8', name: 'FRANJA', active: true },
  { id: '9', name: 'MECGAN', active: true },
  { id: '10', name: 'MUDANZA', active: true },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Aros Ópticos' },
  { id: 'c2', name: 'Lentes de Sol' },
  { id: 'c3', name: 'Accesorios' },
  { id: 'c4', name: 'Estuches' },
];

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'col1',
    name: 'Koroit Titanium Series',
    description: 'Monturas ultraligeras de titanio premium para máximo confort diario.',
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'col2',
    name: 'Verona Acetato Italiano',
    description: 'Diseños contemporáneos en acetato pulido a mano con acabados de alta gama.',
    imageUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'col3',
    name: 'Giordanni Flex Kids',
    description: 'Flexibilidad 360° y durabilidad extrema diseñada para los más pequeños.',
    imageUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=600&auto=format&fit=crop&q=80',
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    reference: 'Koroit012345E',
    code: '14001',
    description: 'Aro óptico rectangular en titanio ligero con sistema flex en varillas.',
    price: 24.50,
    eyeSize: 52,
    brand: 'LCT',
    material: 'Titanio',
    gender: 'Unisex',
    saleType: 'PIEZA',
    category: 'Aros Ópticos',
    collection: 'Koroit Titanium Series',
    quantity: 120,
    flex: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&auto=format&fit=crop&q=80',
    largeImageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'p2',
    reference: 'VeronaVR982',
    code: '14002',
    description: 'Montura oftálmica estilo cat-eye en acetato translúcido Habana.',
    price: 32.00,
    eyeSize: 54,
    brand: 'VERONA',
    material: 'Acetato',
    gender: 'Mujer',
    saleType: 'PIEZA',
    category: 'Aros Ópticos',
    collection: 'Verona Acetato Italiano',
    quantity: 85,
    flex: false,
    thumbnailUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=300&auto=format&fit=crop&q=80',
    largeImageUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'p3',
    reference: 'GiordanniGDR04',
    code: '14003',
    description: 'Aro ejecutivo en metal monel con bisagras accionadas por resorte.',
    price: 19.90,
    eyeSize: 55,
    brand: 'GIORDANNI',
    material: 'Metal',
    gender: 'Hombre',
    saleType: 'PIEZA',
    category: 'Aros Ópticos',
    quantity: 210,
    flex: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=300&auto=format&fit=crop&q=80',
    largeImageUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'p4',
    reference: 'TacticalTCT01',
    code: '14004',
    description: 'Gafa deportiva de alto impacto con terminales de goma antideslizante.',
    price: 28.00,
    eyeSize: 58,
    brand: 'TACT.',
    material: 'TR90',
    gender: 'Hombre',
    saleType: 'PIEZA',
    category: 'Lentes de Sol',
    quantity: 60,
    flex: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&auto=format&fit=crop&q=80',
    largeImageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'p5',
    reference: 'MundialMD05',
    code: '14005',
    description: 'Montura redonda de tendencia retro en combinación metal-acetato.',
    price: 22.00,
    eyeSize: 50,
    brand: 'MUNDIAL',
    material: 'Combinado',
    gender: 'Unisex',
    saleType: 'PIEZA',
    category: 'Aros Ópticos',
    quantity: 145,
    flex: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=300&auto=format&fit=crop&q=80',
    largeImageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80',
  },
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: 'Tendencias en Marcas Ópticas para Latinoamérica en 2026',
    shortDescription: 'Descubre los materiales y estilos que dominarán los escaparates de las ópticas este año.',
    content: '<p>El mercado óptico en Latinoamérica evoluciona hacia materiales ultra livianos como el TR90 y el titanio flex...</p>',
    featuredImageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
    tags: ['Tendencias', 'Ópticas', 'Novedades'],
    slug: 'tendencias-marcas-opticas-2026',
    publishedAt: '2026-07-20',
    author: 'Dubros Team',
  },
  {
    id: 'b2',
    title: 'Cómo Elegir el Material Adecuado para tu Catálogo de Óptica',
    shortDescription: 'Comparativa exhaustiva entre Acetato, Titanio, Monel y TR90 para tus clientes.',
    content: '<p>Cada cliente tiene necesidades únicas según su ritmo de vida y prescripción médica...</p>',
    featuredImageUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80',
    tags: ['Materiales', 'Guía', 'Productos'],
    slug: 'como-elegir-material-adecuado-optica',
    publishedAt: '2026-07-15',
    author: 'Dubros Team',
  },
];

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

export const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: '1198',
    switchOrderNumber: '16-000003355',
    date: 'Mie, Jul 22, 2026',
    status: 'Completada',
    clientName: 'SARA TEJADA',
    clientEmail: 'sara.tejada@gmail.com',
    clientCode: '2639',
    subtotal: 308.42,
    items: [
      { product: MOCK_PRODUCTS[0], quantity: 52 },
      { product: MOCK_PRODUCTS[1], quantity: 52 },
      { product: MOCK_PRODUCTS[2], quantity: 7 },
    ]
  },
  {
    id: '2',
    orderNumber: '1197',
    switchOrderNumber: '16-000003354',
    date: 'Mie, Jul 15, 2026',
    status: 'Completada',
    clientName: 'OPTICA VISION SUR',
    clientEmail: 'compras@visionsur.com',
    clientCode: '1045',
    subtotal: 540.00,
    items: [
      { product: MOCK_PRODUCTS[3], quantity: 100 },
    ]
  }
];
