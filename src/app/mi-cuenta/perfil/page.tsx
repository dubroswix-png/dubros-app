'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LATAM_COUNTRIES } from '@/data/mock';
import { supabase } from '@/lib/supabase';
import {
  User,
  Building2,
  MapPin,
  Phone,
  FileText,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
  Mail,
  Globe,
  Briefcase,
  Sparkles,
  Loader2,
} from 'lucide-react';

export function getTaxIdLabel(countryName?: string): string {
  if (!countryName) return 'ID Fiscal / Tax ID';
  const c = countryName.toLowerCase();
  if (c.includes('panam')) return 'RUC (Registro Único de Contribuyente)';
  if (c.includes('colombia')) return 'NIT (Número de Identificación Tributaria)';
  if (c.includes('venezuela')) return 'RIF (Registro de Información Fiscal)';
  if (c.includes('méxico') || c.includes('mexico')) return 'RFC (Registro Federal de Contribuyentes)';
  if (c.includes('argentina')) return 'CUIT (Clave Única de Identificación Tributaria)';
  if (c.includes('chile') || c.includes('uruguay')) return 'RUT (Rol Único Tributario)';
  if (
    c.includes('perú') ||
    c.includes('peru') ||
    c.includes('ecuador') ||
    c.includes('paraguay') ||
    c.includes('nicaragua')
  ) {
    return 'RUC (Registro Único de Contribuyente)';
  }
  if (
    c.includes('bolivia') ||
    c.includes('guatemala') ||
    c.includes('el salvador')
  ) {
    return 'NIT (Número de Identificación Tributaria)';
  }
  if (c.includes('costa rica')) return 'Cédula Jurídica / NITE';
  if (c.includes('honduras')) return 'RTN (Registro Tributario Nacional)';
  if (c.includes('dominicana')) return 'RNC (Registro Nacional de Contribuyente)';
  if (c.includes('españa') || c.includes('espana')) return 'CIF / NIF';
  if (c.includes('estados unidos') || c.includes('united states') || c.includes('usa')) {
    return 'EIN / Tax ID';
  }
  if (c.includes('brasil') || c.includes('brazil')) return 'CNPJ / CPF';
  return `Identificación Fiscal (${countryName})`;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn, isLoading, userProfile, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('Panamá');
  const [businessType, setBusinessType] = useState('Óptica Independiente');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [loadingPass, setLoadingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push('/login');
        return;
      }
      if (userProfile) {
        setName(userProfile.name || '');
        setCompanyName(userProfile.companyName || '');
        setCountry(userProfile.country || 'Panamá');
        setBusinessType(userProfile.businessType || 'Óptica Independiente');
        setPhone(userProfile.phone || '');
        setTaxId(userProfile.taxId || '');
        setAddress(userProfile.address || '');
      }
    }
  }, [isLoggedIn, isLoading, userProfile, router]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: '0.75rem' }}>
        <Loader2 size={32} color="var(--blue)" className="animate-spin" />
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Cargando perfil...</span>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    if (!name.trim() || !companyName.trim() || !taxId.trim() || !phone.trim()) {
      setProfileError('Por favor completa todos los campos obligatorios marcados con asterisco rojo (*).');
      setLoadingProfile(false);
      return;
    }

    const res = await updateProfile({
      name,
      companyName,
      country,
      businessType,
      phone,
      taxId,
      address,
    });

    setLoadingProfile(false);

    if (res.success) {
      setProfileSuccess('¡Tus datos comerciales se han actualizado con éxito en Supabase!');
      setTimeout(() => setProfileSuccess(null), 5000);
    } else {
      setProfileError(res.error || 'No se pudo guardar la información en este momento.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPassError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Las contraseñas no coinciden.');
      return;
    }

    setLoadingPass(true);
    setPassSuccess(null);
    setPassError(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoadingPass(false);

    if (error) {
      setPassError(error.message);
    } else {
      setPassSuccess('¡Tu contraseña ha sido cambiada de forma segura!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(null), 5000);
    }
  };

  const currentTaxLabel = getTaxIdLabel(country);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* HEADER */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--blue)',
              padding: '0.4rem 0.9rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
            }}
          >
            <ShieldCheck size={16} /> PERFIL DE CLIENTE B2B
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            👤 Configuración de tu Empresa
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Actualiza tu identificación fiscal (RUC, NIT, RFC, CUIT...), dirección de despacho y credenciales de acceso.
          </p>
        </div>

        {(!userProfile?.companyName || !userProfile?.taxId) && (
          <div
            style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
            }}
          >
            <Sparkles size={24} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E40AF', margin: '0 0 0.25rem 0' }}>
                ¡Bienvenido a Dubros International B2B!
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#1E3A8A', margin: 0, lineHeight: '1.5' }}>
                Completa los datos de tu óptica o empresa (Nombre Comercial, RUC / Identificación Fiscal y WhatsApp) para activar tus condiciones mayoristas y agilizar la preparación de tus pedidos.
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* CARD 1: DATOS COMERCIALES Y EMPRESA */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2
              style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
                paddingBottom: '0.8rem',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Building2 size={20} color="var(--blue)" /> Datos Comerciales y Fiscales
            </h2>

            {profileSuccess && (
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--green)',
                  color: 'var(--green)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                }}
              >
                <CheckCircle2 size={18} />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #EF4444',
                  color: '#EF4444',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                }}
              >
                <AlertCircle size={18} />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={14} color="var(--blue)" /> Nombre del Contacto Principal <span style={{ color: '#EF4444', fontWeight: 700 }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Lic. Carlos Gómez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building2 size={14} color="var(--blue)" /> Nombre Comercial de la Óptica / Distribución <span style={{ color: '#EF4444', fontWeight: 700 }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Óptica Visión Real C.A."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Globe size={14} color="var(--blue)" /> País de Operación <span style={{ color: '#EF4444', fontWeight: 700 }}>*</span>
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  {LATAM_COUNTRIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.flag} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FileText size={14} color="var(--blue)" /> {currentTaxLabel} <span style={{ color: '#EF4444', fontWeight: 700 }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={`Ej: 123456789-0 o número de ${currentTaxLabel.split(' ')[0]}`}
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Briefcase size={14} color="var(--blue)" /> Tipo de Negocio Óptico <span style={{ color: '#EF4444', fontWeight: 700 }}>*</span>
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  <option value="Óptica Independiente">Óptica Independiente</option>
                  <option value="Cadena de Ópticas">Cadena de Ópticas</option>
                  <option value="Laboratorio Óptico">Laboratorio Óptico</option>
                  <option value="Importador / Distribuidor">Importador / Distribuidor</option>
                  <option value="Clínica Oftalmológica">Clínica Oftalmológica</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={14} color="var(--blue)" /> Teléfono / WhatsApp de Compras <span style={{ color: '#EF4444', fontWeight: 700 }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: +507 6000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} color="var(--blue)" /> Dirección Principal de Envío / Oficina <span style={{ color: '#94A3B8', fontWeight: 400, fontSize: '0.75rem' }}>(Opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Zona Libre Colón, Manzana 5, Panamá o Dirección en tu país de destino"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={loadingProfile}
                  className="btn-primary"
                  style={{
                    padding: '0.85rem 1.8rem',
                    fontSize: '0.95rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: loadingProfile ? 0.7 : 1,
                  }}
                >
                  <Save size={18} />
                  {loadingProfile ? 'Guardando Datos...' : 'Guardar Cambios del Perfil'}
                </button>
              </div>
            </form>
          </div>

          {/* CARD 2: SEGURIDAD Y CONTRASEÑA */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2
              style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
                paddingBottom: '0.8rem',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Lock size={20} color="var(--blue)" /> Seguridad de la Cuenta
            </h2>

            {passSuccess && (
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--green)',
                  color: 'var(--green)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                }}
              >
                <CheckCircle2 size={18} />
                <span>{passSuccess}</span>
              </div>
            )}

            {passError && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #EF4444',
                  color: '#EF4444',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                }}
              >
                <AlertCircle size={18} />
                <span>{passError}</span>
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={14} color="var(--blue)" /> Correo Electrónico Registrado (Solo Lectura)
              </label>
              <div
                style={{
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{userProfile?.email}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle2 size={14} /> Activo
                </span>
              </div>
            </div>

            <form onSubmit={handleChangePassword} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Lock size={14} color="var(--blue)" /> Nueva Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Lock size={14} color="var(--blue)" /> Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={loadingPass}
                  className="btn-secondary"
                  style={{
                    padding: '0.85rem 1.8rem',
                    fontSize: '0.95rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: loadingPass ? 0.7 : 1,
                  }}
                >
                  <Lock size={16} />
                  {loadingPass ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
