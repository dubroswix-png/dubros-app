import React from 'react';

export default function ProductDetailLoading() {
  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Breadcrumbs skeleton */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem 0', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="skeleton-shimmer" style={{ width: '60px', height: '14px', borderRadius: '4px' }} />
          <div className="skeleton-shimmer" style={{ width: '80px', height: '14px', borderRadius: '4px' }} />
          <div className="skeleton-shimmer" style={{ width: '120px', height: '14px', borderRadius: '4px' }} />
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
          {/* Image skeleton */}
          <div>
            <div
              className="skeleton-shimmer"
              style={{
                width: '100%',
                height: '420px',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1rem',
              }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="skeleton-shimmer" style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)' }} />
              <div className="skeleton-shimmer" style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)' }} />
              <div className="skeleton-shimmer" style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)' }} />
            </div>
          </div>

          {/* Details skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="skeleton-shimmer" style={{ width: '90px', height: '24px', borderRadius: '4px' }} />
            <div className="skeleton-shimmer" style={{ width: '70%', height: '36px', borderRadius: '6px' }} />
            <div className="skeleton-shimmer" style={{ width: '100%', height: '60px', borderRadius: '6px' }} />

            {/* Spec grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="skeleton-shimmer" style={{ height: '40px', borderRadius: '6px' }} />
              <div className="skeleton-shimmer" style={{ height: '40px', borderRadius: '6px' }} />
              <div className="skeleton-shimmer" style={{ height: '40px', borderRadius: '6px' }} />
              <div className="skeleton-shimmer" style={{ height: '40px', borderRadius: '6px' }} />
            </div>

            {/* Boxing system card skeleton */}
            <div className="skeleton-shimmer" style={{ width: '100%', height: '90px', borderRadius: 'var(--radius-md)' }} />

            {/* Price skeleton */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="skeleton-shimmer" style={{ width: '150px', height: '48px', borderRadius: '6px' }} />
              <div className="skeleton-shimmer" style={{ width: '200px', height: '48px', borderRadius: 'var(--radius-md)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
