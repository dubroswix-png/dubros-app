'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
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
              Más de 25 años distribuyendo monturas ópticas y gafas de sol de alta calidad para ópticas y distribuidores en toda Latinoamérica.
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
              Navegación
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li>
                <Link href="/" style={{ color: 'var(--text-footer)', transition: 'color 0.2s' }}>
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/catalogo" style={{ color: 'var(--text-footer)', transition: 'color 0.2s' }}>
                  Catálogo de Productos
                </Link>
              </li>
              <li>
                <Link href="/blog" style={{ color: 'var(--text-footer)', transition: 'color 0.2s' }}>
                  Blog y Novedades
                </Link>
              </li>
              <li>
                <Link href="/contacto" style={{ color: 'var(--text-footer)', transition: 'color 0.2s' }}>
                  Contacto Directo
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
              Contáctanos
            </h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              📍 Zona Libre de Colón, Panamá
            </p>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              📧 ventas@dubros.com
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              💬 WhatsApp Servicio al Cliente: +507 6000-0000
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
              Mantente Informado
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5' }}>
              Manténgase al día con los anuncios, innovaciones y actualizaciones importantes de Dubros hoy.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              style={{ display: 'flex', gap: '0.5rem' }}
            >
              <input
                type="email"
                placeholder="Tu correo electrónico"
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
                Suscribirme
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
            © {new Date().getFullYear()} Dubros. Todos los derechos reservados.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="#" style={{ color: 'var(--text-footer)' }}>
              Política de Privacidad
            </Link>
            <Link href="#" style={{ color: 'var(--text-footer)' }}>
              Términos y Condiciones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
