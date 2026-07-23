'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const toggleLanguage = () => {
    const nextLang = locale === 'es' ? 'en' : 'es';
    setLocale(nextLang);
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
      {locale === 'es' ? '🇪🇸 ES' : '🇺🇸 EN'}
    </button>
  );
}
