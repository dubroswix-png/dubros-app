'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  PackageCheck,
  FileText,
  Image,
  Tag,
  Copy,
  BadgePercent,
  Mail,
  Contact,
  Wand2,
  Globe,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Usuarios', href: '/dashboard/usuarios', icon: Users },
    { label: 'Pedidos', href: '/dashboard/pedidos', icon: PackageCheck },
    { label: 'Blog', href: '/dashboard/blog', icon: FileText },
    { label: 'Imágenes', href: '/dashboard/imagenes', icon: Image },
    { label: 'Artículos', href: '/dashboard/articulos', icon: Tag },
    { label: 'Duplicados', href: '/dashboard/duplicados', icon: Copy },
    { label: 'Promociones', href: '/dashboard/promociones', icon: BadgePercent },
    { label: 'Campañas', href: '/dashboard/campanas', icon: Mail },
    { label: 'Contactos', href: '/dashboard/contactos', icon: Contact },
    { label: 'Wizard', href: '/dashboard/wizard', icon: Wand2 },
    { label: 'Restricciones País', href: '/dashboard/restricciones', icon: Globe },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 76px)', backgroundColor: 'var(--bg-secondary)' }}>
      
      {/* ADMIN SIDEBAR */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-light)',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ padding: '0.5rem 0.75rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--blue)' }}>
              Panel de Administración
            </span>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldAlert size={14} color="#EF4444" /> dubroswix@gmail.com
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? 'var(--blue)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--text-primary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              padding: '0.5rem 0.9rem',
            }}
          >
            <ArrowLeft size={16} /> Volver al Sitio Público
          </Link>
        </div>
      </aside>

      {/* DASHBOARD CONTENT AREA */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>

    </div>
  );
}
