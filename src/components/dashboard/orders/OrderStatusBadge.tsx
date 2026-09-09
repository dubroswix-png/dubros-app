'use client';

import React from 'react';

export type OrderStatusType = 'Pendiente' | 'En Proceso' | 'Completada' | 'Cancelada' | 'Procesado' | string;

export interface OrderStatusBadgeProps {
  status: OrderStatusType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export function getStatusTheme(status: OrderStatusType) {
  switch (status) {
    case 'Completada':
    case 'Procesado':
    case 'En Proceso':
      return { bg: '#DEF7EC', text: '#03543F', border: '#84E1BC', dot: '#10B981' };
    case 'Cancelada':
      return { bg: '#FEE2E2', text: '#991B1B', border: '#F87171', dot: '#EF4444' };
    case 'Pendiente':
    default:
      return { bg: '#FEF9C3', text: '#713F12', border: '#FDE047', dot: '#F59E0B' };
  }
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
  style = {},
}) => {
  const theme = getStatusTheme(status);

  // Normalize 'En Proceso' to 'Procesado' for clear green visual indicator
  const displayLabel = status === 'En Proceso' || status === 'Procesado' ? 'Procesado' : (status || 'Pendiente');

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '0.2rem 0.6rem', fontSize: '0.72rem' },
    md: { padding: '0.35rem 0.85rem', fontSize: '0.8rem' },
    lg: { padding: '0.45rem 1.15rem', fontSize: '0.88rem' },
  };

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        borderRadius: '9999px',
        fontWeight: 700,
        backgroundColor: theme.bg,
        color: theme.text,
        border: `1px solid ${theme.border}`,
        ...sizeStyles[size],
        ...style,
      }}
    >
      <span
        style={{
          width: size === 'sm' ? '6px' : '8px',
          height: size === 'sm' ? '6px' : '8px',
          borderRadius: '50%',
          backgroundColor: theme.dot,
        }}
      />
      {displayLabel}
    </span>
  );
};
