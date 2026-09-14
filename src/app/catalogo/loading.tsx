import React from 'react';
import { ProductSkeletonGrid } from '@/components/catalog/ProductSkeletonGrid';

export default function CatalogoLoading() {
  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
      {/* Title skeleton */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div
          className="skeleton-shimmer"
          style={{ width: '280px', height: '36px', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}
        />
        <div
          className="skeleton-shimmer"
          style={{ width: '450px', height: '18px', borderRadius: 'var(--radius-sm)' }}
        />
      </div>

      {/* Filter bar placeholder */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        <div className="skeleton-shimmer" style={{ flex: 1, height: '42px', borderRadius: 'var(--radius-md)' }} />
        <div className="skeleton-shimmer" style={{ width: '140px', height: '42px', borderRadius: 'var(--radius-md)' }} />
        <div className="skeleton-shimmer" style={{ width: '140px', height: '42px', borderRadius: 'var(--radius-md)' }} />
      </div>

      {/* Grid */}
      <ProductSkeletonGrid count={12} />
    </div>
  );
}
