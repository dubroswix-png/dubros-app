'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Search, CheckCircle2, Clock, ShieldCheck, UserCheck, AlertCircle, RefreshCw, Database, UserPlus, ArrowLeft, Camera, Loader2 } from 'lucide-react';
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

  const handleValidateErp = async (user: UserProfileRecord) => {
    setProcessingId(user.id);
    setNotification(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/validate-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          taxId: user.tax_id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setNotification({
          type: 'error',
          message: data.error || 'Error al validar cliente en ERP.',
        });
      } else if (data.matched) {
        setNotification({
          type: 'success',
          message: data.message,
        });
      } else {
        setNotification({
          type: 'error',
          message: data.message || 'Cliente no encontrado en ERP Switch-Soft.',
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Error de conexión con el servidor.',
      });
    } finally {
      setProcessingId(null);
      setTimeout(() => setNotification(null), 5000);
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

        return nameMatch || emailMatch || companyMatch || countryMatch;
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
                          onClick={() => handleValidateErp(user)}
                          className="btn-secondary"
                          style={{
                            padding: '0.4rem 0.75rem',
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            color: 'var(--blue)',
                            borderColor: 'var(--blue)',
                          }}
                          title="Buscar y vincular código de cliente en el ERP Switch-Soft"
                        >
                          <Database size={13} /> Validar ERP
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

                        {user.role !== 'admin' && (
                          <button
                            disabled={processingId === user.id}
                            onClick={() => handleRoleChange(user.id, 'admin', user.email)}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          >
                            Hacer Admin
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
    </div>
  );
}
