'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Search, CheckCircle2, Clock, ShieldCheck, UserCheck, AlertCircle, RefreshCw, UserPlus, ArrowLeft, Camera, Loader2, KeyRound, Copy, Check, X } from 'lucide-react';
import { fetchAllProfiles, updateUserRole, UserProfileRecord } from '@/lib/users';
import { UserRole } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { LATAM_COUNTRIES } from '@/data/mock';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'client' | 'admin'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Password Reset / Update Modal State
  const [passwordModalUser, setPasswordModalUser] = useState<UserProfileRecord | null>(null);
  const [directNewPassword, setDirectNewPassword] = useState('');
  const [passwordActionLoading, setPasswordActionLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [passwordModalMsg, setPasswordModalMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New User Form State
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserCompany, setNewUserCompany] = useState('');
  const [newUserCountry, setNewUserCountry] = useState('PA');
  const [newUserWhatsappCode, setNewUserWhatsappCode] = useState('+507');
  const [newUserWhatsapp, setNewUserWhatsapp] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('client');
  const [newUserErpCode, setNewUserErpCode] = useState('');
  const [creatingLoading, setCreatingLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAllProfiles();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreatingLoading(true);

    try {
      const fullWhatsapp = `${newUserWhatsappCode} ${newUserWhatsapp}`.trim();

      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          companyName: newUserCompany || newUserName,
          country: newUserCountry,
          whatsapp: fullWhatsapp,
          role: newUserRole,
          erpClientCode: newUserErpCode || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || 'Error al crear el usuario.');
      } else {
        setNotification({
          type: 'success',
          message: `¡Usuario ${newUserEmail} creado con éxito! Ya puede iniciar sesión.`,
        });
        // Reset form
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserCompany('');
        setNewUserWhatsapp('');
        setNewUserErpCode('');
        setIsCreatingUser(false);
        await loadData();
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (err) {
      setCreateError('Error de red al conectar con el servidor.');
    } finally {
      setCreatingLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole, userEmail: string) => {
    setProcessingId(userId);
    setNotification(null);

    const res = await updateUserRole(userId, newRole);

    setProcessingId(null);

    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setNotification({
        type: 'success',
        message: `Rol de ${userEmail} actualizado a "${newRole === 'client' ? 'Cliente Aprobado' : newRole === 'admin' ? 'Administrador' : 'Pendiente'}".`,
      });

      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification({
        type: 'error',
        message: res.error || 'Error al actualizar el usuario.',
      });
    }
  };

  const handleSendResetLinkToAdmin = async (email: string) => {
    setPasswordActionLoading(true);
    setPasswordModalMsg(null);
    setGeneratedLink(null);
    try {
      const res = await fetch('/api/auth/reset-password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedLink(data.actionLink || null);
        setPasswordModalMsg({
          type: 'success',
          text: `¡Enlace generado exitosamente! Se ha enviado una notificación con el enlace a dubroswix@gmail.com.`,
        });
      } else {
        setPasswordModalMsg({
          type: 'error',
          text: data.error || 'Error al generar el enlace de restablecimiento.',
        });
      }
    } catch {
      setPasswordModalMsg({
        type: 'error',
        text: 'Error de conexión con el servidor.',
      });
    } finally {
      setPasswordActionLoading(false);
    }
  };

  const handleUpdatePasswordDirectly = async (userId: string) => {
    if (!directNewPassword || directNewPassword.length < 6) {
      setPasswordModalMsg({
        type: 'error',
        text: 'La nueva contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    setPasswordActionLoading(true);
    setPasswordModalMsg(null);
    try {
      const res = await fetch('/api/admin/users/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword: directNewPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordModalMsg({
          type: 'success',
          text: `¡Contraseña actualizada con éxito para este usuario!`,
        });
        setDirectNewPassword('');
      } else {
        setPasswordModalMsg({
          type: 'error',
          text: data.error || 'Error al actualizar la contraseña.',
        });
      }
    } catch {
      setPasswordModalMsg({
        type: 'error',
        text: 'Error de red al actualizar la contraseña.',
      });
    } finally {
      setPasswordActionLoading(false);
    }
  };

  const counts = useMemo(() => {
    return {
      all: users.length,
      pending: users.filter((u) => u.role === 'pending').length,
      client: users.filter((u) => u.role === 'client').length,
      admin: users.filter((u) => u.role === 'admin').length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (activeTab !== 'all' && user.role !== activeTab) {
        return false;
      }

      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const nameMatch = user.name?.toLowerCase().includes(query);
        const emailMatch = user.email?.toLowerCase().includes(query);
        const companyMatch = user.company_name?.toLowerCase().includes(query);
        const countryMatch = user.country?.toLowerCase().includes(query);
        const codeMatch =
          (user.erp_client_id !== undefined && user.erp_client_id !== null && user.erp_client_id.toString().includes(query)) ||
          (user.client_code && user.client_code.toLowerCase().includes(query)) ||
          (user.erp_client_code && user.erp_client_code.toLowerCase().includes(query));

        return nameMatch || emailMatch || companyMatch || countryMatch || codeMatch;
      }

      return true;
    });
  }, [users, activeTab, searchTerm]);

  if (isCreatingUser) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Header with Back Arrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => {
              setIsCreatingUser(false);
              setCreateError(null);
            }}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <ArrowLeft size={20} color="#1E293B" />
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>Crea Usuario</h1>
        </div>

        {createError && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: '#FEE2E2',
              color: '#9B1C1C',
              border: '1px solid #F87171',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <AlertCircle size={20} />
            <span>{createError}</span>
          </div>
        )}

        <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
          <form onSubmit={handleCreateUserSubmit}>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {/* Left Column: Avatar Placeholder */}
              <div
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px dashed #CBD5E1',
                  backgroundColor: '#F8FAFC',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  color: '#64748B',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <Camera size={26} color="#94A3B8" />
                <span style={{ color: 'var(--blue)', fontSize: '0.8rem', textAlign: 'center', padding: '0 0.5rem' }}>
                  Agrega una foto
                </span>
              </div>

              {/* Right Column: Form Inputs */}
              <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#475569' }}>
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Nombre"
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#475569' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="Email"
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#475569' }}>
                    Contraseña de Acceso
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#475569' }}>
                    Nombre de la Óptica / Empresa
                  </label>
                  <input
                    type="text"
                    value={newUserCompany}
                    onChange={(e) => setNewUserCompany(e.target.value)}
                    placeholder="Ej. Óptica Visión Real"
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#475569' }}>
                    País
                  </label>
                  <select
                    value={newUserCountry}
                    onChange={(e) => setNewUserCountry(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid #CBD5E1', fontSize: '0.9rem', backgroundColor: '#FFFFFF' }}
                  >
                    {LATAM_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#475569' }}>
                    WhatsApp
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={newUserWhatsappCode}
                      onChange={(e) => setNewUserWhatsappCode(e.target.value)}
                      style={{ width: '80px', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #CBD5E1', fontSize: '0.9rem', textAlign: 'center' }}
                    />
                    <input
                      type="tel"
                      value={newUserWhatsapp}
                      onChange={(e) => setNewUserWhatsapp(e.target.value)}
                      placeholder="Whatsapp 6123456"
                      style={{ flex: 1, padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#475569' }}>
                    Rol
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid #CBD5E1', fontSize: '0.9rem', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="client">Cliente B2B (Aprobado)</option>
                    <option value="pending">Pendiente de Aprobación</option>
                    <option value="admin">Administrador del Sistema</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#475569' }}>
                    Código de Cliente ERP (Opcional)
                  </label>
                  <input
                    type="text"
                    value={newUserErpCode}
                    onChange={(e) => setNewUserErpCode(e.target.value)}
                    placeholder="Ej. CLI-1045"
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
              <button
                type="submit"
                disabled={creatingLoading}
                className="btn-primary"
                style={{
                  backgroundColor: '#004A99',
                  padding: '0.8rem 3rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0, 74, 153, 0.3)',
                }}
              >
                {creatingLoading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                {creatingLoading ? 'Creando Usuario...' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>👥 Aprobación y Gestión de Clientes</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Aprueba solicitudes de registro B2B, asigna roles de cliente y gestiona el personal interno.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => setIsCreatingUser(true)}
            className="btn-primary"
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#004A99',
              fontWeight: 700,
            }}
          >
            <UserPlus size={16} /> + Crear Usuario
          </button>

          <button
            onClick={loadData}
            className="btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> Actualizar Datos
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

      {/* STATS AND TABS BAR */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setActiveTab('all')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.5rem 1rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            borderRadius: 'var(--radius-md)',
            color: activeTab === 'all' ? 'var(--blue)' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'all' ? '#E0E7FF' : 'transparent',
          }}
        >
          Todos ({counts.all})
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.5rem 1rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: activeTab === 'pending' ? '#854D0E' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'pending' ? '#FEF08A' : counts.pending > 0 ? '#FEF9C3' : 'transparent',
          }}
        >
          <Clock size={16} /> Pendientes de Aprobación ({counts.pending})
        </button>

        <button
          onClick={() => setActiveTab('client')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.5rem 1rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            borderRadius: 'var(--radius-md)',
            color: activeTab === 'client' ? '#03543F' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'client' ? '#DEF7EC' : 'transparent',
          }}
        >
          Clientes Aprobados ({counts.client})
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.5rem 1rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            borderRadius: 'var(--radius-md)',
            color: activeTab === 'admin' ? '#991B1B' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'admin' ? '#FEE2E2' : 'transparent',
          }}
        >
          Administradores ({counts.admin})
        </button>
      </div>

      {/* SEARCH AND FILTER INPUT */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Buscar por nombre, correo, empresa o país..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem 0.6rem 2.2rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--input-border)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          </div>
        </div>

        {/* USERS TABLE */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            Cargando usuarios...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No se encontraron usuarios en esta categoría.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Cliente / Empresa</th>
                  <th style={{ padding: '1rem 1rem', fontWeight: 700 }}>Cód. ERP</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Correo</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>País / Teléfono</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Tipo de Negocio</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Estado / Rol</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 700, textAlign: 'right' }}>Acción de Aprobación</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {user.name || 'Sin nombre registrado'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--blue)', fontWeight: 600 }}>
                        {user.company_name || 'Particular / Óptica'}
                      </div>
                    </td>

                    <td style={{ padding: '1.25rem 1rem' }}>
                      {user.erp_client_id != null ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            border: '1px solid #BFDBFE',
                          }}
                        >
                          #{user.erp_client_id}
                        </span>
                      ) : user.client_code ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            backgroundColor: '#F3F4F6',
                            color: '#4B5563',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                          }}
                        >
                          {user.client_code}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>
                      {user.email}
                    </td>

                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{user.country || 'No especificado'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{user.phone || 'Sin teléfono'}</div>
                    </td>

                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {user.business_type || 'Cliente B2B'}
                    </td>

                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span
                        style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor:
                            user.role === 'admin'
                              ? '#FEE2E2'
                              : user.role === 'client'
                              ? '#DEF7EC'
                              : '#FEF08A',
                          color:
                            user.role === 'admin'
                              ? '#DC2626'
                              : user.role === 'client'
                              ? '#03543F'
                              : '#854D0E',
                        }}
                      >
                        {user.role === 'admin' ? '🛡️ Administrador' : user.role === 'client' ? '✅ Cliente Aprobado' : '⏳ Pendiente'}
                      </span>
                    </td>

                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {user.role === 'pending' && (
                          <button
                            disabled={processingId === user.id}
                            onClick={() => handleRoleChange(user.id, 'client', user.email)}
                            className="btn-primary"
                            style={{
                              backgroundColor: '#10B981',
                              padding: '0.4rem 0.85rem',
                              fontSize: '0.8rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}
                          >
                            <UserCheck size={14} /> Aprobar Cliente
                          </button>
                        )}

                        <button
                          disabled={processingId === user.id}
                          onClick={() => {
                            setPasswordModalUser(user);
                            setGeneratedLink(null);
                            setCopiedLink(false);
                            setPasswordModalMsg(null);
                            setDirectNewPassword('');
                          }}
                          className="btn-secondary"
                          style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            color: '#0F172A',
                          }}
                          title="Actualizar contraseña o generar enlace para dubroswix@gmail.com"
                        >
                          <KeyRound size={13} color="var(--blue)" /> Contraseña
                        </button>

                        {user.role === 'client' && (
                          <button
                            disabled={processingId === user.id}
                            onClick={() => handleRoleChange(user.id, 'pending', user.email)}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#854D0E' }}
                          >
                            Suspender
                          </button>
                        )}

                        {user.role === 'admin' && user.email !== 'dubroswix@gmail.com' && (
                          <button
                            disabled={processingId === user.id}
                            onClick={() => handleRoleChange(user.id, 'client', user.email)}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          >
                            Cambiar a Cliente
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PASSWORD RESET / UPDATE MODAL */}
      {passwordModalUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Seguridad de Acceso
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.25rem 0', color: '#0F172A' }}>
                  Actualizar Contraseña
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                  Usuario: <strong style={{ color: '#0F172A' }}>{passwordModalUser.email}</strong>
                </p>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            {passwordModalMsg && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  backgroundColor: passwordModalMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                  color: passwordModalMsg.type === 'success' ? '#065F46' : '#991B1B',
                  border: `1px solid ${passwordModalMsg.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                }}
              >
                {passwordModalMsg.text}
              </div>
            )}

            {/* OPTION 1: SEND RECOVERY LINK TO DUBROSWIX */}
            <div
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1.25rem',
                backgroundColor: '#F8FAFC',
                marginBottom: '1.25rem',
              }}
            >
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: '#0F172A' }}>
                1. Generar Link (Enviar a dubroswix@gmail.com)
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 0.85rem 0', lineHeight: 1.4 }}>
                Crea el enlace de recuperación oficial para <strong>{passwordModalUser.email}</strong> y lo envía directamente a <strong>dubroswix@gmail.com</strong>.
              </p>
              <button
                disabled={passwordActionLoading}
                onClick={() => handleSendResetLinkToAdmin(passwordModalUser.email)}
                className="btn-primary"
                style={{
                  padding: '0.55rem 1rem',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                {passwordActionLoading ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                Generar y Enviar Link a dubroswix@gmail.com
              </button>

              {generatedLink && (
                <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                    Enlace de recuperación generado:
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      readOnly
                      value={generatedLink}
                      style={{
                        flex: 1,
                        fontSize: '0.75rem',
                        padding: '0.4rem 0.6rem',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        color: '#64748B',
                      }}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedLink);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 3000);
                      }}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      {copiedLink ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                      {copiedLink ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* OPTION 2: DIRECT PASSWORD UPDATE */}
            <div
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1.25rem',
                backgroundColor: '#FFFFFF',
              }}
            >
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: '#0F172A' }}>
                2. Definir Contraseña Inmediata
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 0.85rem 0', lineHeight: 1.4 }}>
                O si prefieres, escribe aquí la nueva contraseña y se actualizará de inmediato en el sistema.
              </p>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <input
                  type="text"
                  placeholder="Nueva contraseña (mínimo 6 caracteres)"
                  value={directNewPassword}
                  onChange={(e) => setDirectNewPassword(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.55rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                  }}
                />
                <button
                  disabled={passwordActionLoading || directNewPassword.length < 6}
                  onClick={() => handleUpdatePasswordDirectly(passwordModalUser.id)}
                  className="btn-primary"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
