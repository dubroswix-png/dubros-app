'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

export interface AdminAlertModalProps {
  isOpen: boolean;
  type?: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  highlight?: string;
  steps?: string[];
  actionLabel?: string;
  actionHref?: string;
  onClose: () => void;
  onAction?: () => void;
}

export const AdminAlertModal: React.FC<AdminAlertModalProps> = ({
  isOpen,
  type = 'info',
  title,
  message,
  highlight,
  steps,
  actionLabel,
  actionHref,
  onClose,
  onAction,
}) => {
  if (!isOpen) return null;

  const iconMap = {
    success: <CheckCircle2 size={36} color="#10B981" />,
    warning: <AlertTriangle size={36} color="#F59E0B" />,
    error: <XCircle size={36} color="#EF4444" />,
    info: <Info size={36} color="#3B82F6" />,
  };

  const borderTopColor = {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  }[type];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          maxWidth: '460px',
          width: '100%',
          padding: '2rem',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)',
          position: 'relative',
          borderTop: `5px solid ${borderTopColor}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#64748B',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
          {iconMap[type]}
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
            {title}
          </h3>
          <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
            {message}
          </p>

          {highlight && (
            <div
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#0F172A',
                textAlign: 'left',
              }}
            >
              {highlight}
            </div>
          )}

          {steps && steps.length > 0 && (
            <div style={{ width: '100%', textAlign: 'left', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Pasos a seguir:
              </span>
              <ul style={{ margin: '0.4rem 0 0 1.2rem', padding: 0, fontSize: '0.85rem', color: '#334155' }}>
                {steps.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '1.25rem' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                color: '#334155',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Cerrar
            </button>

            {actionLabel && (
              actionHref ? (
                <a
                  href={actionHref}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '0.65rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                  }}
                >
                  {actionLabel}
                </a>
              ) : (
                <button
                  onClick={() => {
                    if (onAction) onAction();
                    onClose();
                  }}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: '0.65rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                  }}
                >
                  {actionLabel}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
