'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface BrandItemProps {
  name: string;
}

export function BrandItem({ name }: BrandItemProps) {
  const [imageError, setImageError] = useState(false);
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (imageError) return null;

  return (
    <Link
      href={`/catalogo?brand=${encodeURIComponent(name)}`}
      className="brand-card-item"
      title={`Ver monturas ${name}`}
    >
      <img
        src={`/images/brands/${slug}.png`}
        alt={name}
        onError={() => setImageError(true)}
      />
    </Link>
  );
}
