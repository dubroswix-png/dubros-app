'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'light' | 'dark' | 'auto';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ variant = 'auto', className, size = 'md' }: LogoProps) {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';
  const logoHeight = isLarge ? 54 : isSmall ? 32 : 44;
  const isDarkVariant = variant === 'dark';
  const isLightVariant = variant === 'light';

  return (
    <Link
      href="/"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        textDecoration: 'none',
        background: 'transparent',
      }}
    >
      <img
        src="/images/logo.png"
        alt="Dubros International"
        className={`dubros-logo-img ${isDarkVariant ? 'logo-dark-variant' : ''} ${isLightVariant ? 'logo-light-variant' : ''}`}
        style={{
          height: `${logoHeight}px`,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
          background: 'transparent',
          filter: isDarkVariant ? 'brightness(0) invert(1)' : undefined,
          transition: 'filter 0.2s ease',
        }}
      />
    </Link>
  );
}
