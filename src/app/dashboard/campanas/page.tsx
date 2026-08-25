'use client';

import React from 'react';
import { Mail, Plus, Send, Edit, Trash2 } from 'lucide-react';
import bubbleCampaigns from '@/data/bubble_campaigns.json';

export default function AdminCampaignsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>📧 Campañas de Email Marketing</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Plantillas dinámicas de SendGrid configuradas para el envío a ópticas y clientes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" style={{ padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Nueva Plantilla
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {(bubbleCampaigns as any[]).map((camp) => (
          <div key={camp.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--blue)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                  SendGrid Template
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{camp.date}</span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                {camp.subject}
              </h3>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-secondary)', wordBreak: 'break-all', marginBottom: '1rem' }}>
                ID: {camp.templateId}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Por: {camp.author}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button aria-label="Editar" className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                  <Edit size={14} />
                </button>
                <button aria-label="Enviar" className="btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Send size={13} /> Enviar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
