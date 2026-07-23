'use client';

import React, { useState } from 'react';
import { Wand2, Download, FileSpreadsheet } from 'lucide-react';

export default function AdminWizardPage() {
  const [inputText, setInputText] = useState('');

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>🔍 Wizard — Generador de Productos</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Herramienta para procesar listas de referencias separadas por coma y exportar CSV masivo.
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Productos</h2>
        
        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
          Ingresa la lista de productos, separados por coma:
        </label>

        <textarea
          rows={5}
          placeholder="Type here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{
            width: '100%',
            padding: '0.8rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--input-border)',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            outline: 'none',
            marginBottom: '1rem',
          }}
        />

        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Sube la lista de referencias aquí
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Cantidad de productos a generar: <strong>{inputText ? inputText.split(',').length : 0}</strong>
          </span>

          <button className="btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
            <Download size={18} /> Descargar CSV
          </button>
        </div>
      </div>
    </div>
  );
}
