'use client';

import React, { useState } from 'react';
import { LATAM_COUNTRIES } from '@/data/mock';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    empresa: '',
    pais: 'Panamá',
    whatsappCodigo: '+507',
    whatsappNumero: '',
    mensaje: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.nombre,
          lastName: formData.apellido,
          email: formData.email,
          company: formData.empresa,
          country: formData.pais,
          whatsapp: `${formData.whatsappCodigo} ${formData.whatsappNumero}`,
          message: formData.mensaje,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al enviar el mensaje.');
      } else {
        setSubmitted(true);
        // Reset form
        setFormData({
          nombre: '', apellido: '', email: '', empresa: '',
          pais: 'Panamá', whatsappCodigo: '+507', whatsappNumero: '', mensaje: '',
        });
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container contact-main-container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
      
      {/* Header */}
      <div className="contact-header" style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem auto' }}>
        <span className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>Atención Comercial</span>
        <h1 className="contact-title" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Contáctanos Directamente
        </h1>
        <p className="contact-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.5 }}>
          Completa el siguiente formulario con la información de tu óptica o empresa distribuidora y nos pondremos en contacto contigo a la brevedad.
        </p>
      </div>

      <div className="contact-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3rem' }}>
        
        {/* CONTACT INFO PANEL */}
        <div>
          <div
            className="card contact-card-pad"
            style={{
              backgroundColor: 'var(--navy)',
              color: '#FFFFFF',
              padding: '2.5rem',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                Información de Contacto
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                Nuestro equipo comercial en Zona Libre de Colón atiende pedidos e inquietudes para todo el continente americano.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={20} color="#93C5FD" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.2rem' }}>
                      Dirección Principal
                    </h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      Zona Libre de Interplaza Piso 4- Local 514, Colón, Panamá
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Phone size={20} color="#93C5FD" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.2rem' }}>
                      Teléfono Fijo
                    </h3>
                    <a
                      href="tel:+5074414731"
                      style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.9rem', textDecoration: 'none' }}
                    >
                      +507 4414731
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={20} color="#93C5FD" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.2rem' }}>
                      Correo Electrónico
                    </h3>
                    <a
                      href="mailto:ventas@dubros.com"
                      style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.9rem', textDecoration: 'none' }}
                    >
                      ventas@dubros.com
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(37, 211, 102, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MessageSquare size={20} color="#25D366" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.2rem' }}>
                      WhatsApp Comercial
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <a
                        href="https://wa.me/50762926554"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#25D366', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}
                      >
                        (+507) 6292-6554
                      </a>
                      <a
                        href="https://wa.me/50762912194"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#25D366', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}
                      >
                        (+507) 6291-2194
                      </a>
                    </div>
                  </div>
                </div>

                {/* Social Networks */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <a
                    href="https://www.tiktok.com/@dubrosinternational?_r=1&_d=secCgYIASAHKAESPgo86X8"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: '#FFF',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    TikTok
                  </a>
                  <a
                    href="https://www.instagram.com/dubrosinternational?igsh=MWF5ZXhhNDQzbmY0ag=="
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: '#FFF',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    Instagram
                  </a>
                  <a
                    href="https://www.facebook.com/dubros/?locale=es_LA"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: '#FFF',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    Facebook
                  </a>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.15)', marginTop: '2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>Horario de atención: 8:00 AM - 5:00 PM (EST) · Zona Libre de Colón</span>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="card contact-card-pad" style={{ padding: '2.5rem' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <CheckCircle2 size={54} color="var(--green)" style={{ marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>¡Mensaje Enviado con Éxito!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Gracias por contactar a Dubros. Tu mensaje ha sido asignado a la sección de contactos de nuestro dashboard y un asesor comercial se comunicará contigo muy pronto.
              </p>
              <button onClick={() => setSubmitted(false)} className="btn-secondary">
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--input-border)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                    Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tu apellido"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--input-border)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@optica.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>

              <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                    Compañía / Óptica *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre de tu empresa"
                    value={formData.empresa}
                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--input-border)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                    País de compañía *
                  </label>
                  <select
                    value={formData.pais}
                    onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--input-border)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  >
                    {LATAM_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                  WhatsApp / Celular *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={formData.whatsappCodigo}
                    onChange={(e) => setFormData({ ...formData, whatsappCodigo: e.target.value })}
                    style={{
                      width: '90px',
                      padding: '0.7rem 0.6rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--input-border)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="6000-0000"
                    value={formData.whatsappNumero}
                    onChange={(e) => setFormData({ ...formData, whatsappNumero: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '0.7rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--input-border)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                  Mensaje *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Escribe tu consulta sobre productos o solicitudes de distribución..."
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{
                  marginTop: '0.5rem',
                  width: '100%',
                  padding: '0.85rem',
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                <Send size={18} /> {loading ? 'Enviando...' : 'Enviar Mensaje a Dubros'}
              </button>

              {error && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}>
                  {error}
                </div>
              )}
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
