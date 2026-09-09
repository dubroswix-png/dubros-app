'use client';

import React from 'react';

interface ProductSkeletonGridProps {
  count?: number;
}

export function ProductSkeletonGrid({ count = 8 }: ProductSkeletonGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '1.5rem',
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {/* Image skeleton */}
          <div
            className="skeleton-shimmer"
            style={{
              width: '100%',
              height: '180px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
            }}
          />

          {/* Reference & Brand skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', flex: 1 }}>
            <div
              className="skeleton-shimmer"
              style={{
                width: '40%',
                height: '12px',
                borderRadius: '4px',
              }}
            />
            <div
              className="skeleton-shimmer"
              style={{
                width: '75%',
                height: '18px',
                borderRadius: '4px',
              }}
            />
            <div
              className="skeleton-shimmer"
              style={{
                width: '50%',
                height: '12px',
                borderRadius: '4px',
              }}
            />
          </div>

          {/* Price & Button skeleton */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-light)',
            }}
          >
            <div
              className="skeleton-shimmer"
              style={{
                width: '60px',
                height: '22px',
                borderRadius: '4px',
              }}
            />
            <div
              className="skeleton-shimmer"
              style={{
                width: '80px',
                height: '32px',
                borderRadius: '6px',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
