'use client';

import React from 'react';
import { Product } from '@/data/mock';
import { ProductCard } from './ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useLanguage } from '@/context/LanguageContext';

interface ProductGridProps {
  products: Product[];
  resetFilters: () => void;
}

export function ProductGrid({ products, resetFilters }: ProductGridProps) {
  const { t } = useLanguage();

  if (products.length === 0) {
    return (
      <EmptyState
        title={t('catalog.empty' as any)}
        description={t('catalog.emptyDesc' as any)}
        actionLabel={t('catalog.resetFilters' as any)}
        onAction={resetFilters}
      />
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '1.5rem',
      }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
