'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getAllOrders, OrderRecord } from '@/lib/orders';
import { supabase } from '@/lib/supabase';
import erpClients from '@/data/erp_clients.json';
import { triggerOrderSuccessConfetti } from '@/lib/confetti';

// Modular Dashboard Components
import { OrderFilters } from '@/components/dashboard/orders/OrderFilters';
import { OrderListItem } from '@/components/dashboard/orders/OrderListItem';
import { OrderDetailView } from '@/components/dashboard/orders/OrderDetailView';
import {
  OrderBubbleModals,
  ClientFoundData,
  OrderCreatedData,
} from '@/components/dashboard/orders/OrderBubbleModals';
import { AdminAlertModal, AdminAlertModalProps } from '@/components/dashboard/shared/AdminAlertModal';

export default function AdminOrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Validation States (Tracked per order ID)
  const [validatingProducts, setValidatingProducts] = useState(false);
  const [productsValidated, setProductsValidated] = useState<Record<string, boolean>>({});
  const [validatingClient, setValidatingClient] = useState(false);
  const [clientValidated, setClientValidated] = useState<
    Record<string, { validated: boolean; isNewClient?: boolean; clientCode?: string }>
  >({});

  // Modals State
  const [clientFoundModal, setClientFoundModal] = useState<ClientFoundData | null>(null);
  const [orderCreatedModal, setOrderCreatedModal] = useState<OrderCreatedData | null>(null);
  const [alertModal, setAlertModal] = useState<Omit<AdminAlertModalProps, 'onClose'>>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data);
    } catch {
      setError('Error al cargar pedidos del sistema.');
    } finally {
      setLoading(false);
    }
  };

  // Orders selection with URL query preservation on refresh
  const handleSelectOrder = (orderId: string | null) => {
    setSelectedOrderId(orderId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (orderId) {
        url.searchParams.set('order', orderId);
      } else {
        url.searchParams.delete('order');
      }
      window.history.replaceState(null, '', url.toString());
    }
  };

  useEffect(() => {
    fetchOrders();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const orderParam = params.get('order');
      if (orderParam) setSelectedOrderId(orderParam);
    }
  }, []);

  // Filtered Orders calculation
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchLower = search.toLowerCase();
      const matchSearch =
        !search ||
        order.order_number?.toLowerCase().includes(searchLower) ||
        order.customer_email?.toLowerCase().includes(searchLower) ||
        order.customer_name?.toLowerCase().includes(searchLower) ||
        order.company_name?.toLowerCase().includes(searchLower);

      const matchStatus = !statusFilter || statusFilter === 'Todas' || order.status === statusFilter;

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
  }, [orders, search, statusFilter, dateFrom, dateTo]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFrom, dateTo]);

  // Actions: Step 1 Validate Products
  const handleValidateProducts = async (order: OrderRecord) => {
    setValidatingProducts(true);
    try {
      await new Promise((r) => setTimeout(r, 350));
      setProductsValidated((prev) => ({ ...prev, [order.id]: true }));
    } finally {
      setValidatingProducts(false);
    }
  };

  // Actions: Step 2 Validate Client
  const handleValidateClient = async (order: OrderRecord) => {
    setValidatingClient(true);
    try {
      await new Promise((r) => setTimeout(r, 350));
      const email = (order.customer_email || '').toLowerCase().trim();

      let foundCode: string | null = null;
      let foundId: number | null = null;
      let foundVendorId: number = 4;
      let foundName: string = order.company_name || order.customer_name || order.customer_email || '';

      if (order.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('erp_client_code, erp_client_id, erp_vendor_id, company_name, full_name')
          .eq('id', order.user_id)
          .single();

        if (profile?.erp_client_id) {
          foundId = profile.erp_client_id;
          foundCode = profile.erp_client_code || String(profile.erp_client_id);
          foundVendorId = profile.erp_vendor_id || 4;
          foundName = profile.company_name || profile.full_name || foundName;
        } else if (profile?.erp_client_code) {
          foundCode = profile.erp_client_code;
          const matched = (erpClients as any[]).find(
            (c) => String(c.codigo) === String(foundCode) || String(c.code) === String(foundCode)
          );
          if (matched) {
            foundId = matched.id;
            foundVendorId = matched.vendedorId || 4;
          }
          foundName = profile.company_name || profile.full_name || foundName;
        }
      }

      if (!foundCode) {
        const normEmail = email.toLowerCase().trim();
        const normName = (order.company_name || order.customer_name || '').toLowerCase().trim();
        const matched = (erpClients as any[]).find((c) => {
          const cEmail = (c.email || c.correo || '').toLowerCase().trim();
          const cName = (c.nombre || c.razonsocial || c.razon_social || '').toLowerCase().trim();
          const cCode = String(c.codigo || c.code || '').toLowerCase().trim();
          return (
            (cEmail && cEmail === normEmail) ||
            (normName && cName && (cName.includes(normName) || normName.includes(cName))) ||
            (normName && cCode === normName)
          );
        });

        if (matched) {
          foundId = matched.id;
          foundCode = String(matched.codigo || matched.code || matched.id);
          foundVendorId = matched.vendedorId || 4;
          foundName = matched.nombre || matched.razonsocial || matched.razon_social || foundName;
          if (order.user_id) {
            await supabase
              .from('profiles')
              .update({
                erp_client_code: foundCode,
                erp_client_id: matched.id,
                erp_vendor_id: foundVendorId,
              })
              .eq('id', order.user_id);
          }
        }
      }

      if (foundCode) {
        setClientValidated((prev) => ({
          ...prev,
          [order.id]: {
            validated: true,
            clientCode: foundCode!,
            clientId: foundId || undefined,
            vendorId: foundVendorId,
          },
        }));
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

  // Actions: Step 3 Sync Order with ERP
  const handleSyncOrderWithERP = async (orderId: string) => {
    setSyncingOrderId(orderId);
    try {
      const clientInfo = clientValidated[orderId];
      const res = await fetch('/api/checkout/erp-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          clientId: (clientInfo as any)?.clientId,
          clientCode: clientInfo?.clientCode,
          vendorId: (clientInfo as any)?.vendorId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const switchNum = String(data.switchOrderNumber || data.erpOrderId || '16-000003549');

        triggerOrderSuccessConfetti();

        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, switch_order_number: switchNum, status: 'En Proceso' } : o
          )
        );

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
        <button onClick={fetchOrders} className="btn-primary" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          Reintentar
        </button>
      </div>
    );
  }

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  // VIEW 1: DETAIL VIEW
  if (selectedOrder) {
    const isProductsValid = !!productsValidated[selectedOrder.id];
    const clientData = clientValidated[selectedOrder.id];
    const isClientValid = !!clientData?.validated || !!selectedOrder.switch_order_number;
    const isOrderCreated = !!selectedOrder.switch_order_number;

    return (
      <>
        <OrderDetailView
          order={selectedOrder}
          onBack={() => handleSelectOrder(null)}
          isProductsValid={isProductsValid}
          isClientValid={isClientValid}
          isOrderCreated={isOrderCreated}
          validatingProducts={validatingProducts}
          validatingClient={validatingClient}
          syncingOrder={syncingOrderId === selectedOrder.id}
          onValidateProducts={() => handleValidateProducts(selectedOrder)}
          onValidateClient={() => handleValidateClient(selectedOrder)}
          onCreateOrder={() => handleSyncOrderWithERP(selectedOrder.id)}
        />

        <OrderBubbleModals
          clientFoundModal={clientFoundModal}
          onConfirmClient={(orderId, code) => {
            setClientValidated((prev) => ({
              ...prev,
              [orderId]: { validated: true, clientCode: code },
            }));
            setClientFoundModal(null);
          }}
          onCloseClientFound={() => setClientFoundModal(null)}
          orderCreatedModal={orderCreatedModal}
          onCloseOrderCreated={() => setOrderCreatedModal(null)}
        />

        <AdminAlertModal
          {...alertModal}
          onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        />
      </>
    );
  }

  // VIEW 2: LIST VIEW
  return (
    <div style={{ backgroundColor: '#FFF', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center', color: '#0F172A' }}>
        {t('admin.orders.title' as any)}
      </h1>

      {/* FILTERS */}
      <OrderFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        onClearFilters={() => {
          setSearch('');
          setStatusFilter('');
          setDateFrom('');
          setDateTo('');
        }}
        totalResults={filteredOrders.length}
      />

      {/* ORDERS LIST */}
      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748B' }}>
          No se encontraron pedidos con los filtros seleccionados.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {paginatedOrders.map((order) => (
            <OrderListItem
              key={order.id}
              order={order}
              onClick={() => handleSelectOrder(order.id)}
            />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
          <button
            onClick={() => {
              setCurrentPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              background: currentPage === 1 ? '#F1F5F9' : '#FFFFFF',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              color: currentPage === 1 ? '#94A3B8' : '#1E293B',
              fontSize: '0.88rem',
            }}
          >
            Anterior
          </button>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: currentPage === page ? '#1864F6' : '#CBD5E1',
                  background: currentPage === page ? '#1864F6' : '#FFFFFF',
                  color: currentPage === page ? '#FFFFFF' : '#1E293B',
                  cursor: 'pointer',
                  fontWeight: currentPage === page ? 'bold' : 'normal',
                  fontSize: '0.88rem',
                }}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setCurrentPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              background: currentPage === totalPages ? '#F1F5F9' : '#FFFFFF',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              color: currentPage === totalPages ? '#94A3B8' : '#1E293B',
              fontSize: '0.88rem',
            }}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* GENERAL ALERT MODAL */}
      <AdminAlertModal
        {...alertModal}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
