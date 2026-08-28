'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, MapPin, Mail, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Logo } from '@/components/layout/Logo';

export function Footer() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer
      style={{
        backgroundColor: '#071D3A',
        color: '#FFFFFF',
        paddingTop: '3.5rem',
        paddingBottom: '2.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div className="container" style={{ maxWidth: '1240px' }}>
        
        {/* TOP ROW: Logo, Center Nav Links, Social Icons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            paddingBottom: '2.5rem',
          }}
        >
          {/* Logo with Pure Transparent Background */}
          <Logo size="lg" variant="dark" />

          {/* Center Navigation Links */}
          <nav
            style={{
              display: 'flex',
              gap: '2.5rem',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/"
              style={{
                color: '#FFFFFF',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                transition: 'opacity 0.2s',
              }}
            >
              Inicio
            </Link>
            <Link
              href="/catalogo"
              style={{
                color: '#FFFFFF',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                transition: 'opacity 0.2s',
              }}
            >
              Catálogo
            </Link>
            <Link
              href="/blog"
              style={{
                color: '#FFFFFF',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                transition: 'opacity 0.2s',
              }}
            >
              Blog
            </Link>
            <Link
              href="/contacto"
              style={{
                color: '#FFFFFF',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                transition: 'opacity 0.2s',
              }}
            >
              Contacto
            </Link>
          </nav>

          {/* Right: Social Icons */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@dubrosinternational"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok Dubros"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                color: '#071D3A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '0.9rem',
                transition: 'transform 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68a6.34 6.34 0 0 0 10.86 4.47 6.3 6.3 0 0 0 1.83-4.48V8.62a8.27 8.27 0 0 0 4.84 1.56v-3.49h-.94z"/>
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/dubros/?locale=es_LA"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook Dubros"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                color: '#071D3A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '0.9rem',
                transition: 'transform 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/dubrosinternational/?hl=es"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram Dubros"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                color: '#071D3A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '0.9rem',
                transition: 'transform 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* MIDDLE SECTION: 2 COLUMNS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            paddingTop: '2.5rem',
            paddingBottom: '3.5rem',
            alignItems: 'start',
          }}
        >
          {/* LEFT COLUMN: Contáctanos */}
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: '#0F4896',
                  color: '#FFFFFF',
                  padding: '0.4rem 1.25rem',
                  borderRadius: '9999px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                Contáctanos
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Teléfono Fijo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Phone size={17} color="#FFFFFF" />
                </div>
                <a
                  href="tel:+5074414731"
                  style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}
                >
                  T: +507 4414731
                </a>
              </div>

              {/* Dirección Física */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <MapPin size={17} color="#FFFFFF" />
                </div>
                <p style={{ margin: 0, color: '#FFFFFF', fontSize: '0.95rem', lineHeight: '1.45', maxWidth: '380px' }}>
                  Zona Libre de Interplaza Piso 4- Local 514, Colón, Panamá
                </p>
              </div>

              {/* WhatsApp 1 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MessageCircle size={17} color="#FFFFFF" />
                </div>
                <a
                  href="https://wa.me/50762926554"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}
                >
                  (+507) 6292-6554
                </a>
              </div>

              {/* WhatsApp 2 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MessageCircle size={17} color="#FFFFFF" />
                </div>
                <a
                  href="https://wa.me/50762912194"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}
                >
                  (+507) 6291-2194
                </a>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Mail size={17} color="#FFFFFF" />
                </div>
                <a
                  href="mailto:ventas@dubros.com"
                  style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}
                >
                  ventas@dubros.com
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Mantente Informado + Blue Box */}
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: '#0F4896',
                  color: '#FFFFFF',
                  padding: '0.4rem 1.25rem',
                  borderRadius: '9999px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                Mantente informado
              </span>
            </div>

            {/* Solid Blue Subscription Card */}
            <div
              style={{
                backgroundColor: '#0D50B8',
                borderRadius: '16px',
                padding: '2.5rem 2rem',
                maxWidth: '480px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              }}
            >
              <p
                style={{
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                  margin: '0 0 1.5rem 0',
                }}
              >
                Manténgase al día con los anuncios, innovaciones y actualizaciones importantes de Dubros hoy.
              </p>

              <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '8px',
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#FFFFFF',
                    color: '#0D50B8',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s, transform 0.1s',
                  }}
                >
                  {subscribed ? '✓ ¡Gracias por suscribirte!' : 'Suscribirme ahora'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* BOTTOM PAYMENT ICONS (Centered) */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem',
          }}
        >
          {/* American Express */}
          <div
            style={{
              backgroundColor: '#006FCF',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '0.65rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              textAlign: 'center',
              textTransform: 'uppercase',
              width: '54px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            AMERICAN<br />EXPRESS
          </div>

          {/* MasterCard */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '54px',
              height: '32px',
              position: 'relative',
            }}
          >
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#EB001B', opacity: 0.9 }}></div>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#F79E1B', opacity: 0.9, marginLeft: '-10px' }}></div>
          </div>

          {/* VISA */}
          <div
            style={{
              color: '#FFFFFF',
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: '1.4rem',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            VISA
          </div>

          {/* Logo Extra */}
          <img 
            src="https://f39fd0ce1482a1df9e42319c122cca40.cdn.bubble.io/f1764543315531x873078055523515500/40c71704198a1873a45c0cdf1b58aeff83d3a19f.png" 
            alt="Logo Extra"
            style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
          />
        </div>

      </div>
    </footer>
  );
}
