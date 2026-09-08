'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

export interface OrderFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  onClearFilters?: () => void;
  totalResults: number;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onClearFilters,
  totalResults,
}) => {
  const hasActiveFilters = Boolean(search || (statusFilter && statusFilter !== 'Todas') || dateFrom || dateTo);

  return (
    <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* SEARCH BAR */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            width: '100%',
            maxWidth: '520px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '0.4rem 0.85rem',
          }}
        >
          <Search size={20} color="#64748B" />
          <input
            type="text"
            placeholder="Buscar por orden, cliente, empresa o email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              fontSize: '0.9rem',
              color: '#1E293B',
            }}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '0.2rem' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* FILTER CONTROLS ROW */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1.25rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {/* STATUS SELECT */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', marginBottom: '0.35rem' }}>
              Estado del Pedido
            </label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              style={{
                padding: '0.55rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                fontSize: '0.86rem',
                fontWeight: 500,
                outline: 'none',
                minWidth: '150px',
              }}
            >
              <option value="">Todas</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          {/* DATE RANGE */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', marginBottom: '0.35rem' }}>
              Rango de Fechas
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.84rem',
                  color: '#1E293B',
                }}
              />
              <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>a</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.84rem',
                  color: '#1E293B',
                }}
              />
            </div>
          </div>

          {/* CLEAR FILTERS */}
          {hasActiveFilters && onClearFilters && (
            <button
              onClick={onClearFilters}
              style={{
                padding: '0.55rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid #FCA5A5',
                backgroundColor: '#FEF2F2',
                color: '#991B1B',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* RESULTS COUNT */}
        <div style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: 500 }}>
          Mostrando <strong style={{ color: '#0F172A' }}>{totalResults}</strong> pedidos
        </div>
      </div>
    </div>
  );
};
