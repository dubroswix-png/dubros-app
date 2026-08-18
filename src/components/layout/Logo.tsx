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
  const iconWidth = isLarge ? 54 : isSmall ? 32 : 42;
  const iconHeight = isLarge ? 24 : isSmall ? 14 : 18;
  const titleSize = isLarge ? '1.5rem' : isSmall ? '1.1rem' : '1.35rem';
  const subSize = isLarge ? '0.6rem' : isSmall ? '0.45rem' : '0.52rem';

  const [useImage, setUseImage] = React.useState(true);

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
      }}
    >
      {useImage ? (
        <img
          src="/images/logo.svg"
          alt="Dubros Internacional"
          style={{
            height: `${logoHeight}px`,
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
          onError={() => setUseImage(false)}
        />
      ) : (
        <>
      {/* Optical Glasses SVG Icon */}
      <svg
        width={iconWidth}
        height={iconHeight}
        viewBox="0 0 54 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: '3px' }}
      >
        {/* Left Rim */}
        <rect
          x="1.5"
          y="2.5"
          width="21"
          height="17"
          rx="5.5"
          stroke="var(--navy)"
          strokeWidth="2.5"
        />
        {/* Right Rim */}
        <rect
          x="31.5"
          y="2.5"
          width="21"
          height="17"
          rx="5.5"
          stroke="var(--navy)"
          strokeWidth="2.5"
        />
        {/* Bridge */}
        <path
          d="M22.5 7.5C25.5 5 28.5 5 31.5 7.5"
          stroke="var(--navy)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Left Temple Accent */}
        <path
          d="M2 5L0 4"
          stroke="var(--navy)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Right Temple Accent */}
        <path
          d="M52 5L54 4"
          stroke="var(--navy)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Brand Name */}
      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 900,
          fontSize: titleSize,
          letterSpacing: '0.12em',
          color: 'var(--navy)',
          textTransform: 'uppercase',
          marginTop: '1px',
        }}
      >
        DUBROS
      </span>

      {/* Subtitle */}
      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: subSize,
          letterSpacing: '0.35em',
          color: 'var(--blue)',
          textTransform: 'uppercase',
          marginTop: '2px',
        }}
      >
        INTERNACIONAL
      </span>
      </>
      )}
    </Link>
  );
}
