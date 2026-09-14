'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Plus,
  Send,
  Edit2,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Search,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  X,
  Key,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import fallbackCampaigns from '@/data/bubble_campaigns.json';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  templateId: string;
  author: string;
  date?: string;
  sent_at?: string | null;
}

export default function AdminCampaignsPage() {
  const { userProfile } = useAuth();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    templateId: '',
    author: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Send Modal state
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState<Campaign | null>(null);
  const [sendData, setSendData] = useState({
    recipientEmail: '',
    recipientName: '',
    customApiKey: '',
  });
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync Modal state
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncApiKey, setSyncApiKey] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncTemplates, setSyncTemplates] = useState<any[]>([]);
  const [syncError, setSyncError] = useState('');
  const [syncSuccess, setSyncSuccess] = useState('');

  // Notification toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Fetch campaigns from API
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/campaigns');
      if (!res.ok) throw new Error('Error al cargar plantillas');
      const data = await res.json();
      if (data.campaigns && data.campaigns.length > 0) {
        setCampaigns(data.campaigns);
      } else {
        // Fallback to bubble_campaigns.json if DB returned empty
        const mapped = (fallbackCampaigns as any[]).map((c) => ({
          id: c.id,
          name: (c.subject || 'PLANTILLA').toUpperCase(),
          subject: c.subject,
          templateId: c.templateId,
          author: c.author,
          date: c.date,
        }));
        setCampaigns(mapped);
      }
    } catch (err: any) {
      console.warn('Fallback a plantillas locales:', err);
      const mapped = (fallbackCampaigns as any[]).map((c) => ({
        id: c.id,
        name: (c.subject || 'PLANTILLA').toUpperCase(),
        subject: c.subject,
        templateId: c.templateId,
        author: c.author,
        date: c.date,
      }));
      setCampaigns(mapped);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    const savedKey = localStorage.getItem('dubros_sendgrid_key');
    if (savedKey) {
      setSendData((prev) => ({ ...prev, customApiKey: savedKey }));
      setSyncApiKey(savedKey);
    }
  }, []);

  // 2. Open Form Modal (New or Edit)
  const handleOpenCreateModal = () => {
    setEditingCampaign(null);
    setFormData({
      name: '',
      subject: '',
      templateId: '',
      author: userProfile?.email || 'dubroswix@gmail.com',
    });
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (camp: Campaign) => {
    setEditingCampaign(camp);
    setFormData({
      name: camp.name,
      subject: camp.subject,
      templateId: camp.templateId,
      author: camp.author || userProfile?.email || 'dubroswix@gmail.com',
    });
    setFormError('');
    setIsFormModalOpen(true);
  };

  // 3. Save Form (Create or Update)
  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.templateId.trim()) {
      setFormError('Por favor ingresa el Template ID de SendGrid.');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError('');

      if (editingCampaign) {
        // Update
        const res = await fetch('/api/admin/campaigns', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingCampaign.id,
            name: formData.name,
            subject: formData.subject,
            templateId: formData.templateId,
            author: formData.author,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al actualizar');

        setCampaigns((prev) =>
          prev.map((c) => (c.id === editingCampaign.id ? { ...c, ...data.campaign } : c))
        );
        showToast('success', '¡Plantilla actualizada con éxito!');
      } else {
        // Create
        const res = await fetch('/api/admin/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al crear');

        setCampaigns((prev) => [data.campaign, ...prev]);
        showToast('success', '¡Nueva plantilla creada con éxito!');
      }

      setIsFormModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar la plantilla.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // 4. Delete Campaign
  const handleDeleteCampaign = async (camp: Campaign) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la plantilla "${camp.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/campaigns?id=${camp.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Error al eliminar');
      }

      setCampaigns((prev) => prev.filter((c) => c.id !== camp.id));
      showToast('success', `Plantilla "${camp.name}" eliminada.`);
    } catch (err: any) {
      showToast('error', err.message || 'No se pudo eliminar la plantilla.');
    }
  };

  // 5. Copy Template ID to Clipboard
  const handleCopyId = (templateId: string) => {
    navigator.clipboard.writeText(templateId);
    setCopiedId(templateId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // 6. Send Modal & Dispatch
  const handleOpenSendModal = (camp: Campaign) => {
    setSendingCampaign(camp);
    setSendData((prev) => ({
      ...prev,
      recipientEmail: userProfile?.email || '',
      recipientName: userProfile?.name || '',
    }));
    setSendResult(null);
    setIsSendModalOpen(true);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendingCampaign) return;
    if (!sendData.recipientEmail.trim()) {
      setSendResult({ type: 'error', message: 'Por favor ingresa un correo destinatario.' });
      return;
    }

    try {
      setIsSending(true);
      setSendResult(null);

      // Save custom API key if provided
      if (sendData.customApiKey.trim()) {
        localStorage.setItem('dubros_sendgrid_key', sendData.customApiKey.trim());
      }

      const res = await fetch('/api/admin/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: sendingCampaign.id,
          templateId: sendingCampaign.templateId,
          recipientEmail: sendData.recipientEmail.trim(),
          recipientName: sendData.recipientName.trim(),
          customKey: sendData.customApiKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar el correo.');
      }

      setSendResult({ type: 'success', message: data.message });
      // Update local sent_at state
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === sendingCampaign.id ? { ...c, sent_at: new Date().toISOString() } : c
        )
      );
    } catch (err: any) {
      setSendResult({ type: 'error', message: err.message });
    } finally {
      setIsSending(false);
    }
  };

  // 7. Sync with SendGrid Live API
  const handleFetchSendGridTemplates = async () => {
    if (!syncApiKey.trim()) {
      setSyncError('Ingresa tu clave de API de SendGrid.');
      return;
    }

    try {
      setSyncLoading(true);
      setSyncError('');
      setSyncSuccess('');
      localStorage.setItem('dubros_sendgrid_key', syncApiKey.trim());

      const res = await fetch(`/api/admin/campaigns/sync?apiKey=${encodeURIComponent(syncApiKey.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al consultar SendGrid.');
      }

      setSyncTemplates(data.templates || []);
      if (!data.templates || data.templates.length === 0) {
        setSyncError('No se encontraron plantillas dinámicas en esta cuenta de SendGrid.');
      }
    } catch (err: any) {
      setSyncError(err.message || 'Error al sincronizar con SendGrid.');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleImportTemplate = async (tpl: any) => {
    try {
      const res = await fetch('/api/admin/campaigns/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: tpl.id,
          name: tpl.name,
          subject: tpl.subject,
          author: userProfile?.email || 'dubroswix@gmail.com',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al importar');

      setCampaigns((prev) => [data.campaign, ...prev]);
      setSyncSuccess(`Plantilla "${tpl.name}" importada exitosamente.`);
      showToast('success', `Plantilla "${tpl.name}" importada.`);
    } catch (err: any) {
      setSyncError(err.message || 'Error al importar.');
    }
  };

  // Filtered campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.templateId.toLowerCase().includes(q) ||
      c.author.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* TOAST FEEDBACK */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 9999,
            backgroundColor: toast.type === 'success' ? '#059669' : '#DC2626',
            color: '#FFFFFF',
            padding: '0.85rem 1.4rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
            fontWeight: 600,
            fontSize: '0.95rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {toast.text}
        </div>
      )}

      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.8rem' }}>📧</span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Campañas de Email Marketing
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Plantillas dinámicas de SendGrid configuradas para el envío masivo o personalizado a ópticas y clientes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="btn-secondary"
            style={{
              padding: '0.65rem 1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={16} /> Sincronizar desde SendGrid
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="btn-primary"
            style={{
              padding: '0.65rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 700,
            }}
          >
            <Plus size={18} /> Nueva Plantilla
          </button>
        </div>
      </div>

      {/* SEARCH AND STATS BAR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '280px', maxWidth: '460px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }}
          />
          <input
            type="text"
            placeholder="Buscar por marca, asunto o Template ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.6rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', fontWeight: 500 }}>
          Mostrando <strong style={{ color: 'var(--text-primary)' }}>{filteredCampaigns.length}</strong> de{' '}
          {campaigns.length} plantillas
        </div>
      </div>

      {/* TEMPLATES GRID */}
      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="card"
              style={{
                padding: '1.5rem',
                minHeight: '210px',
                animation: 'pulse 1.5s infinite ease-in-out',
                backgroundColor: 'var(--bg-secondary)',
              }}
            />
          ))}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          <Mail size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No se encontraron plantillas
          </h3>
          <p style={{ maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            {searchQuery
              ? `No hay plantillas que coincidan con "${searchQuery}". Intenta con otro término de búsqueda.`
              : 'Aún no tienes plantillas registradas. Puedes agregar una con "+ Nueva Plantilla".'}
          </p>
          <button onClick={handleOpenCreateModal} className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
            <Plus size={16} /> Crear Plantilla
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredCampaigns.map((camp) => (
            <div
              key={camp.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                position: 'relative',
              }}
            >
              <div>
                {/* Header Tag and Date */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--blue)',
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                    }}
                  >
                    SendGrid Template
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {camp.date || 'Reciente'}
                  </span>
                </div>

                {/* Title / Brand Name */}
                <h3
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    marginBottom: '0.35rem',
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {camp.name}
                </h3>

                {/* Subject Description */}
                {camp.subject && camp.subject.toUpperCase() !== camp.name && (
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.75rem',
                      lineHeight: '1.4',
                    }}
                  >
                    {camp.subject}
                  </p>
                )}

                {/* Template ID Chip with Copy Action */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-light)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontFamily: 'monospace',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <strong style={{ color: 'var(--text-tertiary)' }}>ID:</strong> {camp.templateId}
                  </span>
                  <button
                    onClick={() => handleCopyId(camp.templateId)}
                    title="Copiar ID de SendGrid"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: copiedId === camp.templateId ? '#059669' : 'var(--text-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px',
                    }}
                  >
                    {copiedId === camp.templateId ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-light)',
                  marginTop: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    maxWidth: '130px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={camp.author}
                >
                  Por: {camp.author}
                </span>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <button
                    onClick={() => handleOpenEditModal(camp)}
                    aria-label="Editar"
                    title="Editar plantilla"
                    className="btn-secondary"
                    style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                  >
                    <Edit2 size={13} />
                  </button>

                  <button
                    onClick={() => handleDeleteCampaign(camp)}
                    aria-label="Eliminar"
                    title="Eliminar plantilla"
                    className="btn-secondary"
                    style={{
                      padding: '0.4rem 0.65rem',
                      fontSize: '0.8rem',
                      color: '#DC2626',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>

                  <button
                    onClick={() => handleOpenSendModal(camp)}
                    aria-label="Enviar"
                    className="btn-primary"
                    style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontWeight: 700,
                    }}
                  >
                    <Send size={12} /> Enviar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: NUEVA / EDITAR PLANTILLA                       */}
      {/* ======================================================== */}
      {isFormModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setIsFormModalOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: 'var(--bg-primary)',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsFormModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              {editingCampaign ? 'Editar Plantilla de SendGrid' : 'Nueva Plantilla de SendGrid'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Ingresa el identificador de la plantilla dinámica creada en tu panel de SendGrid.
            </p>

            {formError && (
              <div
                style={{
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  color: '#DC2626',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveCampaign}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: '0.4rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  Nombre / Marca de la Plantilla *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: LCT, MAR-GEL, MATSUDA, NUEVA COLECCIÓN"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: '0.4rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  Asunto del Correo (Subject)
                </label>
                <input
                  type="text"
                  placeholder="Ej: ¡Descubre las nuevas monturas para tu óptica!"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: '0.4rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  Template ID de SendGrid *
                </label>
                <input
                  type="text"
                  required
                  placeholder="d-xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={formData.templateId}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                  }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.3rem', display: 'block' }}>
                  Lo encuentras en SendGrid: <strong>Email API &gt; Dynamic Templates</strong>.
                </span>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: '0.4rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  Remitente / Autor
                </label>
                <input
                  type="email"
                  placeholder="dubroswix@gmail.com"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn-primary"
                  style={{
                    padding: '0.65rem 1.4rem',
                    fontWeight: 700,
                    opacity: formSubmitting ? 0.7 : 1,
                  }}
                >
                  {formSubmitting ? 'Guardando...' : editingCampaign ? 'Actualizar Plantilla' : 'Guardar Plantilla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ENVIAR CAMPAÑA CON SENDGRID                    */}
      {/* ======================================================== */}
      {isSendModalOpen && sendingCampaign && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setIsSendModalOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: 'var(--bg-primary)',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsSendModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <Send size={22} color="var(--blue)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Enviar Plantilla de Correo
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Envía una prueba o despacho inmediato a un cliente u óptica usando la plantilla de SendGrid.
            </p>

            {/* Template Summary Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                Plantilla Seleccionada
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {sendingCampaign.name}
              </div>
              <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--blue)' }}>
                {sendingCampaign.templateId}
              </div>
            </div>

            {/* Feedback Alert */}
            {sendResult && (
              <div
                style={{
                  backgroundColor: sendResult.type === 'success' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                  color: sendResult.type === 'success' ? '#059669' : '#DC2626',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                {sendResult.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <div>{sendResult.message}</div>
              </div>
            )}

            <form onSubmit={handleSendEmail}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: '0.4rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  Correo Electrónico Destinatario *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@optica.com"
                  value={sendData.recipientEmail}
                  onChange={(e) => setSendData({ ...sendData, recipientEmail: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: '0.4rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  Nombre del Destinatario (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Óptica Santa Lucía / Dr. Carlos"
                  value={sendData.recipientName}
                  onChange={(e) => setSendData({ ...sendData, recipientName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              {/* SendGrid API Key Field (if not in env or to override) */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: '0.4rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Key size={14} /> SendGrid API Key (Opcional si ya está en .env)
                </label>
                <input
                  type="password"
                  placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={sendData.customApiKey}
                  onChange={(e) => setSendData({ ...sendData, customApiKey: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                  }}
                />
                <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', display: 'block' }}>
                  Si ingresas una clave aquí, se guardará en tu navegador para futuros envíos.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsSendModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="btn-primary"
                  style={{
                    padding: '0.65rem 1.4rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: isSending ? 0.7 : 1,
                  }}
                >
                  {isSending ? (
                    <>Enviando email...</>
                  ) : (
                    <>
                      <Send size={15} /> Enviar Ahora
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: SINCRONIZAR DESDE SENDGRID                     */}
      {/* ======================================================== */}
      {isSyncModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setIsSyncModalOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-primary)',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsSyncModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <RefreshCw size={22} color="var(--blue)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Sincronizar Plantillas de SendGrid
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Conéctate a tu cuenta de SendGrid para importar con 1 clic todas tus plantillas dinámicas creadas.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  marginBottom: '0.4rem',
                  color: 'var(--text-primary)',
                }}
              >
                SendGrid API Key *
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="password"
                  placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={syncApiKey}
                  onChange={(e) => setSyncApiKey(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                  }}
                />
                <button
                  type="button"
                  onClick={handleFetchSendGridTemplates}
                  disabled={syncLoading}
                  className="btn-primary"
                  style={{
                    padding: '0.65rem 1.15rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    opacity: syncLoading ? 0.7 : 1,
                  }}
                >
                  {syncLoading ? 'Buscando...' : 'Consultar'}
                </button>
              </div>
            </div>

            {syncError && (
              <div
                style={{
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  color: '#DC2626',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} />
                {syncError}
              </div>
            )}

            {syncSuccess && (
              <div
                style={{
                  backgroundColor: 'rgba(5, 150, 105, 0.1)',
                  color: '#059669',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle2 size={16} />
                {syncSuccess}
              </div>
            )}

            {/* List of Found SendGrid Templates */}
            {syncTemplates.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  Plantillas Encontradas ({syncTemplates.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {syncTemplates.map((t) => {
                    const alreadyImported = campaigns.some((c) => c.templateId === t.id);
                    return (
                      <div
                        key={t.id}
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.85rem 1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.75rem',
                        }}
                      >
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {t.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                            ID: {t.id}
                          </div>
                        </div>

                        {alreadyImported ? (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: '#059669',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <Check size={14} /> Importada
                          </span>
                        ) : (
                          <button
                            onClick={() => handleImportTemplate(t)}
                            className="btn-primary"
                            style={{
                              padding: '0.35rem 0.85rem',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <Plus size={14} /> Importar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
