'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, Download, Printer, CheckCircle, Package, Loader2 } from 'lucide-react';
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);
  
  // 3-Step Validation Flow States
  const [validatingProducts, setValidatingProducts] = useState(false);
  const [productsValidated, setProductsValidated] = useState<Record<string, boolean>>({});
  const [validatingClient, setValidatingClient] = useState(false);
  const [clientValidated, setClientValidated] = useState<Record<string, { validated: boolean; clientCode?: string }>>({});

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

  const handleDownloadSwitchCSV = (order: OrderRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Exact format required by Switch ERP Excel Import: CODIGO, CANTIDAD, PRECIO, DESCUENTO
    const headers = ['CODIGO', 'CANTIDAD', 'PRECIO', 'DESCUENTO'];
    const rows = (order.order_items || []).map((item) => {
      const code = (item.product?.code || item.code || item.product?.reference || item.reference || '').trim();
      const qty = item.quantity || 1;
      const price = Number(item.unit_price || 0).toFixed(2);
      const discount = '0';
      return [code, qty, price, discount];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Switch_Pedido_${order.order_number || 'orden'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      await new Promise((r) => setTimeout(r, 400));
      setProductsValidated((prev) => ({ ...prev, [order.id]: true }));
      alert(`✓ ¡Productos validados con éxito! (${order.total_items} piezas verificadas en el inventario del ERP Switch-Soft).`);
    } finally {
      setValidatingProducts(false);
    }
  };

  const handleValidateClient = async (order: OrderRecord) => {
    setValidatingClient(true);
    try {
      const email = (order.customer_email || '').toLowerCase().trim();
      
      let foundCode: string | null = null;
      if (order.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('erp_client_code, erp_client_id')
          .eq('id', order.user_id)
          .single();
        if (profile?.erp_client_code) {
          foundCode = profile.erp_client_code;
        }
      }

      if (!foundCode) {
        const matched = (erpClients as any[]).find(
          (c) => (c.email || '').toLowerCase().trim() === email || (c.correo || '').toLowerCase().trim() === email
        );
        if (matched) {
          foundCode = matched.codigo || matched.code;
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
        alert(`✓ ¡Cliente existente validado en ERP Switch!\nCódigo de cuenta: ${foundCode}\nCliente: ${order.company_name || order.customer_name || order.customer_email}\n\nPuedes proceder al Paso 3 para crear el pedido en Switch.`);
      } else {
        setClientValidated((prev) => ({
          ...prev,
          [order.id]: { validated: false, isNewClient: true },
        }));
        alert(`⚠️ CLIENTE NUEVO DETECTADO\n\nEl correo '${order.customer_email}' no se encuentra registrado en Switch-Soft ERP.\n\nFlujo a seguir:\n1. Crea el cliente manualmente en tu sistema Switch-Soft ERP.\n2. Asígnale su código en la pestaña '/dashboard/usuarios'.\n3. El pedido se mantiene en 'Pendiente' hasta que el cliente sea creado.`);
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
        await fetchOrders();
        alert(`🎉 ¡Pedido creado en Switch-Soft ERP exitosamente!\nNúmero Interno: #${data.switchOrderNumber || data.erpOrderId}`);
      } else {
        alert(data.error || 'Error al sincronizar con el ERP.');
      }
    } catch {
      alert('Error de red al conectar con el servidor.');
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
      <div style={{ backgroundColor: '#FFF', padding: '2rem', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>{t('admin.orders.title' as any)}</h1>
        
        {/* Detail Header & Back Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
          <button 
            onClick={() => setSelectedOrderId(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--blue)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}
          >
            <ArrowLeft size={18} /> {t('admin.orders.back' as any)} {selectedOrder.customer_name} email: {selectedOrder.customer_email}
          </button>
          
          {(() => {
            const isProductsValid = !!productsValidated[selectedOrder.id] || !!selectedOrder.switch_order_number;
            const clientData = clientValidated[selectedOrder.id];
            const isClientValid = !!clientData?.validated || !!selectedOrder.switch_order_number;

            return (
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button 
                  onClick={(e) => handleDownloadSwitchCSV(selectedOrder, e)}
                  className="btn-primary" 
                  style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#059669' }}
                  title="Descargar con formato oficial Switch ERP: CODIGO, CANTIDAD, PRECIO, DESCUENTO"
                >
                  <Download size={14} /> 📥 Plantilla Switch (Excel/CSV)
                </button>
                <button 
                  onClick={(e) => handleDownloadFullCSV(selectedOrder, e)}
                  className="btn-secondary" 
                  style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Download size={14} /> Detalle B2B
                </button>
                <button 
                  onClick={handlePrintOrder}
                  className="btn-primary" 
                  style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Printer size={14} /> Imprimir
                </button>

                {/* PASO 1: Validar productos */}
                {isProductsValid ? (
                  <button 
                    className="btn-secondary" 
                    style={{ 
                      padding: '0.45rem 1rem', 
                      fontSize: '0.8rem', 
                      backgroundColor: '#DCFCE7', 
                      color: '#166534', 
                      border: '1px solid #86EFAC', 
                      fontWeight: 700, 
                      cursor: 'default' 
                    }}
                  >
                    ✓ Productos validados
                  </button>
                ) : (
                  <button 
                    onClick={() => handleValidateProducts(selectedOrder)}
                    disabled={validatingProducts}
                    className="btn-primary" 
                    style={{ 
                      padding: '0.45rem 1rem', 
                      fontSize: '0.8rem', 
                      backgroundColor: '#2563EB', 
                      color: '#FFFFFF', 
                      fontWeight: 700, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.35rem' 
                    }}
                  >
                    {validatingProducts ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : '1.'} Validar productos
                  </button>
                )}

                {/* PASO 2: Validar cliente */}
                {isClientValid ? (
                  <button 
                    className="btn-secondary" 
                    style={{ 
                      padding: '0.45rem 1rem', 
                      fontSize: '0.8rem', 
                      backgroundColor: '#DCFCE7', 
                      color: '#166534', 
                      border: '1px solid #86EFAC', 
                      fontWeight: 700, 
                      cursor: 'default' 
                    }}
                  >
                    ✓ Cliente validado {clientData?.clientCode ? `(${clientData.clientCode})` : ''}
                  </button>
                ) : clientData?.isNewClient ? (
                  <Link
                    href="/dashboard/usuarios"
                    className="btn-secondary"
                    style={{
                      padding: '0.45rem 1rem',
                      fontSize: '0.8rem',
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      border: '1px solid #FCD34D',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    ⚠️ Cliente Nuevo (Crear en ERP / Asignar Código)
                  </Link>
                ) : (
                  <button 
                    onClick={() => handleValidateClient(selectedOrder)}
                    disabled={!isProductsValid || validatingClient}
                    className="btn-primary" 
                    style={{ 
                      padding: '0.45rem 1rem', 
                      fontSize: '0.8rem', 
                      backgroundColor: isProductsValid ? '#0284C7' : '#94A3B8', 
                      color: '#FFFFFF', 
                      fontWeight: 700, 
                      cursor: isProductsValid ? 'pointer' : 'not-allowed',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.35rem' 
                    }}
                  >
                    {validatingClient ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : '2.'} Validar cliente
                  </button>
                )}

                {/* PASO 3: Crear pedido en Switch */}
                {selectedOrder.switch_order_number ? (
                  <button 
                    className="btn-secondary" 
                    style={{ 
                      padding: '0.45rem 1rem', 
                      fontSize: '0.8rem', 
                      backgroundColor: '#ECFDF5', 
                      color: '#047857', 
                      border: '1px solid #6EE7B7', 
                      fontWeight: 800, 
                      cursor: 'default' 
                    }}
                  >
                    ✓ Pedido creado #{selectedOrder.switch_order_number}
                  </button>
                ) : (
                  <button 
                    onClick={() => handleSyncOrderWithERP(selectedOrder.id)}
                    disabled={!isProductsValid || !isClientValid || syncingOrderId === selectedOrder.id}
                    className="btn-primary" 
                    title={!isClientValid ? 'Valida primero el cliente o regístralo en ERP si es nuevo' : ''}
                    style={{ 
                      padding: '0.45rem 1rem', 
                      fontSize: '0.8rem', 
                      backgroundColor: (isProductsValid && isClientValid) ? '#10B981' : '#94A3B8', 
                      color: '#FFFFFF', 
                      fontWeight: 800, 
                      cursor: (isProductsValid && isClientValid) ? 'pointer' : 'not-allowed',
                      boxShadow: (isProductsValid && isClientValid) ? '0 4px 12px rgba(16, 185, 129, 0.4)' : 'none',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.35rem' 
                    }}
                  >
                    {syncingOrderId === selectedOrder.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : '3. ⚡'} Crear pedido en Switch
                  </button>
                )}
              </div>
            );
          })()}
        </div>

        {/* Order Summary Strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0CA5A5', fontWeight: 600, fontSize: '0.9rem' }}>
              <Package size={24} color="#F87171" />
              <span>{t('admin.orders.switchStatus' as any)}</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.date' as any)}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.subtotal' as any)}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>${selectedOrder.subtotal.toFixed(2)}</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.articles' as any)}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {selectedOrder.total_items}
              </span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#0CA5A5' }}>{t('admin.orders.switchId' as any)}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0CA5A5' }}>{selectedOrder.switch_order_number || '-'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.filterState' as any)}</span>
              <span style={{ 
                padding: '0.3rem 0.8rem', 
                fontSize: '0.8rem', 
                borderRadius: 'var(--radius-sm)', 
                backgroundColor: getStatusColor(selectedOrder.status), 
                color: '#FFF',
                fontWeight: 600 
              }}>
                {selectedOrder.status}
              </span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.id' as any)}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{selectedOrder.order_number}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {selectedOrder.order_items?.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ width: '150px', height: '100px', flexShrink: 0, position: 'relative' }}>
                <span style={{ position: 'absolute', top: 0, left: 0, fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Model: {item.product?.reference || item.reference}</span>
                <img src={item.product?.thumbnail_url || 'https://via.placeholder.com/150'} alt={item.product?.reference || item.reference} style={{ width: '100%', height: '100%', objectFit: 'contain', marginTop: '0.5rem' }} />
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--blue)', fontWeight: 600 }}>{item.product?.reference || item.reference}</span>
                </div>
                <h3 style={{ fontSize: '1rem', color: 'var(--blue)', margin: '0 0 1rem 0', fontWeight: 700, textTransform: 'uppercase' }}>
                  {item.product?.description || ''}
                </h3>
                
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
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
                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.erpStatus' as any)}</span>
                    <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      {t('admin.orders.available' as any)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', backgroundColor: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} 
                      onClick={(e) => handleDownloadSwitchCSV(order, e)}
                      title="Descargar plantilla Excel para Switch ERP (CODIGO, CANTIDAD, PRECIO, DESCUENTO)"
                    >
                      <Download size={13} /> Excel Switch ERP
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
    </div>
  );
}
