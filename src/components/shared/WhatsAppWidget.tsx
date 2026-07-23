'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export function WhatsAppWidget() {
  const phoneNumber = '50760000000';
  const defaultText = encodeURIComponent('Hola Dubros, me interesa solicitar información sobre el catálogo de monturas.');

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${defaultText}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99,
        backgroundColor: '#25D366',
        color: '#FFFFFF',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(37, 211, 102, 0.45)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
    >
      <MessageCircle size={30} fill="#FFFFFF" color="#25D366" />
    </a>
  );
}
