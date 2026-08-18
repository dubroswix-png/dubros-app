'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface BrandItemProps {
  name: string;
}

export function BrandItem({ name }: BrandItemProps) {
  const [imageError, setImageError] = useState(false);
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');

  return (
    <Link
      href={`/catalogo?brand=${encodeURIComponent(name)}`}
      className="brand-card-item"
      title={`Ver monturas ${name}`}
    >
      {!imageError ? (
        <img
          src={`/images/brands/${slug}.png`}
          alt={name}
          style={{
            height: '42px',
            maxWidth: '140px',
            objectFit: 'contain',
            display: 'block',
          }}
          onError={() => setImageError(true)}
        />
      ) : (
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '1.35rem',
            letterSpacing: '0.08em',
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
          }}
        >
          {name}
        </span>
      )}
    </Link>
  );
}
