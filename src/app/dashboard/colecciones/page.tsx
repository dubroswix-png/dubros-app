'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, RefreshCw, Eye, ArrowLeft, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CollectionItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  createdAt?: string;
  productCount: number;
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '/images/collection-titanium.jpg',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load collections
  async function loadCollections() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/collections');
      const data = await res.json();
      if (res.ok) {
        setCollections(data.collections || []);
      } else {
        setError(data.error || 'Error cargando las colecciones');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCollections();
  }, []);

  // Handle Create Collection
  async function handleCreateCollection(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('El nombre de la colección es obligatorio.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Colección "${formData.name}" creada exitosamente.`);
        setShowCreateModal(false);
        setFormData({ name: '', description: '', imageUrl: '/images/collection-titanium.jpg' });
        loadCollections();
      } else {
        setFormError(data.error || 'Error al crear la colección.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error de red.');
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Delete Collection
  async function handleDeleteCollection(id: string, name: string) {
    if (!confirm(`¿Estás seguro de eliminar la colección "${name}"? Los productos seguirán en el catálogo sin estar asignados a esta colección.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccessMessage(`Colección "${name}" eliminada.`);
        loadCollections();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar');
      }
    } catch (err: any) {
      alert(err.message || 'Error de conexión');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers size={28} color="var(--blue)" /> Gestión de Colecciones de Diseño
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Organiza monturas en líneas de diseño exclusivas (Titanium, Acetato, Flex Kids, etc.).
          </p>
        </div>

        <button
          onClick={() => {
            setShowCreateModal(true);
            setFormError(null);
            setSuccessMessage(null);
          }}
          className="btn-primary"
          style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> Nueva Colección
        </button>
      </div>

      {successMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#DCFCE7',
            color: '#15803D',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: 'var(--bg-card)',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>Crear Nueva Colección</h2>

            {formError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCollection} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Nombre de la Colección *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Verona Acetato Italiano"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Descripción
                </label>
                <textarea
                  rows={3}
                  placeholder="Descripción de la línea de diseño..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  URL de Imagen de Portada
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                  style={{ padding: '0.6rem 1.25rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {submitting ? <RefreshCw size={16} className="spin" /> : <Plus size={16} />}
                  Guardar Colección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COLLECTIONS GRID */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem auto' }} />
          <p>Cargando colecciones...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Layers size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No hay colecciones creadas</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Crea tu primera colección para agrupar monturas y destacarlas en la página de inicio.
          </p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
            <Plus size={16} /> Crear Primera Colección
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {collections.map((col) => (
            <div
              key={col.id}
              className="card"
              style={{
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ height: '180px', width: '100%', overflow: 'hidden', backgroundColor: '#F3F4F6', position: 'relative' }}>
                <img
                  src={col.imageUrl}
                  alt={col.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/product-placeholder.png'; }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    color: '#FFF',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {col.productCount} productos
                </span>
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{col.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                    {col.description || 'Sin descripción.'}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-light)',
                  }}
                >
                  <Link
                    href={`/catalogo?collection=${col.id}`}
                    target="_blank"
                    className="btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <ExternalLink size={14} /> Ver en Catálogo
                  </Link>

                  <button
                    onClick={() => handleDeleteCollection(col.id, col.name)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      cursor: 'pointer',
                      padding: '0.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    <Trash2 size={16} /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
