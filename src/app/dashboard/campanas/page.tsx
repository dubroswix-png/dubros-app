'use client';

import React from 'react';
import { Mail, Plus, Send, Edit, Trash2 } from 'lucide-react';

export default function AdminCampaignsPage() {
  const campaigns = [
    'GIORDANNI', 'VERONA', 'TACT.', 'MUNDIAL',
    'DESCUENTO', 'NEW WAY', 'DIANI', 'LCT',
    'FRANJA', 'MECGAN', 'MUDANZA', '30,000'
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>📧 Campañas de Email Marketing</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Envío masivo de boletines y promociones a la base de contactos de ópticas.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" style={{ padding: '0.65rem 1.25rem' }}>
            <Send size={16} /> Enviar Campaña
          </button>
          <button className="btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
            <Plus size={16} /> Crear Campaña
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
        {campaigns.map((name) => (
          <div key={name} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Campaña</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem', marginBottom: '1rem', color: 'var(--blue)' }}>
                {name}
              </h3>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
              <button aria-label="Editar" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <Edit size={16} />
              </button>
              <button aria-label="Eliminar" style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
