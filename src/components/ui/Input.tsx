'use client';

import React, { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
}

export function Input({ label, icon, error, style, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
      {label && (
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%' }}>
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </div>
        )}
        <input
          {...props}
          style={{
            width: '100%',
            padding: icon ? '0.7rem 0.9rem 0.7rem 2.4rem' : '0.7rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            border: error ? '1px solid var(--red)' : '1px solid var(--input-border)',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)',
            fontSize: '0.88rem',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            ...style,
          }}
        />
      </div>
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--red)' }}>{error}</span>}
    </div>
  );
}
