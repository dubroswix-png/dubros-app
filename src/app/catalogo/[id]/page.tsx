import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductById, getFeaturedProducts } from '@/lib/products';
import { ProductDetailClient } from '@/components/catalog/ProductDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: 'Producto no encontrado | Dubros Eyewear',
      description: 'El modelo o referencia solicitada no está disponible en el catálogo.',
    };
  }

  const title = `${product.reference} - ${product.brand} | Montura Óptica B2B`;
  const description = `${product.description || `Montura de calidad óptica ${product.brand} referencia ${product.reference}. Material: ${product.material || 'Metal'}, Género: ${product.gender || 'Unisex'}. Distribución mayorista B2B desde Zona Libre de Colón.`}`;
  const imageUrl = product.largeImageUrl || product.thumbnailUrl || 'https://dubros.com/images/logo.png';

  return {
    title,
    description,
    keywords: [
      product.brand,
      product.reference,
      product.material || 'óptica',
      'monturas ópticas',
      'lentes B2B',
      'distribución óptica mayorista',
    ],
    openGraph: {
      title: `${title} | Dubros Eyewear`,
      description,
      url: `https://dubros.com/catalogo/${product.id}`,
      siteName: 'Dubros Eyewear',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: `${product.brand} ${product.reference}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Dubros Eyewear`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const featured = await getFeaturedProducts(4);
  const suggestedProducts = featured.filter((p) => p.id !== product.id);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.brand} ${product.reference}`,
    image: product.largeImageUrl || product.thumbnailUrl,
    description: product.description || `Montura óptica ${product.brand} modelo ${product.reference}`,
    sku: product.code || product.reference,
    mpn: product.reference,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.price,
      availability: product.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Dubros Eyewear',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient product={product} suggestedProducts={suggestedProducts} />
    </>
  );
}
