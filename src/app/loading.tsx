import React from 'react';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';

export default function GlobalLoading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        gap: '1.25rem',
        padding: '2rem',
      }}
    >
      <Logo size="lg" />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          backgroundColor: '#FFFFFF',
          padding: '0.6rem 1.25rem',
          borderRadius: '9999px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid var(--border-light)',
        }}
      >
        <Loader2 size={20} color="var(--blue)" className="animate-spin" />
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
          Cargando contenido...
        </span>
      </div>
    </div>
  );
}
