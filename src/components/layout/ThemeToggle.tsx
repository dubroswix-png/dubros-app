'use client';

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      style={{
        background: 'transparent',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-full)',
        padding: '0.5rem',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-primary)',
        transition: 'background-color 0.2s ease',
      }}
    >
      {theme === 'light' ? (
        <Moon size={18} />
      ) : (
        <Sun size={18} color="#F59E0B" />
      )}
    </button>
  );
}
