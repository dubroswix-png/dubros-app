'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  ShoppingCart,
  Heart,
  Shield,
  Menu,
  X,
  User,
  LogOut,
  ChevronRight,
  PackageCheck,
  FileText,
  Phone,
  Grid,
  Home,
} from 'lucide-react';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { totalArticles, openCart } = useCart();
  const { favorites } = useFavorites();
  const { isLoggedIn, userProfile, logout } = useAuth();
  const { t } = useLanguage();

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: isMobileMenuOpen ? 999999 : 50,
        backgroundColor: isMobileMenuOpen ? 'var(--bg-primary)' : 'var(--bg-nav)',
        borderBottom: '1px solid var(--border-light)',
        backdropFilter: isMobileMenuOpen ? 'none' : 'blur(8px)',
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
        {/* LOGO */}
        <Logo size="md" />

        {/* DESKTOP NAVIGATION */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            fontSize: '0.95rem',
            fontWeight: 600,
          }}
          className="desktop-nav"
        >
          <Link
            href="/"
            style={{
              color: pathname === '/' ? 'var(--blue)' : 'var(--text-primary)',
              transition: 'color 0.2s',
            }}
          >
            {t('nav.home' as any)}
          </Link>
          <Link
            href="/catalogo"
            style={{
              color: pathname.startsWith('/catalogo') ? 'var(--blue)' : 'var(--text-primary)',
              transition: 'color 0.2s',
            }}
          >
            {t('nav.catalog' as any)}
          </Link>
          <Link
            href="/blog"
            style={{
              color: pathname.startsWith('/blog') ? 'var(--blue)' : 'var(--text-primary)',
              transition: 'color 0.2s',
            }}
          >
            {t('nav.blog' as any)}
          </Link>
          <Link
            href="/contacto"
            style={{
              color: pathname === '/contacto' ? 'var(--blue)' : 'var(--text-primary)',
              transition: 'color 0.2s',
            }}
          >
            {t('nav.contact' as any)}
          </Link>
          {isLoggedIn && (
            <Link
              href="/mi-cuenta/pedidos"
              style={{
                color: pathname.startsWith('/mi-cuenta/pedidos') ? 'var(--blue)' : 'var(--text-primary)',
                transition: 'color 0.2s',
              }}
            >
              {t('nav.orders' as any)}
            </Link>
          )}
        </nav>

        {/* ACTIONS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

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

          {isLoggedIn && (
            <button
              onClick={openCart}
              aria-label="Carrito"
              style={{
                padding: '0.5rem',
                color: 'var(--text-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                position: 'relative',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
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
            </button>
          )}

          {/* Desktop User Section */}
          <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {userProfile?.role === 'admin' && (
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
                    {t('nav.dashboard' as any)}
                  </Link>
                )}
                <Link
                  href="/mi-cuenta/perfil"
                  aria-label="Mi Perfil"
                  title="Mi Perfil"
                  style={{
                    color: 'var(--text-primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.45rem',
                  }}
                >
                  <User size={18} />
                </Link>
                <button
                  onClick={logout}
                  aria-label="Cerrar sesión"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.45rem',
                  }}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginLeft: '0.5rem',
                }}
              >
                {t('nav.login' as any)} <User size={18} />
              </Link>
            )}
          </div>

          {/* MOBILE BURGER TOGGLE BUTTON */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Abrir menú"
            className="mobile-toggle"
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '76px',
            left: 0,
            right: 0,
            bottom: 0,
            height: 'calc(100dvh - 76px)',
            backgroundColor: 'var(--bg-primary)',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem 1.25rem 2.5rem 1.25rem',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            borderTop: '1px solid var(--border-light)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Main Mobile Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: pathname === '/' ? 'var(--blue-light)' : 'transparent',
                color: pathname === '/' ? 'var(--blue)' : 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '1.05rem',
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Home size={20} />
                <span>{t('nav.home' as any)}</span>
              </div>
              <ChevronRight size={18} opacity={0.5} />
            </Link>

            <Link
              href="/catalogo"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: pathname.startsWith('/catalogo') ? 'var(--blue-light)' : 'transparent',
                color: pathname.startsWith('/catalogo') ? 'var(--blue)' : 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '1.05rem',
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Grid size={20} />
                <span>{t('nav.catalog' as any)}</span>
              </div>
              <ChevronRight size={18} opacity={0.5} />
            </Link>

            <Link
              href="/blog"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: pathname.startsWith('/blog') ? 'var(--blue-light)' : 'transparent',
                color: pathname.startsWith('/blog') ? 'var(--blue)' : 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '1.05rem',
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={20} />
                <span>{t('nav.blog' as any)}</span>
              </div>
              <ChevronRight size={18} opacity={0.5} />
            </Link>

            <Link
              href="/contacto"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: pathname === '/contacto' ? 'var(--blue-light)' : 'transparent',
                color: pathname === '/contacto' ? 'var(--blue)' : 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '1.05rem',
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Phone size={20} />
                <span>{t('nav.contact' as any)}</span>
              </div>
              <ChevronRight size={18} opacity={0.5} />
            </Link>

            {isLoggedIn && (
              <Link
                href="/mi-cuenta/pedidos"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: pathname.startsWith('/mi-cuenta/pedidos') ? 'var(--blue-light)' : 'transparent',
                  color: pathname.startsWith('/mi-cuenta/pedidos') ? 'var(--blue)' : 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  textDecoration: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <PackageCheck size={20} />
                  <span>{t('nav.orders' as any)}</span>
                </div>
                <ChevronRight size={18} opacity={0.5} />
              </Link>
            )}

            {isLoggedIn && userProfile?.role === 'admin' && (
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#EFF6FF',
                  color: 'var(--blue)',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  textDecoration: 'none',
                  border: '1px solid #BFDBFE',
                  marginTop: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Shield size={20} />
                  <span>{t('nav.dashboard' as any)}</span>
                </div>
                <ChevronRight size={18} />
              </Link>
            )}
          </div>

          {/* User / Auth Mobile Section */}
          <div
            style={{
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginTop: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Configuración</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>

            {isLoggedIn ? (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link
                  href="/mi-cuenta/perfil"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem', justifyContent: 'center' }}
                >
                  <User size={18} /> Mi Perfil
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="btn-secondary"
                  style={{ padding: '0.75rem 1rem', color: '#DC2626', borderColor: '#FCA5A5' }}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '1rem',
                  justifyContent: 'center',
                  display: 'flex',
                }}
              >
                <User size={18} /> {t('nav.login' as any)}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
