'use client';

import React, { useState, useEffect } from 'react';
import { Search, Phone, Mail, Building2, User, MessageSquare, CheckCircle, Clock, Send, Download } from 'lucide-react';
import { getContactSubmissions, type ContactSubmission } from '@/lib/contacts';

export default function AdminContactsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'aprobado' | 'pendiente'>('all');
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getContactSubmissions();
        setContacts(data);
      } catch (err) {
        console.error('Error loading contacts:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['Nombre', 'Empresa', 'Email', 'Telefono', 'Estado', 'Mensaje'];
    const rows = filteredContacts.map(c => [
      `"${c.fullName}"`,
      `"${c.company}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.status}"`,
      `"${c.message.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `contactos_dubros_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Solicitudes de Contacto y Clientes B2B
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {filteredContacts.length} ópticas y distribuidores registrados en la plataforma
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem' }}
        >
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      {/* Filters Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Buscar por nombre, óptica, email o WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.95rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-light)',
              backgroundColor: statusFilter === 'all' ? 'var(--blue)' : 'transparent',
              color: statusFilter === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Todos ({contacts.length})
          </button>
          <button
            onClick={() => setStatusFilter('aprobado')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-light)',
              backgroundColor: statusFilter === 'aprobado' ? '#10B981' : 'transparent',
              color: statusFilter === 'aprobado' ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Aprobados ({contacts.filter(c => c.status === 'aprobado').length})
          </button>
          <button
            onClick={() => setStatusFilter('pendiente')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-light)',
              backgroundColor: statusFilter === 'pendiente' ? '#F59E0B' : 'transparent',
              color: statusFilter === 'pendiente' ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Pendientes ({contacts.filter(c => c.status === 'pendiente').length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>Contacto / Óptica</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>Comunicación</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>Mensaje / Consulta</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>Cuenta</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600, textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  style={{ borderBottom: '1px solid var(--border-light)', transition: 'background-color 0.15s ease' }}
                >
                  <td style={{ padding: '1.1rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={15} color="var(--blue)" />
                      {contact.fullName || 'Sin nombre registrado'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <Building2 size={13} />
                      {contact.company}
                    </div>
                  </td>

                  <td style={{ padding: '1.1rem 1.25rem' }}>
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--blue)', textDecoration: 'none', marginBottom: '0.25rem' }}
                      >
                        <Mail size={13} /> {contact.email}
                      </a>
                    )}
                    {contact.phone && (
                      <a
                        href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10B981', textDecoration: 'none', fontWeight: 600 }}
                      >
                        <Phone size={13} /> {contact.phone}
                      </a>
                    )}
                  </td>

                  <td style={{ padding: '1.1rem 1.25rem', maxWidth: '380px' }}>
                    {contact.message ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                        {contact.message}
                      </p>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin mensaje</span>
                    )}
                  </td>

                  <td style={{ padding: '1.1rem 1.25rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: contact.status === 'aprobado' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        color: contact.status === 'aprobado' ? '#059669' : '#D97706',
                      }}
                    >
                      {contact.status === 'aprobado' ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {contact.status === 'aprobado' ? 'Aprobado' : 'Pendiente'}
                    </span>
                  </td>

                  <td style={{ padding: '1.1rem 1.25rem', textAlign: 'right' }}>
                    {contact.phone && (
                      <a
                        href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${contact.firstName}, gracias por contactar a Dubros Internacional.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.8rem',
                          backgroundColor: '#10B981',
                        }}
                      >
                        <Send size={12} /> Responder
                      </a>
                    )}
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

