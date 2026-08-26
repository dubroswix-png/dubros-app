'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  LogIn,
  User,
  Building2,
  Phone,
  Globe2,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Package,
  Truck,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const LATAM_COUNTRIES = [
  { code: 'PA', name: 'Panamá (+507)' },
  { code: 'CR', name: 'Costa Rica (+506)' },
  { code: 'CO', name: 'Colombia (+57)' },
  { code: 'GT', name: 'Guatemala (+502)' },
  { code: 'DO', name: 'República Dominicana (+1)' },
  { code: 'SV', name: 'El Salvador (+503)' },
  { code: 'HN', name: 'Honduras (+504)' },
  { code: 'NI', name: 'Nicaragua (+505)' },
  { code: 'EC', name: 'Ecuador (+593)' },
  { code: 'PE', name: 'Perú (+51)' },
  { code: 'CL', name: 'Chile (+56)' },
  { code: 'BO', name: 'Bolivia (+591)' },
  { code: 'PY', name: 'Paraguay (+595)' },
  { code: 'UY', name: 'Uruguay (+598)' },
  { code: 'MX', name: 'México (+52)' },
  { code: 'OTHER', name: 'Otro país' },
];

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register Fields
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('Óptica');
  const [country, setCountry] = useState('PA');
  const [whatsapp, setWhatsapp] = useState('');

  // Forgot Password Modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const { login, register, loginWithGoogle } = useAuth();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Correo o contraseña incorrectos. Verifica tus credenciales.');
      } else {
        if (email.toLowerCase().includes('admin') || email.toLowerCase() === 'dubroswix@gmail.com') {
          router.push('/dashboard');
        } else {
          router.push('/catalogo');
        }
      }
    } catch (err: any) {
      setError('Ocurrió un error inesperado al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const result = await register(email, password, {
        name: fullName,
        companyName,
        businessType,
        country,
        whatsapp,
      });

      if (!result.success) {
        setError(result.error || 'Error al registrar la cuenta comercial.');
      } else {
        setSuccessMessage('¡Cuenta creada con éxito! Redirigiendo a tu catálogo mayorista...');
        setTimeout(() => {
          router.push('/catalogo');
        }, 1500);
      }
    } catch (err: any) {
      setError('Error al registrar la cuenta comercial.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const result = await loginWithGoogle();
    if (!result.success && result.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotError(null);

    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/mi-cuenta/perfil`,
      });

      if (resetErr) {
        setForgotError(resetErr.message);
      } else {
        setForgotSuccess(true);
      }
    } catch (e: any) {
      setForgotError('No se pudo enviar el correo de recuperación.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      <div
        style={{
          maxWidth: isRegister ? '960px' : '840px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 10px 40px rgba(7, 29, 58, 0.1)',
          border: '1px solid var(--border-light)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* LEFT COLUMN: Form Container */}
        <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <Link href="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
              <img
                src="/images/logo.svg"
                alt="Dubros Logo"
                style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              {isRegister ? 'Registro Comercial B2B' : 'Portal de Clientes'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {isRegister
                ? 'Regístrate como óptica o distribuidor para cotizar y comprar'
                : 'Accede con tu cuenta para desbloquear precios mayoristas'}
            </p>
          </div>

          {/* TABS SWITCHER */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-secondary)',
              padding: '0.3rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.75rem',
              gap: '0.3rem',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
                setSuccessMessage(null);
              }}
              style={{
                flex: 1,
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: !isRegister ? '#FFFFFF' : 'transparent',
                color: !isRegister ? 'var(--blue)' : 'var(--text-secondary)',
                fontWeight: !isRegister ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: !isRegister ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
                setSuccessMessage(null);
              }}
              style={{
                flex: 1,
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: isRegister ? '#FFFFFF' : 'transparent',
                color: isRegister ? 'var(--blue)' : 'var(--text-secondary)',
                fontWeight: isRegister ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: isRegister ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              Crear Cuenta Óptica
            </button>
          </div>

          {/* NOTIFICATIONS */}
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FEE2E2',
                color: '#991B1B',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontWeight: 600 }}>Error:</span> {error}
            </div>
          )}

          {successMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#D1FAE5',
                color: '#065F46',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={16} /> {successMessage}
            </div>
          )}

          {/* GOOGLE QUICK LOGIN */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            style={{
              width: '100%',
              padding: '0.7rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              marginBottom: '1.25rem',
              transition: 'background-color 0.2s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continuar con Google
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '0 0 1.25rem 0',
              color: 'var(--text-tertiary)',
              fontSize: '0.75rem',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
            <span style={{ padding: '0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              o con correo corporativo
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
          </div>

          {/* FORM */}
          {!isRegister ? (
            /* --- LOGIN FORM --- */
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Correo Electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu-optica@ejemplo.com"
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem 0.65rem 2.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Contraseña</label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--blue)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={18}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '0.65rem 2.5rem 0.65rem 2.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      fontSize: '0.9rem',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '1.25rem',
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>
          ) : (
            /* --- REGISTER FORM --- */
            <form onSubmit={handleRegisterSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                    Nombre del Contacto
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej. Roberto Gómez"
                      style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                    Nombre de la Óptica / Empresa
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ej. Óptica Visión Real"
                      style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                    Tipo de Negocio
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '0.85rem', backgroundColor: '#FFF' }}
                  >
                    <option value="Óptica">Óptica Independiente</option>
                    <option value="Cadena de Ópticas">Cadena de Ópticas</option>
                    <option value="Distribuidor">Distribuidor Mayorista</option>
                    <option value="Clínica Oftalmológica">Clínica Oftalmológica</option>
                    <option value="Laboratorio">Laboratorio Óptico</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                    País de Operación
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '0.85rem', backgroundColor: '#FFF' }}
                  >
                    {LATAM_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                    WhatsApp Comercial
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+507 6000-0000"
                      style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                    Correo Electrónico
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@optica.com"
                      style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                  Contraseña de Acceso
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    style={{ width: '100%', padding: '0.55rem 2.2rem 0.55rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {loading ? 'Creando cuenta comercial...' : 'Crear Cuenta y Ver Precios'}
              </button>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: Value Proposition Side Panel */}
        <div
          style={{
            backgroundColor: '#071D3A',
            color: '#FFFFFF',
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(15, 72, 150, 0.6)',
                color: '#93C5FD',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                marginBottom: '1.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <ShieldCheck size={14} /> Distribución B2B Oficial
            </span>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '1.25rem' }}>
              El mayor catálogo óptico de Latinoamérica
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                <Package size={20} color="#60A5FA" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '0.9rem', display: 'block', color: '#FFF' }}>+12,700 Referencias</strong>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    Armazones oftálmicos, solares y clips de las mejores marcas internacionales.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                <Truck size={20} color="#34D399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '0.9rem', display: 'block', color: '#FFF' }}>Zona Libre de Colón</strong>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    Despachos express exentos de aranceles locales hacia todo el continente.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                <Globe2 size={20} color="#FBBF24" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '0.9rem', display: 'block', color: '#FFF' }}>Asesoría y Cotización WhatsApp</strong>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    Atención personalizada con asesores comerciales directos al (+507) 6292-6554.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '2rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>
              Dubros International S.A. · Zona Libre de Interplaza Piso 4- Local 514, Colón, Panamá.
            </span>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {isForgotModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '420px',
              width: '100%',
              padding: '2rem',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Recuperar Contraseña
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Ingresa el correo electrónico asociado a tu cuenta comercial y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            {forgotSuccess ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <CheckCircle2 size={44} color="#10B981" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.3rem' }}>¡Correo enviado!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Revisa tu bandeja de entrada en <strong>{forgotEmail}</strong> y sigue las instrucciones.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setForgotSuccess(false);
                    setForgotEmail('');
                  }}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.65rem' }}
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword}>
                {forgotError && (
                  <div style={{ padding: '0.6rem', backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                    {forgotError}
                  </div>
                )}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="tu-optica@ejemplo.com"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '0.65rem', fontSize: '0.85rem' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.65rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    {forgotLoading ? <Loader2 size={16} className="animate-spin" /> : 'Enviar Enlace'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
