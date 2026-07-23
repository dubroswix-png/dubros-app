'use client';

import React from 'react';
import Link from 'next/link';
import { Tag, Users, PackageCheck, Image, ShieldAlert, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function DashboardHomePage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>📊 Inicio Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Resumen operativo del catálogo, clientes y sincronización ERP.
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
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>14,466</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.25rem' }}>
            <TrendingUp size={12} /> 172 Marcas activas
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Usuarios Registrados</span>
            <Users size={20} color="var(--teal)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>1,240</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', display: 'block' }}>
            Ópticas y Distribuidores
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pedidos del Mes</span>
            <PackageCheck size={20} color="var(--orange)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>185</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.25rem' }}>
            <TrendingUp size={12} /> 98.4% Sincronizados con Switch
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Imágenes S3</span>
            <Image size={20} color="var(--pink)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>12,890</div>
          <span style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.25rem', display: 'block' }}>
            1,576 productos sin imagen
          </span>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem' }}>Accesos Rápidos</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <Link href="/dashboard/articulos" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Carga Masiva de Productos</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Importar artículos vía CSV (12 columnas)</p>
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
