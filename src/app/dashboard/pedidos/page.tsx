'use client';

import React, { useState } from 'react';
import { Search, ArrowLeft, Download, Printer, CheckCircle, Package } from 'lucide-react';
import { MOCK_ORDERS, Order } from '@/data/mock';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminOrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { t } = useLanguage();

  const selectedOrder = MOCK_ORDERS.find((o) => o.id === selectedOrderId);

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
            <ArrowLeft size={18} /> {t('admin.orders.back' as any)} {selectedOrder.clientName} email: {selectedOrder.clientEmail}
          </button>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}><Download size={14} style={{ display: 'inline', marginRight: '0.3rem' }}/> {t('admin.orders.csv' as any)}</button>
            <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}><Printer size={14} style={{ display: 'inline', marginRight: '0.3rem' }}/> {t('admin.orders.print' as any)}</button>
            <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>{t('admin.orders.validate' as any)}</button>
            <button className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', backgroundColor: '#E0E7FF', color: 'var(--blue)', border: 'none' }}>{t('admin.orders.clientValidated' as any)}</button>
            <button className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', backgroundColor: '#E0E7FF', color: 'var(--blue)', border: 'none' }}>{t('admin.orders.orderCreated' as any)}</button>
          </div>
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
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedOrder.date}</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.subtotal' as any)}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>${selectedOrder.subtotal.toFixed(2)}</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.articles' as any)}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {selectedOrder.items.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#0CA5A5' }}>{t('admin.orders.switchId' as any)}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0CA5A5' }}>{selectedOrder.switchOrderNumber}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.filterState' as any)}</span>
              <select style={{ padding: '0.3rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}>
                <option>{t('admin.orders.choose' as any)}</option>
              </select>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.id' as any)}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{selectedOrder.orderNumber}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {selectedOrder.items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ width: '150px', height: '100px', flexShrink: 0, position: 'relative' }}>
                <span style={{ position: 'absolute', top: 0, left: 0, fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Model: {item.product.reference}</span>
                <img src={item.product.thumbnailUrl} alt={item.product.reference} style={{ width: '100%', height: '100%', objectFit: 'contain', marginTop: '0.5rem' }} />
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--blue)', fontWeight: 600 }}>{item.product.reference}</span>
                </div>
                <h3 style={{ fontSize: '1rem', color: 'var(--blue)', margin: '0 0 1rem 0', fontWeight: 700, textTransform: 'uppercase' }}>
                  {item.product.name}
                </h3>
                
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.price' as any)}</span>
                    <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      ${item.product.price} USD.
                    </span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.size' as any)}</span>
                    <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      {item.product.eyeSize}
                    </span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.material' as any)}</span>
                    <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      {item.product.material}
                    </span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.saleType' as any)}</span>
                    <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      {item.product.saleType}
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
            style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }} 
          />
          <button style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer' }}><Search size={24} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{t('admin.orders.filterState' as any)}</span>
          <select style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', minWidth: '150px' }}>
            <option>{t('admin.orders.choose' as any)}</option>
          </select>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{t('admin.orders.filterDate' as any)}</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="text" defaultValue="7/01/2026" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', width: '100px' }} />
            <input type="text" defaultValue="7/31/2026" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', width: '100px' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {MOCK_ORDERS.map((order) => (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Package size={40} color="#0CA5A5" />
                <div>
                  <span style={{ display: 'block', color: '#0CA5A5', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                    {t('admin.orders.switchStatus' as any)}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {t('admin.orders.switchId' as any)} <br/><strong style={{ color: '#0CA5A5' }}>{order.switchOrderNumber}</strong>
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.date' as any)}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{order.date}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.subtotal' as any)}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>${order.subtotal.toFixed(2)}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.status' as any)}</span>
                  <select defaultValue={order.status} style={{ padding: '0.3rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', marginTop: '0.2rem' }} onClick={(e) => e.stopPropagation()}>
                    <option>Completada</option>
                    <option>Pendiente</option>
                    <option>Cancelada</option>
                  </select>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.id' as any)}</span>
                <span style={{ display: 'block', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{order.orderNumber}</span>
                <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={(e) => e.stopPropagation()}>{t('admin.orders.csv' as any)}</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '3rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.articles' as any)}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{order.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.client' as any)}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{order.clientEmail}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('admin.orders.clientCode' as any)}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{order.clientCode}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
