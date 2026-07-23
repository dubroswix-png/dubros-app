'use client';

import React, { useState } from 'react';
import { Tag, Upload, Plus, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export default function AdminArticlesPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'bulk'>('create');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tag size={28} color="var(--blue)" /> Gestión de Artículos y Productos
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Creación individual de monturas y carga masiva mediante archivo CSV.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('create')}
          className={activeTab === 'create' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
        >
          <Plus size={16} /> Crear Producto Individual
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={activeTab === 'bulk' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
        >
          <FileSpreadsheet size={16} /> Carga Masiva de Artículos (CSV)
        </button>
      </div>

      {activeTab === 'create' ? (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>Formulario de Producto</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Referencia *</label>
                <input type="text" placeholder="Ej: Koroit012345E" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Código *</label>
                <input type="text" placeholder="Código – Ej: 14001" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Descripción *</label>
                <textarea rows={3} placeholder="Aros ópticos..." style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Precio ($) *</label>
                <input type="number" step="0.01" placeholder="Precio por pieza" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Talla Ocular</label>
                <input type="number" placeholder="Ej: 52" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Marca *</label>
                <select style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}>
                  <option>LCT</option>
                  <option>VERONA</option>
                  <option>GIORDANNI</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Material *</label>
                <select style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}>
                  <option>Titanio</option>
                  <option>Acetato</option>
                  <option>Metal</option>
                  <option>TR90</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Género *</label>
                <select style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}>
                  <option>Hombre</option>
                  <option>Mujer</option>
                  <option>Unisex</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Tipo de Venta</label>
                <input type="text" defaultValue="PIEZA" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Categoría *</label>
                <select style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}>
                  <option>Aros Ópticos</option>
                  <option>Lentes de Sol</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Thumbnail (Máx 30kb)</label>
                <div style={{ border: '2px dashed var(--border-medium)', padding: '1.5rem 1rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                  <Upload size={24} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Agrega imagen pequeña</span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Imagen Grande</label>
                <input type="file" style={{ fontSize: '0.8rem' }} />
              </div>
              <button className="btn-primary" style={{ marginTop: 'auto', padding: '0.8rem', width: '100%' }}>
                Entrar / Guardar Producto
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>Carga Masiva de Artículos</h2>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--blue)' }}>Requerimientos del Archivo CSV:</h3>
            <ul style={{ listStylePosition: 'inside', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              <li>El archivo debe estar en formato <strong>.CSV</strong> (Delimitado por comas y UTF-8).</li>
              <li>La primera fila debe ser exactamente el nombre de la columna.</li>
              <li><strong>12 Columnas requeridas:</strong> <code>Codigo, Marca, Categoria, Descripcion, Genero, Material, Precio, Referencia, Tipo de Venta, Talla Ocular, Cantidad, Flex</code>.</li>
            </ul>
          </div>
          <div style={{ border: '2px dashed var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '3rem 2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <FileSpreadsheet size={48} color="var(--blue)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Haz click para seleccionar archivo CSV</h3>
          </div>
          <button onClick={() => setUploadSuccess(true)} className="btn-primary" style={{ padding: '0.8rem 2rem' }}>
            <Upload size={18} /> Upload Now
          </button>
          {uploadSuccess && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <CheckCircle2 size={20} /> ¡Carga masiva procesada exitosamente! Se actualizaron los productos.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
