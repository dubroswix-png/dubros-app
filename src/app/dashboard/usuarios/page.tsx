'use client';

import React from 'react';
import { ShieldCheck, UserCheck, Search, Filter } from 'lucide-react';

export default function AdminUsersPage() {
  const mockUsers = [
    {
      id: 'u1',
      name: 'Dubros SuperAdmin',
      email: 'dubroswix@gmail.com',
      company: 'Dubros Corp',
      country: 'Panamá 🇵🇦',
      businessType: 'Administrador Principal',
      role: 'SuperAdmin',
      whatsapp: '+507 6000-0000',
    },
    {
      id: 'u2',
      name: 'Ana Sophia Hernández',
      email: 'anasophia7@hotmail.com',
      company: 'Leroptic Óptica Boutique',
      country: 'Ecuador 🇪🇨',
      businessType: 'Óptica Independiente',
      role: 'Cliente',
      whatsapp: '+593 984930134',
    },
    {
      id: 'u3',
      name: 'María Ramon',
      email: 'ramonmin2@gmail.com',
      company: 'Megavision Óptica',
      country: 'Guatemala 🇬🇹',
      businessType: 'Cadena de Ópticas',
      role: 'Cliente',
      whatsapp: '+502 42973711',
    },
    {
      id: 'u4',
      name: 'Erika Maria Serrano',
      email: 'erikamas2018@gmail.com',
      company: 'Centro Óptico Cartagena',
      country: 'Colombia 🇨🇴',
      businessType: 'Distribuidor Óptico',
      role: 'Cliente',
      whatsapp: '+57 3157039704',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>👥 Gestión de Usuarios</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Administración de cuentas de clientes, distribuidores y personal interno.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Buscar usuario por correo, nombre o empresa..."
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

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Nombre</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Correo</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Empresa</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>País</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Rol</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700 }}>
                    {user.name}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>
                    {user.company}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    {user.country}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: user.role === 'SuperAdmin' ? '#FEE2E2' : '#EFF6FF',
                        color: user.role === 'SuperAdmin' ? '#DC2626' : '#1A56DB',
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>
                    {user.whatsapp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
