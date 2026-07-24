'use client';

import React from 'react';
import { LucideIcon, Search } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Search,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      className="card"
      style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <Icon size={48} style={{ opacity: 0.3, marginBottom: '1rem', marginInline: 'auto' }} />
      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h3>
      {description && (
        <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-secondary" style={{ padding: '0.6rem 1.25rem' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
