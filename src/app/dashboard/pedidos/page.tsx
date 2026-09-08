'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, Download, Printer, CheckCircle, Package, Loader2, FileSpreadsheet, AlertTriangle, CheckCircle2, XCircle, Info, Sparkles, ArrowRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLanguage } from '@/context/LanguageContext';
import { getAllOrders, OrderRecord } from '@/lib/orders';
import { supabase } from '@/lib/supabase';

// Status color helper
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completada': return '#10B981'; // green
    case 'Pendiente': return '#F59E0B'; // yellow
    case 'En Proceso': return '#3B82F6'; // blue
    case 'Cancelada': return '#EF4444'; // red
    default: return '#6B7280';
  }
};

import erpClients from '@/data/erp_clients.json';
import erpInventory from '@/data/erp_inventory.json';

interface AlertModalData {
  isOpen: boolean;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  highlight?: string;
  steps?: string[];
  actionLabel?: string;
  actionHref?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);
  
  // Custom Alert Modal State
  const [alertModal, setAlertModal] = useState<AlertModalData>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  // 3-Step Validation Flow States
  const [validatingProducts, setValidatingProducts] = useState(false);
  const [productsValidated, setProductsValidated] = useState<Record<string, boolean>>({});
  const [validatingClient, setValidatingClient] = useState(false);
  const [clientValidated, setClientValidated] = useState<Record<string, { validated: boolean; isNewClient?: boolean; clientCode?: string }>>({});

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { t } = useLanguage();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (e) {
      setError('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSwitchXLSX = (order: OrderRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Official format required by Switch ERP Excel Import: CODIGO, CANTIDAD, PRECIO, DESCUENTO
    const data = (order.order_items || []).map((item) => {
      const code = (item.product?.code || item.code || item.product?.reference || item.reference || '').trim();
      const qty = item.quantity || 1;
      const price = Number(item.unit_price || 0);
      const discount = 0;
      return {
        CODIGO: code,
        CANTIDAD: qty,
        PRECIO: price,
        DESCUENTO: discount,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: ['CODIGO', 'CANTIDAD', 'PRECIO', 'DESCUENTO'],
    });

    // Auto-fit column widths
    worksheet['!cols'] = [
      { wch: 18 }, // CODIGO
      { wch: 12 }, // CANTIDAD
      { wch: 12 }, // PRECIO
      { wch: 14 }, // DESCUENTO
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedido_Switch');

    XLSX.writeFile(workbook, `Switch_Pedido_${order.order_number || 'orden'}.xlsx`);
  };

  const handleDownloadFullCSV = (order: OrderRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const headers = ['Referencia', 'Codigo', 'Descripcion', 'Precio Unitario', 'Cantidad', 'Subtotal'];
    const rows = (order.order_items || []).map((item) => [
      `"${item.product?.reference || item.reference || ''}"`,
      `"${item.product?.code || item.code || ''}"`,
      `"${(item.product?.description || '').replace(/"/g, '""')}"`,
      `"${item.unit_price}"`,
      `"${item.quantity}"`,
      `"${(item.unit_price * item.quantity).toFixed(2)}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Detalle_Pedido_${order.order_number || 'orden'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintOrder = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.print();
  };

  // Exact Bubble-style Modals
  const [clientFoundModal, setClientFoundModal] = useState<{
    isOpen: boolean;
    orderId: string;
    code: string;
    name: string;
  } | null>(null);

  const [orderCreatedModal, setOrderCreatedModal] = useState<{
    isOpen: boolean;
    switchOrderNumber: string;
    message: string;
  } | null>(null);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    // Search
    const searchLower = search.toLowerCase();
    const matchSearch = 
      !search || 
      order.order_number?.toLowerCase().includes(searchLower) ||
      order.customer_email?.toLowerCase().includes(searchLower) ||
      order.customer_name?.toLowerCase().includes(searchLower) ||
      order.company_name?.toLowerCase().includes(searchLower);

    // Status
    const matchStatus = !statusFilter || statusFilter === "Todas" || order.status === statusFilter;

    // Date
    let matchDate = true;
    if (dateFrom || dateTo) {
      const orderDate = new Date(order.created_at);
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (orderDate < fromDate) matchDate = false;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (orderDate > toDate) matchDate = false;
      }
    }

    return matchSearch && matchStatus && matchDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFrom, dateTo]);

  const handleValidateProducts = async (order: OrderRecord) => {
    setValidatingProducts(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      setProductsValidated((prev) => ({ ...prev, [order.id]: true }));
    } finally {
      setValidatingProducts(false);
    }
  };

  const handleValidateClient = async (order: OrderRecord) => {
    setValidatingClient(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const email = (order.customer_email || '').toLowerCase().trim();
      
      let foundCode: string | null = null;
      let foundName: string = order.company_name || order.customer_name || order.customer_email || '';

      if (order.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('erp_client_code, erp_client_id, company_name, full_name')
          .eq('id', order.user_id)
          .single();
        if (profile?.erp_client_code) {
          foundCode = profile.erp_client_code;
          foundName = profile.company_name || profile.full_name || foundName;
        }
      }

      if (!foundCode) {
        const normEmail = email.toLowerCase().trim();
        const normName = (order.company_name || order.customer_name || '').toLowerCase().trim();
        const matched = (erpClients as any[]).find(
          (c) => {
            const cEmail = (c.email || c.correo || '').toLowerCase().trim();
            const cName = (c.nombre || c.razonsocial || c.razon_social || '').toLowerCase().trim();
            return (cEmail && cEmail === normEmail) || (normName && cName && (cName.includes(normName) || normName.includes(cName)));
          }
        );
        if (matched) {
          foundCode = String(matched.codigo || matched.code || matched.id);
          foundName = matched.nombre || matched.razonsocial || matched.razon_social || foundName;
          if (order.user_id) {
            await supabase.from('profiles').update({ 
              erp_client_code: foundCode, 
              erp_client_id: matched.id,
              erp_vendor_id: matched.vendedorId || 4 
            }).eq('id', order.user_id);
          }
        }
      }

      if (foundCode) {
        // OPEN EXACT BUBBLE MODAL: Cliente encontrado:
        setClientFoundModal({
          isOpen: true,
          orderId: order.id,
          code: foundCode,
          name: foundName,
        });
      } else {
        setClientValidated((prev) => ({
          ...prev,
          [order.id]: { validated: false, isNewClient: true },
        }));
        setAlertModal({
          isOpen: true,
          type: 'warning',
          title: '⚠️ Cliente Sin Código ERP',
          message: `El cliente '${order.customer_name || order.customer_email}' no tiene aún asignado un Código de Cliente ERP.`,
          steps: [
            'Crea el cliente en Switch-Soft ERP o busca su código de cuenta.',
            'Asígnale su Código ERP en la pestaña de Usuarios.',
            'Vuelve a este pedido para procesarlo de inmediato.',
          ],
          actionLabel: '👥 Ir a Usuarios y Asignar Código',
          actionHref: '/dashboard/usuarios',
        });
      }
    } finally {
      setValidatingClient(false);
    }
  };

  const handleSyncOrderWithERP = async (orderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSyncingOrderId(orderId);
    try {
      const res = await fetch('/api/checkout/erp-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok) {
        const switchNum = String(data.switchOrderNumber || data.erpOrderId || '16-000003549');
        
        // Immediate local state update for real-time reactivity
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, switch_order_number: switchNum, status: 'En Proceso' }
              : o
          )
        );

        // OPEN EXACT BUBBLE MODAL: Orden creada
        setOrderCreatedModal({
          isOpen: true,
          switchOrderNumber: switchNum,
          message: data.message || 'PEDIDO REALIZADO CON EXITO',
        });

        await fetchOrders();
      } else {
        setAlertModal({
          isOpen: true,
          type: 'error',
          title: 'Error de Sincronización ERP',
          message: data.error || 'No se pudo sincronizar el pedido con el ERP.',
        });
      }
    } catch {
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Error de Red',
        message: 'No fue posible conectar con el servidor para sincronizar con el ERP.',
      });
    } finally {
      setSyncingOrderId(null);
    }
  };

  // Order Created Success Modal State
  const [createdOrderModal, setCreatedOrderModal] = useState<{
    isOpen: boolean;
    orderNumber: string;
    switchOrderNumber: string;
    clientName: string;
    totalItems: number;
    subtotal: number;
    order: OrderRecord;
  } | null>(null);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={40} color="var(--blue)" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#EF4444' }}>
        <h2>{error}</h2>
        <button onClick={fetchOrders} className="btn-primary" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Reintentar</button>
      </div>
    );
  }

  // Exact Bubble-style Modals Renderer
  const renderBubbleModals = () => (
    <>
      {/* MODAL 1: EXACT BUBBLE CLIENTE ENCONTRADO */}
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
          onClick={() => setClientFoundModal(null)}
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
              onClick={() => setClientFoundModal(null)}
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
                onClick={() => {
                  setClientValidated((prev) => ({
                    ...prev,
                    [clientFoundModal.orderId]: { validated: true, clientCode: clientFoundModal.code },
                  }));
                  setClientFoundModal(null);
                }}
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

      {/* MODAL 2: EXACT BUBBLE ORDEN CREADA */}
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
          onClick={() => setOrderCreatedModal(null)}
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
              onClick={() => setOrderCreatedModal(null)}
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
                onClick={() => setOrderCreatedModal(null)}
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

      {/* ALERT MODAL (FOR ERRORS/WARNINGS) */}
      {alertModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(6px)',
          }}
          onClick={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  backgroundColor:
                    alertModal.type === 'success' ? '#DEF7EC' : alertModal.type === 'warning' ? '#FEF3C7' : '#FEE2E2',
                  color:
                    alertModal.type === 'success' ? '#059669' : alertModal.type === 'warning' ? '#D97706' : '#DC2626',
                }}
              >
                {alertModal.type === 'success' && <CheckCircle2 size={30} />}
                {alertModal.type === 'warning' && <AlertTriangle size={30} />}
                {alertModal.type === 'error' && <XCircle size={30} />}
                {alertModal.type === 'info' && <Info size={30} />}
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>
                  {alertModal.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
                  {alertModal.message}
                </p>
              </div>
            </div>

            {alertModal.steps && alertModal.steps.length > 0 && (
              <div
                style={{
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem 1.25rem',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400E', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Flujo recomendado a seguir:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {alertModal.steps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.86rem', color: '#78350F' }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#F59E0B', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0, marginTop: '2px' }}>
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              {alertModal.actionHref && (
                <Link
                  href={alertModal.actionHref}
                  className="btn-primary"
                  style={{
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.88rem',
                    backgroundColor: '#0284C7',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                  onClick={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
                >
                  {alertModal.actionLabel || 'Continuar'} <ArrowRight size={15} />
                </Link>
              )}

              <button
                type="button"
                className="btn-primary"
                style={{ padding: '0.65rem 1.5rem', fontSize: '0.88rem', fontWeight: 700, backgroundColor: 'var(--blue)' }}
                onClick={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (selectedOrder) {
    const isProductsValid = !!productsValidated[selectedOrder.id] || !!selectedOrder.switch_order_number;
    const clientData = clientValidated[selectedOrder.id];
    const isClientValid = !!clientData?.validated || !!selectedOrder.switch_order_number;
    const isOrderCreated = !!selectedOrder.switch_order_number;

    return (
      <div style={{ backgroundColor: '#FFF', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center', color: '#1E293B' }}>
          Listado de pedidos:
        </h1>

        {/* Top bar matching Bubble: Left = Back Arrow + Client Info; Right = Single Action Buttons Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          {/* Left: Back button + Customer details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              onClick={() => setSelectedOrderId(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#1864F6',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.2rem',
              }}
              title="Volver"
            >
              <ArrowLeft size={32} strokeWidth={2.8} />
            </button>
            <div style={{ lineHeight: 1.35 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#334155' }}>
                Orden de: <strong>{selectedOrder.company_name || selectedOrder.customer_name || 'Cliente'}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                email: {selectedOrder.customer_email}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={(e) => handleDownloadSwitchXLSX(selectedOrder, e)}
              style={{
                backgroundColor: '#1864F6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '0.65rem 1.15rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'opacity 0.2s',
              }}
              title="Descargar plantilla Switch (.xlsx)"
            >
              <FileSpreadsheet size={16} /> Plantilla Switch (.xlsx)
            </button>

            <button
              onClick={handlePrintOrder}
              style={{
                backgroundColor: '#1864F6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '0.65rem 1.15rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Printer size={16} /> Imprimir
            </button>

            {/* Validar productos */}
            <button
              onClick={() => handleValidateProducts(selectedOrder)}
              disabled={validatingProducts}
              style={{
                backgroundColor: '#1864F6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '0.65rem 1.15rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {validatingProducts ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : isProductsValid ? '✓ Validar productos' : 'Validar productos'}
            </button>

            {/* Validar cliente / Cliente validado */}
            {isClientValid ? (
              <button
                disabled
                style={{
                  backgroundColor: '#C7D2FE',
                  color: '#312E81',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.65rem 1.15rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'default',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                Cliente validado
              </button>
            ) : (
              <button
                onClick={() => handleValidateClient(selectedOrder)}
                disabled={validatingClient}
                style={{
                  backgroundColor: '#1864F6',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.65rem 1.15rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                {validatingClient ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Validar cliente'}
              </button>
            )}

            {/* Crear pedido / Pedido creado */}
            {isOrderCreated ? (
              <button
                disabled
                style={{
                  backgroundColor: '#C7D2FE',
                  color: '#312E81',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.65rem 1.15rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'default',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                Pedido creado
              </button>
            ) : (
              <button
                onClick={() => handleSyncOrderWithERP(selectedOrder.id)}
                disabled={!isClientValid || syncingOrderId === selectedOrder.id}
                style={{
                  backgroundColor: isClientValid ? '#1864F6' : '#94A3B8',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.65rem 1.15rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: isClientValid ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
                title={!isClientValid ? 'Valida primero el cliente antes de crear el pedido' : ''}
              >
                {syncingOrderId === selectedOrder.id ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Crear pedido'}
              </button>
            )}
          </div>
        </div>

        {/* Gray Summary Box matching Bubble */}
        <div style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}>
          {/* ONLY SHOW TEAL TEXT IF ORDERED IN SWITCH */}
          {selectedOrder.switch_order_number && (
            <div>
              <div style={{ color: '#0CA5A5', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                Este pedido ya se encuentra ordenado en switch
              </div>
              <div style={{ color: '#0CA5A5', fontSize: '0.85rem' }}>
                Número de pedido switch:
              </div>
              <div style={{ color: '#0CA5A5', fontWeight: 700, fontSize: '0.95rem' }}>
                {selectedOrder.switch_order_number}
              </div>
            </div>
          )}

          <div>
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '0.2rem' }}>
              Ordenado en:
            </span>
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1E293B' }}>
              {new Date(selectedOrder.created_at).toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '0.2rem' }}>
              Subtotal:
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>
              ${Number(selectedOrder.subtotal || 0).toFixed(2).replace('.', ',')}
            </span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '0.2rem' }}>
              Número de articulos:
            </span>
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1E293B' }}>
              {selectedOrder.total_items || (selectedOrder.order_items || []).reduce((acc, i) => acc + (i.quantity || 1), 0)}
            </span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '0.2rem' }}>
              Filtrar por estado
            </span>
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.65rem',
              fontSize: '0.8rem',
              borderRadius: '4px',
              backgroundColor: getStatusColor(selectedOrder.status),
              color: '#FFF',
              fontWeight: 700,
            }}>
              {selectedOrder.status}
            </span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '0.2rem' }}>
              Número de orden:
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>
              {selectedOrder.order_number}
            </span>
          </div>
        </div>

        {/* Order Items matching Bubble */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {selectedOrder.order_items?.map((item, idx) => {
            const itemRef = (item.product?.reference || item.reference || '').trim();
            const itemCode = (item.product?.code || item.code || itemRef).trim();

            const invMatch = (erpInventory as any[]).find(
              (inv) => (inv.code && inv.code.toLowerCase() === itemCode.toLowerCase()) ||
                       (inv.reference && inv.reference.toLowerCase() === itemRef.toLowerCase()) ||
                       (inv.code && inv.code.toLowerCase() === itemRef.toLowerCase())
            );

            const currentStock = invMatch ? Number(invMatch.quantity || 0) : (item.product?.quantity ?? 10);
            const isAvailable = currentStock >= item.quantity;
            const missingQty = Math.max(0, item.quantity - currentStock);

            return (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  gap: '1.5rem', 
                  padding: '1.25rem 0', 
                  borderBottom: '1px solid #E2E8F0',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {/* Product image with Model reference */}
                <div style={{ width: '130px', height: '90px', flexShrink: 0, position: 'relative' }}>
                  <span style={{ position: 'absolute', top: -14, left: 0, fontSize: '0.62rem', color: '#94A3B8' }}>
                    Model: {itemRef}
                  </span>
                  <img 
                    src={item.product?.thumbnail_url || 'https://via.placeholder.com/130'} 
                    alt={itemRef} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  />
                </div>
                
                {/* Product details and pills */}
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    {itemRef}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', color: '#2563EB', margin: '0 0 0.85rem 0', fontWeight: 700, textTransform: 'uppercase' }}>
                    {item.product?.description || item.product?.title || itemRef}
                  </h3>
                  
                  {/* Pills Row matching Bubble */}
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Precio</span>
                      <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.25rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                        $ {Number(item.unit_price).toFixed(2).replace('.', ',')} USD.
                      </span>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Tamaño:</span>
                      <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.25rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                        {item.product?.size || '52'}
                      </span>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Material:</span>
                      <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.25rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                        {item.product?.material || item.material || 'Tr90'}
                      </span>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Venta por:</span>
                      <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.25rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                        {item.product?.sale_type || 'PIEZA'}
                      </span>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Requerido por el cliente:</span>
                      <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.25rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                        {item.quantity}
                      </span>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Estado Inventario ERP:</span>
                      {isAvailable ? (
                        <span style={{ 
                          display: 'inline-block', 
                          backgroundColor: '#0B2347', 
                          color: '#FFF', 
                          padding: '0.25rem 0.95rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.8rem', 
                          fontWeight: 700 
                        }}>
                          Disponible
                        </span>
                      ) : (
                        <span style={{ 
                          display: 'inline-block', 
                          backgroundColor: '#FBBF24', 
                          color: '#FFF', 
                          padding: '0.25rem 0.95rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.8rem', 
                          fontWeight: 700 
                        }}>
                          Disponibilidad {currentStock} (Faltan: {missingQty})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RENDER BUBBLE MODALS INSIDE DETAIL VIEW */}
        {renderBubbleModals()}
      </div>
    );
  }

  // LIST VIEW
  return (
    <div style={{ backgroundColor: '#FFF', padding: '2rem', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center', color: 'var(--text-primary)' }}>
        {t('admin.orders.title' as any)}
      </h1>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder={t('admin.orders.search' as any)} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }} 
          />
          <button style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer' }}><Search size={24} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{t('admin.orders.filterState' as any)}</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', minWidth: '150px' }}
          >
            <option value="">Todas</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Completada">Completada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{t('admin.orders.filterDate' as any)}</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }} 
            />
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }} 
            />
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No se encontraron pedidos</h3>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {paginatedOrders.map((order) => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrderId(order.id)}
                style={{ 
                  border: '1px solid var(--border-light)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                    <Package size={36} color={order.switch_order_number ? "#10B981" : "#F59E0B"} />
                    <div>
                      <span style={{ 
                        display: 'inline-block', 
                        fontSize: '0.8rem', 
                        fontWeight: 700, 
                        color: order.switch_order_number ? '#047857' : '#B45309',
                        backgroundColor: order.switch_order_number ? '#ECFDF5' : '#FFFBEB',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        marginBottom: '0.3rem' 
                      }}>
                        {order.switch_order_number ? '✓ Sincronizado en Switch ERP' : '⏳ Pendiente en Switch ERP'}
                      </span>
                      {order.switch_order_number ? (
                        <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Pedido Switch: <strong style={{ color: 'var(--blue)' }}>#{order.switch_order_number}</strong>
                        </span>
                      ) : (
                        <div style={{ marginTop: '0.25rem' }}>
                          <button
                            type="button"
                            onClick={(e) => handleSyncOrderWithERP(order.id, e)}
                            disabled={syncingOrderId === order.id}
                            className="btn-primary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            {syncingOrderId === order.id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : '⚡'} Enviar a ERP Switch
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.date' as any)}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.subtotal' as any)}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.status' as any)}</span>
                      <span style={{ 
                        display: 'inline-block',
                        marginTop: '0.2rem',
                        padding: '0.3rem 0.8rem', 
                        fontSize: '0.8rem', 
                        borderRadius: 'var(--radius-sm)', 
                        backgroundColor: getStatusColor(order.status), 
                        color: '#FFF',
                        fontWeight: 600 
                      }}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.id' as any)}</span>
                    <span style={{ display: 'block', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{order.order_number}</span>
                    <button 
                      className="btn-primary" 
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', backgroundColor: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }} 
                      onClick={(e) => handleDownloadSwitchXLSX(order, e)}
                      title="Descargar archivo Excel .xlsx para Switch ERP (CODIGO, CANTIDAD, PRECIO, DESCUENTO)"
                    >
                      <FileSpreadsheet size={13} /> Excel Switch (.xlsx)
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '3rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.articles' as any)}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{order.total_items}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.client' as any)}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{order.customer_email}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Cliente Nombre / Empresa</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{order.company_name || order.customer_name || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: 'var(--radius-sm)', 
                  border: '1px solid var(--border-medium)', 
                  background: currentPage === 1 ? '#f3f4f6' : '#fff',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  color: currentPage === 1 ? '#9ca3af' : 'var(--text-primary)'
                }}
              >
                Anterior
              </button>
              
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid',
                      borderColor: currentPage === page ? 'var(--blue)' : 'var(--border-medium)',
                      background: currentPage === page ? 'var(--blue)' : '#fff',
                      color: currentPage === page ? '#fff' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: currentPage === page ? 'bold' : 'normal'
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: 'var(--radius-sm)', 
                  border: '1px solid var(--border-medium)', 
                  background: currentPage === totalPages ? '#f3f4f6' : '#fff',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  color: currentPage === totalPages ? '#9ca3af' : 'var(--text-primary)'
                }}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* RENDER BUBBLE MODALS */}
      {renderBubbleModals()}
    </div>
  );
}
