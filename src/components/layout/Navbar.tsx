'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { ShoppingCart, Heart, Shield, Menu, X } from 'lucide-react';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalArticles } = useCart();
  const { favorites } = useFavorites();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--bg-nav)',
        borderBottom: '1px solid var(--border-light)',
        backdropFilter: 'blur(8px)',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '76px',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: '1.6rem',
              letterSpacing: '-0.03em',
              fontFamily: 'var(--font-heading)',
              color: 'var(--navy)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span style={{ color: 'var(--blue)' }}>DU</span> BROS
          </div>
        </Link>

        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            fontSize: '0.95rem',
            fontWeight: 500,
          }}
          className="desktop-nav"
        >
          <Link href="/" style={{ color: 'var(--text-primary)', transition: 'color 0.2s' }}>
            Inicio
          </Link>
          <Link href="/catalogo" style={{ color: 'var(--text-primary)', transition: 'color 0.2s' }}>
            Catálogo
          </Link>
          <Link href="/blog" style={{ color: 'var(--text-primary)', transition: 'color 0.2s' }}>
            Blog
          </Link>
          <Link href="/contacto" style={{ color: 'var(--text-primary)', transition: 'color 0.2s' }}>
            Contacto
          </Link>
          <Link href="/mi-cuenta/pedidos" style={{ color: 'var(--text-primary)', transition: 'color 0.2s' }}>
            Pedidos
          </Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LanguageSwitcher />
          <ThemeToggle />

          <Link
            href="/catalogo?type=fav"
            aria-label="Favoritos"
            style={{
              padding: '0.5rem',
              color: 'var(--text-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Heart size={20} />
            {favorites.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '0px',
                  backgroundColor: '#EF4444',
                  color: '#FFF',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {favorites.length}
              </span>
            )}
          </Link>

          <Link
            href="/mi-cuenta/carrito"
            aria-label="Carrito"
            style={{
              padding: '0.5rem',
              color: 'var(--text-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <ShoppingCart size={20} />
            {totalArticles > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '0px',
                  backgroundColor: 'var(--blue)',
                  color: '#FFF',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {totalArticles}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard"
            className="btn-secondary"
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Shield size={16} />
            Dashboard
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
            className="mobile-toggle"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
