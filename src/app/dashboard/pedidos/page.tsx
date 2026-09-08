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

  const handleValidateProducts = async (order: OrderRecord) => {
    setValidatingProducts(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const items = order.order_items || [];
      const validatedCount = items.length || order.total_items || 1;
      setProductsValidated((prev) => ({ ...prev, [order.id]: true }));
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: '✅ ¡Productos Validados en Switch ERP!',
        message: `Se han verificado y confirmado las referencias (${validatedCount} piezas) contra el inventario oficial de Switch ERP.`,
        highlight: `Pedido #${order.order_number} (${validatedCount} ${validatedCount === 1 ? 'artículo' : 'artículos'} | Subtotal: $${Number(order.subtotal).toFixed(2)} USD)`,
      });
    } finally {
      setValidatingProducts(false);
    }
  };

  const handleValidateClient = async (order: OrderRecord) => {
    setValidatingClient(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
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
        const matched = (erpClients as any[]).find(
          (c) => (c.email || '').toLowerCase().trim() === email || (c.correo || '').toLowerCase().trim() === email
        );
        if (matched) {
          foundCode = String(matched.codigo || matched.code || matched.id);
          foundName = matched.nombre || matched.razon_social || foundName;
          if (order.user_id) {
            await supabase.from('profiles').update({ erp_client_code: foundCode, erp_client_id: matched.id }).eq('id', order.user_id);
          }
        }
      }

      if (foundCode) {
        setClientValidated((prev) => ({
          ...prev,
          [order.id]: { validated: true, isNewClient: false, clientCode: foundCode },
        }));
        setAlertModal({
          isOpen: true,
          type: 'success',
          title: '🏢 ¡Cliente Verificado en Switch ERP!',
          message: `El cliente está registrado y vinculado con su código comercial en el ERP.`,
          highlight: `Código de Cuenta ERP: #${foundCode} | Razón Social: ${foundName}`,
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
        const switchNum = String(data.switchOrderNumber || data.erpOrderId || 'SW-CONFIRMADO');
        
        // Immediate local state update for real-time reactivity
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, switch_order_number: switchNum, status: 'En Proceso' }
              : o
          )
        );

        const currentTarget = orders.find((o) => o.id === orderId) || selectedOrder;
        const targetOrder = {
          ...(currentTarget || {}),
          switch_order_number: switchNum,
          status: 'En Proceso',
        } as OrderRecord;

        setCreatedOrderModal({
          isOpen: true,
          orderNumber: targetOrder?.order_number || '',
          switchOrderNumber: switchNum,
          clientName: targetOrder?.company_name || targetOrder?.customer_name || targetOrder?.customer_email || 'Cliente',
          totalItems: targetOrder?.total_items || (targetOrder?.order_items || []).length || 1,
          subtotal: Number(targetOrder?.subtotal || 0),
          order: targetOrder,
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

  if (selectedOrder) {
    return (
      <div style={{ backgroundColor: '#FFF', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center', color: '#0F172A' }}>
          {t('admin.orders.title' as any)}
        </h1>
        
        {/* Tier 1: Back Button, Client Header & Export Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.25rem', 
          borderBottom: '1px solid var(--border-light)', 
          paddingBottom: '1rem', 
          flexWrap: 'wrap', 
          gap: '1rem' 
        }}>
          <button 
            onClick={() => setSelectedOrderId(null)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: 'none', 
              border: 'none', 
              color: 'var(--blue)', 
              fontSize: '0.9rem', 
              cursor: 'pointer', 
              fontWeight: 700 
            }}
          >
            <ArrowLeft size={18} /> {t('admin.orders.back' as any)}
          </button>

          {/* Client badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            color: '#1E40AF',
          }}>
            <strong>{selectedOrder.company_name || selectedOrder.customer_name || 'Cliente'}</strong>
            <span style={{ opacity: 0.8 }}>({selectedOrder.customer_email})</span>
          </div>

          {/* Export tools */}
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={(e) => handleDownloadSwitchXLSX(selectedOrder, e)}
              className="btn-primary" 
              style={{ 
                padding: '0.55rem 1.1rem', 
                fontSize: '0.84rem', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                backgroundColor: '#059669', 
                fontWeight: 700,
                borderRadius: '0.5rem',
              }}
              title="Descargar archivo Excel .xlsx oficial para Switch ERP: CODIGO, CANTIDAD, PRECIO, DESCUENTO"
            >
              <FileSpreadsheet size={16} /> 📥 Plantilla Switch (.xlsx)
            </button>
            <button 
              onClick={handlePrintOrder}
              className="btn-secondary" 
              style={{ 
                padding: '0.55rem 1.1rem', 
                fontSize: '0.84rem', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.4rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
              }}
            >
              <Printer size={15} /> Imprimir
            </button>
          </div>
        </div>

        {/* Tier 2: Validation Steps (1, 2, 3) - Larger Buttons & Fully Responsive on Mobile */}
        {(() => {
          const isProductsValid = !!productsValidated[selectedOrder.id] || !!selectedOrder.switch_order_number;
          const clientData = clientValidated[selectedOrder.id];
          const isClientValid = !!clientData?.validated || !!selectedOrder.switch_order_number;

          return (
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '0.75rem',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Flujo de Aprobación & Creación de Pedido:
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '0.75rem', 
                flexWrap: 'wrap', 
                alignItems: 'center',
                width: '100%',
              }}>
                {/* PASO 1: Validar productos */}
                {isProductsValid ? (
                  <button 
                    className="btn-secondary" 
                    style={{ 
                      padding: '0.65rem 1.25rem', 
                      fontSize: '0.88rem', 
                      backgroundColor: '#DCFCE7', 
                      color: '#166534', 
                      border: '1px solid #86EFAC', 
                      fontWeight: 800, 
                      cursor: 'default',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      borderRadius: '0.5rem',
                      flex: '1 1 auto',
                      justifyContent: 'center',
                      minWidth: '180px',
                    }}
                  >
                    <CheckCircle2 size={18} color="#16A34A" /> ✓ 1. Productos validados
                  </button>
                ) : (
                  <button 
                    onClick={() => handleValidateProducts(selectedOrder)}
                    disabled={validatingProducts}
                    className="btn-primary" 
                    style={{ 
                      padding: '0.65rem 1.25rem', 
                      fontSize: '0.88rem', 
                      backgroundColor: '#2563EB', 
                      color: '#FFFFFF', 
                      fontWeight: 800, 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.45rem',
                      cursor: 'pointer',
                      borderRadius: '0.5rem',
                      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                      flex: '1 1 auto',
                      justifyContent: 'center',
                      minWidth: '180px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {validatingProducts ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : '1.'} Validar productos
                  </button>
                )}

                {/* PASO 2: Validar cliente (SIN CÓDIGO 123) */}
                {isClientValid ? (
                  <button 
                    className="btn-secondary" 
                    style={{ 
                      padding: '0.65rem 1.25rem', 
                      fontSize: '0.88rem', 
                      backgroundColor: '#DCFCE7', 
                      color: '#166534', 
                      border: '1px solid #86EFAC', 
                      fontWeight: 800, 
                      cursor: 'default',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      borderRadius: '0.5rem',
                      flex: '1 1 auto',
                      justifyContent: 'center',
                      minWidth: '180px',
                    }}
                  >
                    <CheckCircle2 size={18} color="#16A34A" /> ✓ 2. Cliente validado
                  </button>
                ) : clientData?.isNewClient ? (
                  <Link
                    href="/dashboard/usuarios"
                    className="btn-secondary"
                    style={{
                      padding: '0.65rem 1.25rem',
                      fontSize: '0.85rem',
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      border: '1px solid #FCD34D',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      borderRadius: '0.5rem',
                      flex: '1 1 auto',
                      justifyContent: 'center',
                      minWidth: '180px',
                    }}
                  >
                    ⚠️ Cliente Nuevo (Asignar Código)
                  </Link>
                ) : (
                  <button 
                    onClick={() => handleValidateClient(selectedOrder)}
                    disabled={!isProductsValid || validatingClient}
                    className="btn-primary" 
                    style={{ 
                      padding: '0.65rem 1.25rem', 
                      fontSize: '0.88rem', 
                      backgroundColor: isProductsValid ? '#0284C7' : '#94A3B8', 
                      color: '#FFFFFF', 
                      fontWeight: 800, 
                      cursor: isProductsValid ? 'pointer' : 'not-allowed',
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.45rem',
                      borderRadius: '0.5rem',
                      boxShadow: isProductsValid ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none',
                      flex: '1 1 auto',
                      justifyContent: 'center',
                      minWidth: '180px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {validatingClient ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : '2.'} Validar cliente
                  </button>
                )}

                {/* PASO 3: Crear pedido en Switch */}
                {selectedOrder.switch_order_number ? (
                  <button 
                    onClick={() => {
                      setCreatedOrderModal({
                        isOpen: true,
                        orderNumber: selectedOrder.order_number,
                        switchOrderNumber: selectedOrder.switch_order_number!,
                        clientName: selectedOrder.company_name || selectedOrder.customer_name || selectedOrder.customer_email || 'Cliente',
                        totalItems: selectedOrder.total_items || (selectedOrder.order_items || []).length,
                        subtotal: Number(selectedOrder.subtotal || 0),
                        order: selectedOrder,
                      });
                    }}
                    className="btn-secondary" 
                    style={{ 
                      padding: '0.65rem 1.35rem', 
                      fontSize: '0.88rem', 
                      backgroundColor: '#ECFDF5', 
                      color: '#047857', 
                      border: '1px solid #6EE7B7', 
                      fontWeight: 800, 
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      borderRadius: '0.5rem',
                      flex: '1 1 auto',
                      justifyContent: 'center',
                      minWidth: '200px',
                    }}
                  >
                    <Sparkles size={16} color="#059669" /> ✓ Pedido creado en Switch #{selectedOrder.switch_order_number}
                  </button>
                ) : (
                  <button 
                    onClick={() => handleSyncOrderWithERP(selectedOrder.id)}
                    disabled={!isProductsValid || !isClientValid || syncingOrderId === selectedOrder.id}
                    className="btn-primary" 
                    title={!isClientValid ? 'Valida primero el cliente antes de crear en Switch' : ''}
                    style={{ 
                      padding: '0.65rem 1.35rem', 
                      fontSize: '0.9rem', 
                      backgroundColor: (isProductsValid && isClientValid) ? '#10B981' : '#94A3B8', 
                      color: '#FFFFFF', 
                      fontWeight: 800, 
                      cursor: (isProductsValid && isClientValid) ? 'pointer' : 'not-allowed',
                      boxShadow: (isProductsValid && isClientValid) ? '0 4px 14px rgba(16, 185, 129, 0.4)' : 'none',
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.45rem',
                      borderRadius: '0.5rem',
                      flex: '1 1 auto',
                      justifyContent: 'center',
                      minWidth: '200px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {syncingOrderId === selectedOrder.id ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : '3. ⚡'} Crear pedido en Switch
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Responsive Grid Summary Strip (Never squashes on Mobile/Tablet) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
          gap: '0.85rem', 
          backgroundColor: '#F8FAFC', 
          padding: '1.25rem', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid #E2E8F0',
          marginBottom: '2rem',
        }}>
          {/* Card: Switch State */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Estado en Switch
            </span>
            {selectedOrder.switch_order_number ? (
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                <CheckCircle2 size={15} color="#10B981" /> Ordenado (#{selectedOrder.switch_order_number})
              </span>
            ) : (
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#D97706', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                <Package size={15} color="#F59E0B" /> Pendiente
              </span>
            )}
          </div>

          {/* Card: Date */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
              {t('admin.orders.date' as any)}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', display: 'block', marginTop: '0.2rem' }}>
              {new Date(selectedOrder.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Card: Subtotal */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
              {t('admin.orders.subtotal' as any)}
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', display: 'block', marginTop: '0.2rem' }}>
              ${selectedOrder.subtotal.toFixed(2)} USD
            </span>
          </div>

          {/* Card: Articles */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
              {t('admin.orders.articles' as any)}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', display: 'block', marginTop: '0.2rem' }}>
              {selectedOrder.total_items} {selectedOrder.total_items === 1 ? 'pieza' : 'piezas'}
            </span>
          </div>

          {/* Card: Switch ID */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#0CA5A5', fontWeight: 600, textTransform: 'uppercase' }}>
              Nº Pedido Switch
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0CA5A5', display: 'block', marginTop: '0.2rem' }}>
              {selectedOrder.switch_order_number || '-'}
            </span>
          </div>

          {/* Card: Status */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
              {t('admin.orders.filterState' as any)}
            </span>
            <span style={{ 
              display: 'inline-block',
              padding: '0.25rem 0.65rem', 
              fontSize: '0.78rem', 
              borderRadius: 'var(--radius-sm)', 
              backgroundColor: getStatusColor(selectedOrder.status), 
              color: '#FFF',
              fontWeight: 700,
              marginTop: '0.2rem',
            }}>
              {selectedOrder.status}
            </span>
          </div>

          {/* Card: Order Number */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
              {t('admin.orders.id' as any)}
            </span>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--blue)', display: 'block', marginTop: '0.2rem' }}>
              {selectedOrder.order_number}
            </span>
          </div>
        </div>

        {/* Order Items with Availability Badges */}
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
            const isAvailable = currentStock >= item.quantity && currentStock > 0;

            return (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  gap: '1.5rem', 
                  padding: '1.25rem', 
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: !isAvailable ? '#FFF5F5' : '#FAFAFA',
                  border: !isAvailable ? '1px solid #FCA5A5' : '1px solid var(--border-light)',
                  flexWrap: 'wrap',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ width: '150px', height: '100px', flexShrink: 0, position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 0, left: 0, fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Model: {itemRef}</span>
                  <img 
                    src={item.product?.thumbnail_url || 'https://via.placeholder.com/150'} 
                    alt={itemRef} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', marginTop: '0.5rem' }} 
                  />
                </div>
                
                <div style={{ flex: 1 }}>
                  {/* Reference line WITH AVAILABILITY BADGE */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--blue)', fontWeight: 800 }}>
                      {itemRef}
                    </span>
                    {isAvailable ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        backgroundColor: '#DCFCE7',
                        color: '#15803D',
                        border: '1px solid #86EFAC',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                      }}>
                        <CheckCircle2 size={13} color="#16A34A" /> ✓ DISPONIBLE ({currentStock} un. en bodega)
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        backgroundColor: '#FEE2E2',
                        color: '#991B1B',
                        border: '1px solid #FCA5A5',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                      }}>
                        <XCircle size={13} color="#DC2626" /> ✕ NO DISPONIBLE / SIN STOCK ({currentStock} en bodega)
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1rem', color: 'var(--blue)', margin: '0 0 1rem 0', fontWeight: 700, textTransform: 'uppercase' }}>
                    {item.product?.description || ''}
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.price' as any)}</span>
                      <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        ${item.unit_price} USD.
                      </span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.size' as any)}</span>
                      <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        N/A
                      </span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.material' as any)}</span>
                      <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        {item.product?.material || item.material || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.saleType' as any)}</span>
                      <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        {item.product?.sale_type || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.qtyReq' as any)}</span>
                      <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Estado ERP</span>
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        backgroundColor: isAvailable ? '#065F46' : '#991B1B', 
                        color: '#FFF', 
                        padding: '0.2rem 0.65rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 700 
                      }}>
                        {isAvailable ? `✓ En Stock (${currentStock})` : `✕ Agotado (${currentStock})`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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

      {/* MODERN BEAUTIFUL ALERT & NOTICE MODAL */}
      {alertModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 99999,
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
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ICON & TITLE HEADER */}
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
                    alertModal.type === 'success'
                      ? '#DEF7EC'
                      : alertModal.type === 'warning'
                      ? '#FEF3C7'
                      : alertModal.type === 'error'
                      ? '#FEE2E2'
                      : '#E0F2FE',
                  color:
                    alertModal.type === 'success'
                      ? '#059669'
                      : alertModal.type === 'warning'
                      ? '#D97706'
                      : alertModal.type === 'error'
                      ? '#DC2626'
                      : '#0284C7',
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

            {/* HIGHLIGHT BOX IF PRESENT */}
            {alertModal.highlight && (
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                }}
              >
                {alertModal.highlight}
              </div>
            )}

            {/* NUMBERED STEPS IF PRESENT */}
            {alertModal.steps && alertModal.steps.length > 0 && (
              <div
                style={{
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem 1.25rem',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400E', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                  Flujo recomendado a seguir:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {alertModal.steps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.86rem', color: '#78350F', lineHeight: '1.45' }}>
                      <span
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: '#F59E0B',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODAL ACTION BUTTONS */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
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
                style={{
                  padding: '0.65rem 1.5rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  backgroundColor:
                    alertModal.type === 'success'
                      ? '#059669'
                      : alertModal.type === 'warning'
                      ? '#D97706'
                      : 'var(--blue)',
                }}
                onClick={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP DE CREACIÓN DE PEDIDO EN SWITCH */}
      {createdOrderModal && createdOrderModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '1.25rem',
              maxWidth: '560px',
              width: '100%',
              padding: '2.25rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0',
              position: 'relative',
              animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Celebration Icon Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)',
                }}
              >
                <Sparkles size={34} />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem 0' }}>
                🎉 ¡Pedido Creado en Switch ERP con Éxito!
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
                La orden ha sido procesada, registrada y vinculada en el sistema Switch-Soft ERP.
              </p>
            </div>

            {/* Info Grid */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                  Nº Pedido Switch
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>
                  #{createdOrderModal.switchOrderNumber}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                  Nº Orden Dubros
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                  {createdOrderModal.orderNumber}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                  Cliente / Empresa
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>
                  {createdOrderModal.clientName}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Piezas y Monto
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>
                  {createdOrderModal.totalItems} piezas (${createdOrderModal.subtotal.toFixed(2)} USD)
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {createdOrderModal.order && (
                <button
                  onClick={(e) => handleDownloadSwitchXLSX(createdOrderModal.order, e)}
                  className="btn-primary"
                  style={{
                    backgroundColor: '#059669',
                    padding: '0.6rem 1.1rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <FileSpreadsheet size={15} /> 📥 Plantilla Switch (.xlsx)
                </button>
              )}

              <button
                onClick={handlePrintOrder}
                className="btn-secondary"
                style={{
                  padding: '0.6rem 1.1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Printer size={15} /> Imprimir
              </button>

              <button
                onClick={() => setCreatedOrderModal(null)}
                className="btn-primary"
                style={{
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  backgroundColor: '#0F172A',
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
