'use client';

import React from 'react';
import { BadgePercent, Plus, Check, X } from 'lucide-react';

export default function AdminPromotionsPage() {
  const mockPromos = [
    { id: '1', desc: '20$ Dólares la pieza', start: '6/19/26', end: '8/31/26', type: 'Valor fijo', val: '$20.00', active: true },
    { id: '2', desc: 'Oferta medio año 40%', start: '10/01/25', end: '10/01/25', type: 'Porcentaje', val: '40%', active: false },
    { id: '3', desc: 'Promoción prueba', start: '8/01/25', end: '8/31/25', type: 'Porcentaje', val: '20%', active: false },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>🏷️ Listado de Promociones</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Reglas de descuento de valor fijo y porcentaje acumulables en catálogo.
          </p>
        </div>

        <button className="btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
          <Plus size={18} /> Crear Promoción
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {mockPromos.map((promo) => (
          <div key={promo.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{promo.desc}</h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', backgroundColor: promo.active ? '#DCFCE7' : '#F3F4F6', color: promo.active ? '#15803D' : '#6B7280' }}>
                  {promo.active ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '1.5rem' }}>
                <span>Inicio: <strong>{promo.start}</strong></span>
                <span>Fin: <strong>{promo.end}</strong></span>
                <span>Tipo: <strong>{promo.type}</strong></span>
                <span>Valor: <strong>{promo.val}</strong></span>
              </div>
            </div>

            <button className="btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
              Ver detalles
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
