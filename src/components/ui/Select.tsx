'use client';

import React, { SelectHTMLAttributes, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
  icon?: ReactNode;
}

export function Select({ label, options, icon, style, ...props }: SelectProps) {
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
        <select
          {...props}
          style={{
            width: '100%',
            padding: icon ? '0.7rem 0.9rem 0.7rem 2.4rem' : '0.7rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--input-border)',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)',
            fontSize: '0.88rem',
            outline: 'none',
            cursor: 'pointer',
            ...style,
          }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
