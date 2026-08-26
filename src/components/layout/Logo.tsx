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

  const iconWidth = isLarge ? 56 : isSmall ? 36 : 46;
  const iconHeight = isLarge ? 22 : isSmall ? 15 : 18;
  const titleSize = isLarge ? '1.5rem' : isSmall ? '1.05rem' : '1.3rem';
  const subSize = isLarge ? '0.55rem' : isSmall ? '0.42rem' : '0.48rem';

  // Determine colors based on variant
  const primaryColor =
    variant === 'dark'
      ? '#FFFFFF'
      : variant === 'light'
      ? '#071D3A'
      : 'var(--text-primary)';

  const accentColor =
    variant === 'dark'
      ? '#60A5FA'
      : variant === 'light'
      ? '#0F4896'
      : 'var(--blue)';

  return (
    <Link
      href="/"
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        lineHeight: 1,
        userSelect: 'none',
        background: 'transparent',
      }}
    >
      {/* Precision Geometric Glasses Icon */}
      <svg
        width={iconWidth}
        height={iconHeight}
        viewBox="0 0 56 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: '4px', display: 'block' }}
      >
        {/* Left Rim */}
        <rect
          x="2"
          y="2.5"
          width="21"
          height="17"
          rx="5"
          stroke={primaryColor}
          strokeWidth="2.2"
        />
        {/* Right Rim */}
        <rect
          x="33"
          y="2.5"
          width="21"
          height="17"
          rx="5"
          stroke={primaryColor}
          strokeWidth="2.2"
        />
        {/* Center Bridge */}
        <path
          d="M23 7.5C26 5 30 5 33 7.5"
          stroke={primaryColor}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Left Temple Accent */}
        <path
          d="M2 6L0 5"
          stroke={primaryColor}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Right Temple Accent */}
        <path
          d="M54 6L56 5"
          stroke={primaryColor}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>

      {/* DUBROS Brand Text */}
      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 900,
          fontSize: titleSize,
          letterSpacing: '0.14em',
          color: primaryColor,
          textTransform: 'uppercase',
          marginTop: '1px',
          display: 'block',
          textAlign: 'center',
          transition: 'color 0.2s ease',
        }}
      >
        DUBROS
      </span>

      {/* INTERNACIONAL Subtitle */}
      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: subSize,
          letterSpacing: '0.36em',
          color: accentColor,
          textTransform: 'uppercase',
          marginTop: '2px',
          display: 'block',
          textAlign: 'center',
          transition: 'color 0.2s ease',
        }}
      >
        INTERNACIONAL
      </span>
    </Link>
  );
}
