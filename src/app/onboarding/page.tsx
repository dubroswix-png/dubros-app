'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LATAM_COUNTRIES } from '@/data/mock';
import { Building2, Globe, Phone, CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [formData, setFormData] = useState({
    pais: 'Panamá',
    tipoNegocio: 'optica_independiente',
    nombreEmpresa: '',
    whatsappCodigo: '+507',
    whatsappNumero: '',
  });

  const handleCountryChange = (countryName: string) => {
    const countryObj = LATAM_COUNTRIES.find((c) => c.name === countryName);
    setFormData({
      ...formData,
      pais: countryName,
      whatsappCodigo: countryObj ? countryObj.dialCode : '+507',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeOnboarding({
      country: formData.pais,
      businessType: formData.tipoNegocio,
      companyName: formData.nombreEmpresa,
      phone: `${formData.whatsappCodigo} ${formData.whatsappNumero}`,
    });
    router.push('/catalogo');
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '0.8rem',
              borderRadius: '50%',
              backgroundColor: 'var(--blue-light)',
              color: 'var(--blue)',
              marginBottom: '1rem',
            }}
          >
            <Shield size={32} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            ¡Bienvenido a Dubros!
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Para personalizar tu experiencia y mostrarte únicamente las marcas habilitadas en tu país, necesitamos completar tu perfil comercial:
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* PAÍS */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Globe size={16} color="var(--blue)" /> País de Ubicación *
            </label>
            <select
              value={formData.pais}
              onChange={(e) => handleCountryChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--input-border)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontWeight: 600,
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

          {/* TIPO DE NEGOCIO */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building2 size={16} color="var(--blue)" /> Tipo de Negocio Óptico *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <input
                  type="radio"
                  name="tipoNegocio"
                  value="distribuidor_optico"
                  checked={formData.tipoNegocio === 'distribuidor_optico'}
                  onChange={(e) => setFormData({ ...formData, tipoNegocio: e.target.value })}
                />
                Distribuidor Óptico / Mayorista
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <input
                  type="radio"
                  name="tipoNegocio"
                  value="cadena_opticas"
                  checked={formData.tipoNegocio === 'cadena_opticas'}
                  onChange={(e) => setFormData({ ...formData, tipoNegocio: e.target.value })}
                />
                Cadena de Ópticas
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <input
                  type="radio"
                  name="tipoNegocio"
                  value="optica_independiente"
                  checked={formData.tipoNegocio === 'optica_independiente'}
                  onChange={(e) => setFormData({ ...formData, tipoNegocio: e.target.value })}
                />
                Óptica Independiente
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <input
                  type="radio"
                  name="tipoNegocio"
                  value="consultorio_oftalmologico"
                  checked={formData.tipoNegocio === 'consultorio_oftalmologico'}
                  onChange={(e) => setFormData({ ...formData, tipoNegocio: e.target.value })}
                />
                Consultorio Oftalmológico
              </label>
            </div>
          </div>

          {/* NOMBRE DE LA EMPRESA */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
              Nombre Comercial de la Empresa / Óptica *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Óptica Megavisión"
              value={formData.nombreEmpresa}
              onChange={(e) => setFormData({ ...formData, nombreEmpresa: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--input-border)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          {/* WHATSAPP */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={16} color="var(--blue)" /> Número de WhatsApp Comercial *
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={formData.whatsappCodigo}
                onChange={(e) => setFormData({ ...formData, whatsappCodigo: e.target.value })}
                style={{
                  width: '90px',
                  padding: '0.75rem 0.6rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--input-border)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  fontWeight: 700,
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
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--input-border)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '0.9rem', marginTop: '1rem', fontSize: '1rem' }}
          >
            Completar Registro e Ingresar <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
