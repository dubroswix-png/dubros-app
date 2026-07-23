'use client';

import React, { useState } from 'react';

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<'es' | 'en'>('es');

  const toggleLanguage = () => {
    const nextLang = currentLang === 'es' ? 'en' : 'es';
    setCurrentLang(nextLang);
    // Transición suave o navegación de locale
  };

  return (
    <button
      onClick={toggleLanguage}
      aria-label="Switch Language"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-full)',
        padding: '0.35rem 0.75rem',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        color: 'var(--text-primary)',
        fontSize: '0.85rem',
        fontWeight: 600,
        transition: 'background-color 0.2s ease',
      }}
    >
      {currentLang === 'es' ? '🇪🇸 ES' : '🇺🇸 EN'}
    </button>
  );
}
