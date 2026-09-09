'use client';

import React from 'react';

export interface ClientFoundData {
  isOpen: boolean;
  orderId: string;
  code: string;
  name: string;
}

export interface OrderCreatedData {
  isOpen: boolean;
  switchOrderNumber: string;
  message: string;
}

export interface ProductsValidatedData {
  isOpen: boolean;
  orderId: string;
  message: string;
  allAvailable: boolean;
}

export interface OrderBubbleModalsProps {
  clientFoundModal: ClientFoundData | null;
  onConfirmClient: (orderId: string, code: string) => void;
  onCloseClientFound: () => void;

  orderCreatedModal: OrderCreatedData | null;
  onCloseOrderCreated: () => void;

  productsValidatedModal?: ProductsValidatedData | null;
  onCloseProductsValidated?: () => void;
}

export const OrderBubbleModals: React.FC<OrderBubbleModalsProps> = ({
  clientFoundModal,
  onConfirmClient,
  onCloseClientFound,
  orderCreatedModal,
  onCloseOrderCreated,
  productsValidatedModal,
  onCloseProductsValidated,
}) => {
  return (
    <>
      {/* 1. CLIENTE ENCONTRADO (BUBBLE MODAL) */}
      {clientFoundModal && clientFoundModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(3px)',
          }}
          onClick={onCloseClientFound}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              maxWidth: '430px',
              width: '100%',
              padding: '2rem 2.25rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onCloseClientFound}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#1E293B',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ✕
            </button>

            <h3 style={{ textAlign: 'center', color: '#64748B', fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1.5rem 0' }}>
              Cliente encontrado:
            </h3>

            <div style={{ fontSize: '1.05rem', color: '#334155', marginBottom: '0.85rem' }}>
              Código: <strong>{clientFoundModal.code}</strong>
            </div>

            <div style={{ fontSize: '1.05rem', color: '#334155', marginBottom: '2rem' }}>
              Nombre: <strong>{clientFoundModal.name}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => onConfirmClient(clientFoundModal.orderId, clientFoundModal.code)}
                style={{
                  backgroundColor: '#0055A5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.7rem 2.2rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                Confirmar cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ORDEN CREADA EN SWITCH (BUBBLE MODAL) */}
      {orderCreatedModal && orderCreatedModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(3px)',
          }}
          onClick={onCloseOrderCreated}
        >
          <div
            className="animate-success-pop"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              maxWidth: '430px',
              width: '100%',
              padding: '2rem 2.25rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onCloseOrderCreated}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#1E293B',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ✕
            </button>

            <h3 style={{ textAlign: 'center', color: '#64748B', fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1.5rem 0' }}>
              Orden creada
            </h3>

            <div style={{ fontSize: '1rem', color: '#475569', marginBottom: '0.85rem' }}>
              Número de pedido switch: <strong style={{ color: '#0F172A' }}>{orderCreatedModal.switchOrderNumber}</strong>
            </div>

            <div style={{ fontSize: '1rem', color: '#475569', marginBottom: '2rem' }}>
              Mensaje: <strong style={{ color: '#0F172A' }}>{orderCreatedModal.message}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={onCloseOrderCreated}
                style={{
                  backgroundColor: '#0055A5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.7rem 2.5rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                Confirmado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. PRODUCTOS VALIDADOS (BUBBLE MODAL) */}
      {productsValidatedModal && productsValidatedModal.isOpen && onCloseProductsValidated && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(3px)',
          }}
          onClick={onCloseProductsValidated}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              maxWidth: '430px',
              width: '100%',
              padding: '2rem 2.25rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onCloseProductsValidated}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#1E293B',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ✕
            </button>

            <h3 style={{ textAlign: 'center', color: '#64748B', fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1.5rem 0' }}>
              Validación de Productos
            </h3>

            <p style={{ fontSize: '1rem', color: '#334155', textAlign: 'center', marginBottom: '2rem' }}>
              {productsValidatedModal.message}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={onCloseProductsValidated}
                style={{
                  backgroundColor: '#0055A5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.7rem 2.5rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
