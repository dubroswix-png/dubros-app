'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Mail,
  RefreshCw,
  Plus,
  Eye,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Key,
  Calendar,
  User,
  Sparkles,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { getBlogPosts } from '@/lib/blog';
import type { BlogPost } from '@/data/mock';

interface SendGridCampaign {
  id: string;
  title: string;
  subject: string;
  status: string;
  updated_at: string;
  preview_html?: string;
  image_url?: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // SendGrid Sync State
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncTab, setSyncTab] = useState<'api' | 'paste'>('paste');
  const [sendgridApiKey, setSendgridApiKey] = useState('');
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [campaigns, setCampaigns] = useState<SendGridCampaign[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [previewCampaign, setPreviewCampaign] = useState<SendGridCampaign | null>(null);

  // Paste Campaign State
  const [pastedSubject, setPastedSubject] = useState('');
  const [pastedHtml, setPastedHtml] = useState('');
  const [pastedAuthor, setPastedAuthor] = useState('Boletín Dubros International');
  const [isPublishingPasted, setIsPublishingPasted] = useState(false);

  // Manual Post State
  const [isCreatingManual, setIsCreatingManual] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualSummary, setManualSummary] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [manualImage, setManualImage] = useState('');
  const [manualAuthor, setManualAuthor] = useState('Equipo Editorial Dubros');
  const [submittingManual, setSubmittingManual] = useState(false);

  useEffect(() => {
    loadPosts();
    // Load saved SendGrid API key from localStorage if available
    const savedKey = localStorage.getItem('dubros-sendgrid-api-key');
    if (savedKey) {
      setSendgridApiKey(savedKey);
    }
  }, []);

  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      const data = await getBlogPosts();
      setPosts(data);
    } catch (err) {
      console.error('Error cargando posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFetchSendGridCampaigns = async () => {
    setLoadingCampaigns(true);
    setSyncError(null);

    try {
      const headers: Record<string, string> = {};
      if (sendgridApiKey.trim()) {
        headers['x-sendgrid-key'] = sendgridApiKey.trim();
        localStorage.setItem('dubros-sendgrid-api-key', sendgridApiKey.trim());
      }

      const res = await fetch('/api/admin/blog/sendgrid-sync', {
        headers,
      });

      const data = await res.json();

      if (!res.ok) {
        setSyncError(data.error || 'Error al conectar con SendGrid.');
      } else {
        setCampaigns(data.campaigns || []);
        if ((data.campaigns || []).length === 0) {
          setSyncError('No se encontraron campañas recientes en esta cuenta de SendGrid.');
        }
      }
    } catch (err: any) {
      setSyncError('Error de conexión con el servidor.');
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleImportCampaign = async (campaign: SendGridCampaign) => {
    setImportingId(campaign.id);
    try {
      const res = await fetch('/api/admin/blog/sendgrid-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: campaign.title,
          subject: campaign.subject,
          htmlContent: campaign.preview_html,
          imageUrl: campaign.image_url,
          author: 'Boletín Dubros International',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showNotification('success', `¡Campaña "${campaign.subject || campaign.title}" importada y publicada en el Blog con éxito!`);
        setIsSyncModalOpen(false);
        loadPosts();
      } else {
        showNotification('error', data.error || 'No se pudo importar la campaña.');
      }
    } catch (err) {
      showNotification('error', 'Error de red al importar campaña.');
    } finally {
      setImportingId(null);
    }
  };

  const handlePublishPastedCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedSubject.trim() || !pastedHtml.trim()) {
      showNotification('error', 'El asunto y el código HTML del correo son obligatorios.');
      return;
    }

    setIsPublishingPasted(true);
    try {
      const res = await fetch('/api/admin/blog/sendgrid-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pastedSubject,
          subject: pastedSubject,
          htmlContent: pastedHtml,
          author: pastedAuthor,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showNotification('success', '¡Campaña de SendGrid importada y publicada en el Blog con éxito!');
        setIsSyncModalOpen(false);
        setPastedSubject('');
        setPastedHtml('');
        loadPosts();
      } else {
        showNotification('error', data.error || 'No se pudo publicar la campaña.');
      }
    } catch (err) {
      showNotification('error', 'Error de conexión al publicar la campaña.');
    } finally {
      setIsPublishingPasted(false);
    }
  };

  const handleCreateManualPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualContent.trim()) {
      showNotification('error', 'El título y el contenido son obligatorios.');
      return;
    }

    setSubmittingManual(true);
    try {
      const res = await fetch('/api/admin/blog/sendgrid-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: manualTitle,
          subject: manualTitle,
          htmlContent: manualContent,
          imageUrl: manualImage,
          author: manualAuthor,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showNotification('success', '¡Artículo publicado con éxito en el Blog!');
        setIsCreatingManual(false);
        setManualTitle('');
        setManualSummary('');
        setManualContent('');
        setManualImage('');
        loadPosts();
      } else {
        showNotification('error', data.error || 'Error al guardar el artículo.');
      }
    } catch (err) {
      showNotification('error', 'Error de red al publicar el artículo.');
    } finally {
      setSubmittingManual(false);
    }
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>📰 Gestión del Blog y Campañas Email</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Publica artículos, tutoriales para ópticas e importa tus campañas de Email Marketing de SendGrid directamente a tu blog.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="btn-primary"
            style={{
              padding: '0.55rem 1.25rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#0284C7',
              fontWeight: 700,
            }}
          >
            <Mail size={16} /> 📥 Sincronizar con SendGrid
          </button>

          <button
            onClick={() => setIsCreatingManual(true)}
            className="btn-primary"
            style={{
              padding: '0.55rem 1.25rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#004A99',
              fontWeight: 700,
            }}
          >
            <Plus size={16} /> + Nuevo Artículo
          </button>

          <button
            onClick={loadPosts}
            className="btn-secondary"
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={15} className={loadingPosts ? 'spin' : ''} /> Actualizar
          </button>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: notification.type === 'success' ? '#DEF7EC' : '#FEE2E2',
            color: notification.type === 'success' ? '#03543F' : '#9B1C1C',
            border: `1px solid ${notification.type === 'success' ? '#84E1BC' : '#F87171'}`,
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* MODAL 1: SENDGRID CAMPAIGN SYNC */}
      {isSyncModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={22} color="#0284C7" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Importar Campañas de SendGrid</h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Conéctate a tu cuenta de SendGrid para transformar tus emails en artículos de Blog con 1 clic.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsSyncModalOpen(false);
                  setPreviewCampaign(null);
                }}
                className="btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                ✕ Cerrar
              </button>
            </div>

            {/* MODAL TABS SWITCHER */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setSyncTab('paste')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: syncTab === 'paste' ? '#0284C7' : 'transparent',
                  color: syncTab === 'paste' ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                📋 Pegar HTML de Campaña (Más Rápido)
              </button>

              <button
                type="button"
                onClick={() => setSyncTab('api')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: syncTab === 'api' ? '#0284C7' : 'transparent',
                  color: syncTab === 'api' ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                🔑 Conectar por API Key de SendGrid
              </button>
            </div>

            {syncTab === 'paste' ? (
              /* TAB 1: PASTE HTML DIRECTLY */
              <form onSubmit={handlePublishPastedCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: 'var(--radius-md)', color: '#0369A1', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  <strong>💡 ¿Cómo obtener el HTML de SendGrid?</strong>
                  <p style={{ margin: '0.25rem 0 0 0' }}>
                    En tu cuenta de SendGrid, ve a tu campaña o plantilla, haz clic en <em>"Code View"</em> o <em>"Export HTML"</em>, copia el código y pégalo abajo. El sistema extraerá automáticamente el título, las imágenes y el diseño.
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Asunto del Correo / Título de la Campaña *
                  </label>
                  <input
                    type="text"
                    required
                    value={pastedSubject}
                    onChange={(e) => setPastedSubject(e.target.value)}
                    placeholder="Ej. Descubre la Nueva Colección de Monturas Oftálmicas 2026"
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '0.9rem', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Código HTML del Correo de SendGrid *
                  </label>
                  <textarea
                    required
                    rows={8}
                    value={pastedHtml}
                    onChange={(e) => setPastedHtml(e.target.value)}
                    placeholder="Pega aquí el código HTML de tu correo enviado en SendGrid (ej: <table... o <div>...)..."
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '0.85rem', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontFamily: 'monospace' }}
                  />
                </div>

                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={isPublishingPasted}
                    className="btn-primary"
                    style={{
                      backgroundColor: '#0284C7',
                      padding: '0.75rem 2rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                    }}
                  >
                    {isPublishingPasted ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {isPublishingPasted ? 'Publicando en Blog...' : 'Publicar Campaña en Blog'}
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: CONNECT VIA API KEY */
              <div>
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    🔑 SendGrid API Key (Opcional si ya está en Vercel / Servidor):
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <input
                      type="password"
                      value={sendgridApiKey}
                      onChange={(e) => setSendgridApiKey(e.target.value)}
                      placeholder="Dejar vacío para usar SENDGRID_API_KEY secreta del servidor..."
                      style={{
                        flex: 1,
                        minWidth: '280px',
                        padding: '0.65rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-medium)',
                        fontSize: '0.9rem',
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleFetchSendGridCampaigns}
                      disabled={loadingCampaigns}
                      className="btn-primary"
                      style={{
                        backgroundColor: '#0284C7',
                        padding: '0.65rem 1.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                      }}
                    >
                      {loadingCampaigns ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                      {loadingCampaigns ? 'Buscando...' : 'Obtener Campañas'}
                    </button>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0 0' }}>
                    Si tu clave ya está guardada en las variables de entorno de Vercel como <strong>SENDGRID_API_KEY</strong>, solo haz clic en <strong>"Obtener Campañas"</strong> sin escribir nada.
                  </p>
                </div>

                {syncError && (
                  <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#FEE2E2', color: '#9B1C1C', fontSize: '0.85rem', fontWeight: 600 }}>
                    {syncError}
                  </div>
                )}

                {/* Preview Modal overlay */}
                {previewCampaign && (
                  <div style={{ marginBottom: '1.5rem', padding: '1.5rem', border: '2px solid #0284C7', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Vista Previa: {previewCampaign.subject}</h3>
                      <button onClick={() => setPreviewCampaign(null)} className="btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                        Cerrar Vista Previa
                      </button>
                    </div>
                    <div
                      style={{
                        maxHeight: '350px',
                        overflowY: 'auto',
                        backgroundColor: '#FFFFFF',
                        color: '#000000',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #E2E8F0',
                      }}
                      dangerouslySetInnerHTML={{ __html: previewCampaign.preview_html || '<p>Sin contenido HTML disponible</p>' }}
                    />
                  </div>
                )}

                {/* List of SendGrid Campaigns */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                    Campañas Disponibles ({campaigns.length})
                  </h3>

                  {campaigns.length === 0 && !loadingCampaigns ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)', border: '1px dashed var(--border-medium)', borderRadius: 'var(--radius-md)' }}>
                      <Mail size={36} color="var(--text-tertiary)" style={{ margin: '0 auto 0.75rem auto' }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>Ingresa tu API Key de SendGrid y haz clic en "Obtener Campañas".</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {campaigns.map((camp) => (
                        <div
                          key={camp.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem 1.25rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-light)',
                            backgroundColor: 'var(--bg-card)',
                            flexWrap: 'wrap',
                            gap: '1rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '260px' }}>
                            {camp.image_url ? (
                              <img
                                src={camp.image_url}
                                alt={camp.subject}
                                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                              />
                            ) : (
                              <div style={{ width: '60px', height: '60px', borderRadius: '6px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                                <FileText size={24} />
                              </div>
                            )}

                            <div>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                                {camp.subject || camp.title}
                              </h4>
                              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <span>📅 {new Date(camp.updated_at).toLocaleDateString('es-ES')}</span>
                                <span style={{ textTransform: 'capitalize', color: camp.status === 'sent' ? '#059669' : '#D97706', fontWeight: 600 }}>
                                  ● {camp.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {camp.preview_html && (
                              <button
                                type="button"
                                onClick={() => setPreviewCampaign(camp)}
                                className="btn-secondary"
                                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                              >
                                <Eye size={14} /> Ver
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleImportCampaign(camp)}
                              disabled={importingId === camp.id}
                              className="btn-primary"
                              style={{
                                backgroundColor: '#0284C7',
                                padding: '0.45rem 1rem',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              {importingId === camp.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                              {importingId === camp.id ? 'Publicando...' : 'Publicar en Blog'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: MANUAL ARTICLE CREATION */}
      {isCreatingManual && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Crear Nuevo Artículo Manual</h2>
              <button onClick={() => setIsCreatingManual(false)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                ✕ Cerrar
              </button>
            </div>

            <form onSubmit={handleCreateManualPost} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Título del Artículo *
                </label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Ej. Nuevas Tendencias en Monturas Ópticas 2026"
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '0.9rem', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  URL de Imagen de Portada (Opcional)
                </label>
                <input
                  type="url"
                  value={manualImage}
                  onChange={(e) => setManualImage(e.target.value)}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '0.9rem', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Autor
                </label>
                <input
                  type="text"
                  value={manualAuthor}
                  onChange={(e) => setManualAuthor(e.target.value)}
                  placeholder="Equipo Editorial Dubros"
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '0.9rem', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Contenido del Artículo (Texto o HTML) *
                </label>
                <textarea
                  required
                  rows={8}
                  value={manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  placeholder="Escribe el contenido de tu artículo o pega el código HTML de tu plantilla..."
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '0.9rem', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="btn-primary"
                  style={{
                    backgroundColor: '#004A99',
                    padding: '0.75rem 2rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                  }}
                >
                  {submittingManual ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {submittingManual ? 'Publicando...' : 'Publicar Artículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POSTS LISTING TABLE */}
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          Artículos Publicados en el Blog ({posts.length})
        </h2>

        {loadingPosts ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <Loader2 size={30} color="var(--blue)" className="animate-spin" style={{ margin: '0 auto 0.75rem auto' }} />
            <span>Cargando artículos del blog...</span>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <FileText size={40} color="var(--text-tertiary)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No hay artículos publicados todavía</h3>
            <p style={{ fontSize: '0.9rem' }}>Sincroniza tus campañas de SendGrid o crea tu primer post manual.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {posts.map((post) => (
              <div
                key={post.id}
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ height: '160px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={post.featuredImageUrl || '/images/blog-placeholder.jpg'}
                    alt={post.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(0, 74, 153, 0.9)',
                      color: '#FFFFFF',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                    }}
                  >
                    Publicado
                  </span>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>
                    {post.title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0', flex: 1, lineHeight: 1.5 }}>
                    {post.shortDescription?.slice(0, 120)}...
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>📅 {new Date(post.publishedAt).toLocaleDateString('es-ES')}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      style={{
                        color: 'var(--blue)',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        textDecoration: 'none',
                      }}
                    >
                      Ver post <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
