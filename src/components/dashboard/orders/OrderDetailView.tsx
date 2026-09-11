'use client';

import React from 'react';
import {
  ArrowLeft,
  FileSpreadsheet,
  Printer,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  Trash2,
  FileText,
} from 'lucide-react';
import { OrderRecord } from '@/lib/orders';
import { resolveProductImageUrl, handleImageFallback } from '@/lib/images';
import { formatPrice, formatDateSpanish } from '@/lib/formatters';
import { downloadSwitchXLSX } from '@/lib/export-excel';
import { OrderStatusBadge } from './OrderStatusBadge';

export interface ProductValidationResult {
  itemId: string;
  reference: string;
  code: string;
  requestedQuantity: number;
  stock: number;
  existsInERP: boolean;
  codigoBarraId?: number;
  status: 'available' | 'partial' | 'unavailable';
  badgeColor: 'green' | 'yellow' | 'red';
  label: string;
  description?: string;
  unitPrice?: number;
}

export interface ProductsValidationData {
  allAvailable: boolean;
  hasUnavailable: boolean;
  hasPartial: boolean;
  items: ProductValidationResult[];
}

export interface OrderDetailViewProps {
  order: OrderRecord;
  onBack: () => void;
  isProductsValid: boolean;
  isClientValid: boolean;
  isOrderCreated: boolean;
  validatingProducts: boolean;
  validatingClient: boolean;
  syncingOrder: boolean;
  isAdmin?: boolean;
  onDelete?: (order: OrderRecord) => void;
  onValidateProducts: () => void;
  onValidateClient: () => void;
  onCreateOrder: () => void;
  productsValidation?: ProductsValidationData;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({
  order,
  onBack,
  isProductsValid,
  isClientValid,
  isOrderCreated,
  validatingProducts,
  validatingClient,
  syncingOrder,
  isAdmin,
  onDelete,
  onValidateProducts,
  onValidateClient,
  onCreateOrder,
  productsValidation,
}) => {
  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.print();
  };

  const totalPieces = order.total_items || (order.order_items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);
  const clientName = order.company_name || order.customer_name || 'Cliente';

  const hasUnavailable = productsValidation?.hasUnavailable;
  const hasPartial = productsValidation?.hasPartial;

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
      {/* TOP NAV BAR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        {/* Left: Back button + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onBack}
            className="btn-secondary"
            style={{
              padding: '0.45rem 0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                Pedido {order.order_number}
              </h2>
              {order.switch_order_number && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: '#065F46',
                    backgroundColor: '#D1FAE5',
                    border: '1px solid #A7F3D0',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                  }}
                >
                  ✓ Switch: #{order.switch_order_number}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Cliente: <strong>{clientName}</strong> ({order.customer_email})
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={(e) => downloadSwitchXLSX(order, e)}
            className="btn-primary"
            style={{
              backgroundColor: '#059669',
              padding: '0.5rem 0.9rem',
              fontSize: '0.84rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 700,
            }}
            title="Descargar plantilla Switch (.xlsx)"
          >
            <FileSpreadsheet size={15} /> Plantilla Switch (.xlsx)
          </button>

          <button
            onClick={handlePrint}
            className="btn-secondary"
            style={{
              padding: '0.5rem 0.9rem',
              fontSize: '0.84rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 600,
            }}
          >
            <Printer size={15} /> Imprimir
          </button>

          {isAdmin && onDelete && (
            <button
              onClick={() => onDelete(order)}
              className="btn-secondary"
              style={{
                padding: '0.5rem 0.9rem',
                fontSize: '0.84rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 600,
                color: '#DC2626',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
              title="Eliminar este pedido permanentemente (Solo Admin)"
            >
              <Trash2 size={15} /> Eliminar Pedido
            </button>
          )}
        </div>
      </div>

      {/* 3-STEP VALIDATION BAR */}
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Flujo de Creación y Sincronización Switch ERP
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* STEP 1: VALIDAR PRODUCTOS */}
          <button
            onClick={onValidateProducts}
            disabled={validatingProducts}
            style={{
              flex: '1 1 180px',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: validatingProducts
                ? '1px solid #64748B'
                : isProductsValid
                ? '1px solid #047857'
                : hasUnavailable
                ? '1px solid #DC2626'
                : hasPartial
                ? '1px solid #D97706'
                : '1px solid #1864F6',
              backgroundColor: validatingProducts
                ? '#475569'
                : isProductsValid
                ? '#047857'
                : hasUnavailable
                ? '#DC2626'
                : hasPartial
                ? '#D97706'
                : '#1864F6',
              color: '#FFFFFF',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: isProductsValid
                ? '0 2px 6px rgba(4, 120, 87, 0.3)'
                : hasUnavailable
                ? '0 2px 6px rgba(220, 38, 38, 0.3)'
                : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {validatingProducts ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Verificando monturas en ERP...
              </>
            ) : isProductsValid ? (
              <>
                <CheckCircle2 size={16} color="#FFFFFF" /> 1. Monturas Disponibles (Stock OK)
              </>
            ) : hasUnavailable ? (
              <>
                <XCircle size={16} color="#FFFFFF" /> 1. Montura No Disponible / Agotada
              </>
            ) : hasPartial ? (
              <>
                <AlertTriangle size={16} color="#FFFFFF" /> 1. Stock Parcial en Monturas
              </>
            ) : (
              '1. Verificar Disponibilidad Monturas'
            )}
          </button>

          {/* STEP 2: VALIDAR CLIENTE */}
          {isClientValid ? (
            <button
              disabled
              style={{
                flex: '1 1 180px',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #047857',
                backgroundColor: '#047857',
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'default',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(4, 120, 87, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              <CheckCircle2 size={16} color="#FFFFFF" /> 2. Cliente Validado
            </button>
          ) : (
            <button
              onClick={onValidateClient}
              disabled={validatingClient}
              style={{
                flex: '1 1 180px',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #1864F6',
                backgroundColor: '#1864F6',
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
            >
              {validatingClient ? <Loader2 size={16} className="animate-spin" /> : '2. Validar Cliente'}
            </button>
          )}

          {/* STEP 3: CREAR PEDIDO EN SWITCH */}
          {isOrderCreated ? (
            <button
              disabled
              style={{
                flex: '1 1 180px',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #047857',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'default',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              ✓ 3. Pedido Creado en Switch
            </button>
          ) : (
            <button
              onClick={onCreateOrder}
              disabled={!isClientValid || syncingOrder}
              style={{
                flex: '1 1 180px',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: isClientValid ? '#0B1A2F' : '#94A3B8',
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: isClientValid ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
              title={!isClientValid ? 'Valida primero el cliente antes de crear el pedido' : ''}
            >
              {syncingOrder ? <Loader2 size={16} className="animate-spin" /> : '3. Crear Pedido en Switch'}
            </button>
          )}
        </div>

        {/* Informative Warning Banner if unavailable or partial */}
        {hasUnavailable && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.82rem',
              color: '#991B1B',
            }}
          >
            <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
            <div>
              <strong>Atención:</strong> Hay productos que <strong>no existen en Switch ERP</strong> o no tienen stock disponible. Revisa los mensajes en rojo antes de procesar el pedido.
            </div>
          </div>
        )}

        {hasPartial && !hasUnavailable && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.82rem',
              color: '#92400E',
            }}
          >
            <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0 }} />
            <div>
              <strong>Stock Parcial:</strong> Uno o más artículos tienen menos piezas disponibles en el ERP que las solicitadas por el cliente.
            </div>
          </div>
        )}
      </div>

      {/* METADATA SUMMARY GRID */}
      <div
        className="order-meta-grid"
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          marginBottom: '2rem',
        }}
      >
        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Fecha del pedido
          </span>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatDateSpanish(order.created_at, 'bubble')}
          </span>
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Subtotal
          </span>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatPrice(order.subtotal, false)}
          </span>
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total piezas
          </span>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {totalPieces} piezas
          </span>
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.2rem' }}>
            Estado
          </span>
          <OrderStatusBadge status={order.switch_order_number ? 'Procesado' : order.status} size="sm" />
        </div>

        {order.switch_order_number && (
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ display: 'block', fontSize: '0.72rem', color: '#047857', textTransform: 'uppercase', fontWeight: 700 }}>
              ✓ Switch ERP Orden
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#065F46' }}>
              #{order.switch_order_number}
            </span>
          </div>
        )}
      </div>

      {/* NOTAS DE DESPACHO / INSTRUCCIONES ESPECIALES DEL CLIENTE */}
      <div
        style={{
          backgroundColor: order.notes && order.notes.trim() ? '#F0FDF4' : 'var(--bg-secondary)',
          border: order.notes && order.notes.trim() ? '1.5px solid #86EFAC' : '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '2rem',
          boxShadow: order.notes && order.notes.trim() ? '0 4px 12px rgba(16, 185, 129, 0.08)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color={order.notes && order.notes.trim() ? '#047857' : 'var(--text-secondary)'} />
            <h4
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: order.notes && order.notes.trim() ? '#065F46' : 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: 0,
              }}
            >
              📝 Notas de Despacho / Instrucciones del Pedido
            </h4>
          </div>
          {order.notes && order.notes.trim() && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                backgroundColor: '#DCFCE7',
                color: '#166534',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid #BBF7D0',
              }}
            >
              CON NOTA ADJUNTA
            </span>
          )}
        </div>

        {order.notes && order.notes.trim() ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #BBF7D0',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem 1.15rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#0F172A',
              lineHeight: 1.55,
              whiteSpace: 'pre-wrap',
            }}
          >
            &ldquo;{order.notes.trim()}&rdquo;
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            El cliente no dejó notas de despacho ni instrucciones especiales en este pedido.
          </p>
        )}
      </div>

      {/* ITEMS LIST */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '1rem' }}>
          Artículos en la Orden ({order.order_items?.length || 0})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(order.order_items || []).map((item, idx) => {
            const itemRef = (item.reference || item.product?.reference || '').trim();
            const itemCode = (item.code || item.product?.code || itemRef).trim();
            const itemId = String(item.id || item.product_id || itemRef);

            // Match validation result
            const val = productsValidation?.items?.find(
              (v) =>
                (v.itemId && v.itemId === itemId) ||
                (v.reference && v.reference.toLowerCase() === itemRef.toLowerCase()) ||
                (v.code && v.code.toLowerCase() === itemCode.toLowerCase())
            );

            const imageUrl = resolveProductImageUrl(item);
            const brand = item.brand || item.product?.brands?.name || 'Dubros';

            return (
              <div
                key={item.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  backgroundColor: val?.badgeColor === 'red'
                    ? '#FEF2F2'
                    : val?.badgeColor === 'yellow'
                    ? '#FFFBEB'
                    : val?.badgeColor === 'green'
                    ? '#F0FDF4'
                    : 'var(--bg-secondary)',
                  border: val?.badgeColor === 'red'
                    ? '1.5px solid #F87171'
                    : val?.badgeColor === 'yellow'
                    ? '1.5px solid #FBBF24'
                    : val?.badgeColor === 'green'
                    ? '1.5px solid #4ADE80'
                    : '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  flexWrap: 'wrap',
                  boxShadow: val?.badgeColor === 'green'
                    ? '0 2px 8px rgba(74, 222, 128, 0.12)'
                    : val?.badgeColor === 'yellow'
                    ? '0 2px 8px rgba(251, 191, 36, 0.12)'
                    : val?.badgeColor === 'red'
                    ? '0 2px 8px rgba(248, 113, 113, 0.12)'
                    : 'none',
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: '110px',
                    height: '85px',
                    flexShrink: 0,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '0.25rem',
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={itemRef}
                    onError={handleImageFallback}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor: 'var(--navy)',
                        color: '#FFFFFF',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {brand}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--blue)' }}>
                      {itemRef}
                    </span>

                    {/* Quick status pill next to reference */}
                    {validatingProducts ? (
                      <span style={{ fontSize: '0.7rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                        ● CONSULTANDO ERP...
                      </span>
                    ) : val?.badgeColor === 'green' ? (
                      <span style={{ fontSize: '0.7rem', backgroundColor: '#DEF7EC', color: '#03543F', border: '1px solid #86EFAC', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>
                        ● DISPONIBLE
                      </span>
                    ) : val?.badgeColor === 'yellow' ? (
                      <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>
                        ● STOCK PARCIAL
                      </span>
                    ) : val?.badgeColor === 'red' ? (
                      <span style={{ fontSize: '0.7rem', backgroundColor: '#FDE8E8', color: '#9B1C1C', border: '1px solid #FCA5A5', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>
                        ● NO DISPONIBLE
                      </span>
                    ) : null}
                  </div>

                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {val?.description || item.product?.description || `Montura ${brand} ${itemRef}`}
                  </div>

                  {/* Pills: Specs + ERP Live Status */}
                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.74rem', fontWeight: 600 }}>
                      Talla: {item.product?.eye_size || '52'}
                    </span>
                    <span style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.74rem', fontWeight: 600 }}>
                      {item.material || item.product?.material || 'Acetato'}
                    </span>

                    {/* DYNAMIC REAL-TIME ERP STATUS PILL */}
                    {validatingProducts ? (
                      <span
                        style={{
                          backgroundColor: '#EFF6FF',
                          color: '#1D4ED8',
                          border: '1px solid #BFDBFE',
                          padding: '0.22rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Loader2 size={13} className="animate-spin" /> Verificando en Switch ERP...
                      </span>
                    ) : val ? (
                      val.badgeColor === 'green' ? (
                        /* VERDE: DISPONIBLE */
                        <span
                          style={{
                            backgroundColor: '#DEF7EC',
                            color: '#03543F',
                            border: '1px solid #86EFAC',
                            padding: '0.22rem 0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <CheckCircle2 size={14} color="#059669" /> {val.label}
                        </span>
                      ) : val.badgeColor === 'yellow' ? (
                        /* AMARILLO: STOCK PARCIAL */
                        <span
                          style={{
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            border: '1px solid #FCD34D',
                            padding: '0.22rem 0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <AlertTriangle size={14} color="#D97706" /> {val.label}
                        </span>
                      ) : (
                        /* ROJO: NO EXISTE O SIN STOCK */
                        <span
                          style={{
                            backgroundColor: '#FDE8E8',
                            color: '#9B1C1C',
                            border: '1px solid #FCA5A5',
                            padding: '0.22rem 0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <XCircle size={14} color="#DC2626" /> {val.label}
                        </span>
                      )
                    ) : (
                      /* PENDIENTE DE VALIDACIÓN */
                      <span
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-light)',
                          padding: '0.22rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        ⚪ Pendiente de Validar con ERP
                      </span>
                    )}
                  </div>
                </div>

                {/* Price column */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {item.quantity} {item.quantity === 1 ? 'pieza' : 'piezas'} × {formatPrice(item.unit_price, false)}
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {formatPrice(Number(item.unit_price) * Number(item.quantity), false)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
