'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-footer)',
        color: 'var(--text-footer)',
        paddingTop: '4rem',
        paddingBottom: '2.5rem',
        borderTop: '1px solid var(--border-light)',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand Info */}
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: '1.6rem',
                fontFamily: 'var(--font-heading)',
                color: '#FFFFFF',
                marginBottom: '1rem',
              }}
            >
              <span style={{ color: 'var(--blue)' }}>DU</span> BROS
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-footer)' }}>
              {t('footer.about' as any)}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              style={{
                color: '#FFFFFF',
                fontSize: '1.1rem',
                fontWeight: 700,
                marginBottom: '1.25rem',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {t('footer.navigation' as any)}
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li>
                <Link href="/" style={{ color: 'var(--text-footer)', transition: 'color 0.2s' }}>
                  {t('nav.home' as any)}
                </Link>
              </li>
              <li>
                <Link href="/catalogo" style={{ color: 'var(--text-footer)', transition: 'color 0.2s' }}>
                  {t('nav.catalog' as any)}
                </Link>
              </li>
              <li>
                <Link href="/blog" style={{ color: 'var(--text-footer)', transition: 'color 0.2s' }}>
                  {t('nav.blog' as any)}
                </Link>
              </li>
              <li>
                <Link href="/contacto" style={{ color: 'var(--text-footer)', transition: 'color 0.2s' }}>
                  {t('nav.contact' as any)}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3
              style={{
                color: '#FFFFFF',
                fontSize: '1.1rem',
                fontWeight: 700,
                marginBottom: '1.25rem',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {t('footer.contact' as any)}
            </h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              📍 {t('footer.address' as any)}
            </p>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              📧 ventas@dubros.com
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              💬 {t('footer.whatsapp' as any)}
            </p>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h3
              style={{
                color: '#FFFFFF',
                fontSize: '1.1rem',
                fontWeight: 700,
                marginBottom: '1.25rem',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {t('footer.newsletter' as any)}
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5' }}>
              {t('footer.newsletter_desc' as any)}
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              style={{ display: 'flex', gap: '0.5rem' }}
            >
              <input
                type="email"
                placeholder={t('footer.email_placeholder' as any)}
                style={{
                  padding: '0.6rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #334155',
                  backgroundColor: '#1E293B',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  width: '100%',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              >
                {t('footer.subscribe' as any)}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.85rem',
          }}
        >
          <div>
            {t('footer.rights' as any)}
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="#" style={{ color: 'var(--text-footer)' }}>
              {t('footer.privacy' as any)}
            </Link>
            <Link href="#" style={{ color: 'var(--text-footer)' }}>
              {t('footer.terms' as any)}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
