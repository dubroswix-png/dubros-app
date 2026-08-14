'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag, Users, PackageCheck, Image, ArrowUpRight, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DashboardHomePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    products: 0,
    brands: 0,
    users: 0,
    orders: 0,
    withImage: 0,
    withoutImage: 0,
  });

  useEffect(() => {
    async function loadDashboardStats() {
      setLoading(true);
      try {
        const [
          { count: prodCount },
          { count: brandCount },
          { count: userCount },
          { count: orderCount },
          { count: noImageCount },
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('brands').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }).or('thumbnail_url.is.null,thumbnail_url.eq./images/product-placeholder.png'),
        ]);

        const totalProd = prodCount || 0;
        const noImg = noImageCount || 0;

        setStats({
          products: totalProd,
          brands: brandCount || 0,
          users: userCount || 0,
          orders: orderCount || 0,
          withImage: Math.max(0, totalProd - noImg),
          withoutImage: noImg,
        });
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardStats();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>📊 Inicio Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Resumen operativo del catálogo, clientes y sincronización ERP en tiempo real.
        </p>
      </div>

      {/* KPI CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Productos</span>
            <Tag size={20} color="var(--blue)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {loading ? <Loader2 className="animate-spin" size={28} /> : stats.products.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.25rem' }}>
            <TrendingUp size={12} /> {stats.brands} Marcas activas
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Usuarios Registrados</span>
            <Users size={20} color="var(--teal)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {loading ? <Loader2 className="animate-spin" size={28} /> : stats.users.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', display: 'block' }}>
            Ópticas y Distribuidores en Supabase
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pedidos Registrados</span>
            <PackageCheck size={20} color="var(--orange)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {loading ? <Loader2 className="animate-spin" size={28} /> : stats.orders.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.25rem' }}>
            <TrendingUp size={12} /> Sincronizados con Switch ERP
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Imágenes en S3</span>
            <Image size={20} color="var(--pink)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {loading ? <Loader2 className="animate-spin" size={28} /> : stats.withImage.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: stats.withoutImage > 0 ? '#EF4444' : 'var(--green)', marginTop: '0.25rem', display: 'block' }}>
            {stats.withoutImage.toLocaleString()} productos sin imagen
          </span>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem' }}>Accesos Rápidos</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <Link href="/dashboard/articulos" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Sincronización ERP & Carga Masiva</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sincronizar catálogo ERP o importar vía CSV</p>
          </div>
          <ArrowUpRight size={20} color="var(--blue)" />
        </Link>

        <Link href="/dashboard/restricciones" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Restricción por País</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Configurar visibilidad de marcas en LATAM</p>
          </div>
          <ArrowUpRight size={20} color="var(--blue)" />
        </Link>

        <Link href="/dashboard/contactos" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Solicitudes de Contacto</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Convertir contactos en cuentas de cliente</p>
          </div>
          <ArrowUpRight size={20} color="var(--blue)" />
        </Link>
      </div>
    </div>
  );
}

