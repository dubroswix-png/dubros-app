import React from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: '#FFFFFF',
          padding: '0.75rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid var(--border-light)',
        }}
      >
        <Loader2 size={24} color="var(--blue)" className="animate-spin" />
        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
          Cargando panel de administración...
        </span>
      </div>
    </div>
  );
}
