'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Tag, Users, PackageCheck, Image as ImageIcon, ArrowUpRight, TrendingUp, 
  Loader2, Warehouse, Search, Download, AlertTriangle, CheckCircle2, 
  Filter, FileSpreadsheet, Layers, HelpCircle, Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import erpInventory from '@/data/erp_inventory.json';
import bubbleUsers from '@/data/bubble_users.json';
import productMetaMap from '@/data/product_meta_map.json';

interface AuditProduct {
  erp_id?: number | string;
  reference: string;
  code: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  material: string;
  gender: string;
  eyeSize: string;
  flex: string;
  saleType: string;
  hasLargeImage: boolean;
  thumbnail_url: string;
  large_image_url: string;
  missingFields: string[];
}

export default function DashboardHomePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    products: erpInventory.length,
    brands: 151,
    totalStock: 455550,
    users: bubbleUsers.length,
    orders: 0,
    withImage: 0,
    withoutImage: 0,
  });

  // Audit Products List
  const [auditList, setAuditList] = useState<AuditProduct[]>([]);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Missing Fields Checkboxes
  const [filterMissing, setFilterMissing] = useState({
    noImage: false,
    noSaleType: false,
    noEyeSize: false,
    noGender: false,
    noFlex: false,
    noMaterial: false,
    noBrand: false,
    noCategory: false,
  });

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    (erpInventory as any[]).forEach((item) => {
      if (item.category) set.add(item.category.trim());
    });
    return Array.from(set).sort();
  }, []);

  useEffect(() => {
    async function loadDashboardStatsAndAudit() {
      setLoading(true);
      try {
        const metaMap = productMetaMap as Record<string, { b?: string; c?: string; q?: number; p?: number; g?: string; m?: string; f?: string; s?: string }>;
        const erpProductsCount = erpInventory.length;
        const uniqueBrands = new Set((erpInventory as any[]).map((e) => e.brand).filter(Boolean)).size;
        const totalStockUnits = (erpInventory as any[]).reduce((sum, item) => sum + (item.quantity || 0), 0);

        let withImageCount = 0;
        let withoutImageCount = 0;

        const processed: AuditProduct[] = (erpInventory as any[]).map((item) => {
          const ref = (item.reference || item.code || '').trim();
          const meta = metaMap[ref] || {};

          const brand = (meta.b || item.brand || '').trim();
          const category = (meta.c || item.category || '').trim();
          const material = (meta.m || item.material || '').trim();
          const gender = (meta.g || item.gender || '').trim();
          const eyeSize = (meta.s || item.eye_size || item.talla_ocular || '').trim();
          const flex = (meta.f || item.flex || '').trim();
          const saleType = (item.sale_type || item.tipo_venta || '').trim();

          const hasLargeImage = Boolean(
            item.large_image_url && 
            !item.large_image_url.includes('placeholder') &&
            !item.large_image_url.includes('no-image')
          );

          if (hasLargeImage) withImageCount++;
          else withoutImageCount++;

          const missing: string[] = [];
          if (!hasLargeImage) missing.push('Foto Grande');
          if (!gender || gender === 'all') missing.push('Género');
          if (!material) missing.push('Material');
          if (!flex) missing.push('Flex');
          if (!eyeSize) missing.push('Talla Ocular');
          if (!saleType) missing.push('Tipo Venta');
          if (!brand || brand === 'SM' || brand === 'GENERAL') missing.push('Marca');
          if (!category) missing.push('Categoría');

          return {
            erp_id: item.erp_id,
            reference: ref,
            code: item.code || ref,
            description: item.description || '',
            price: Number(item.price || 0),
            brand,
            category,
            material,
            gender,
            eyeSize,
            flex,
            saleType,
            hasLargeImage,
            thumbnail_url: item.thumbnail_url || '',
            large_image_url: item.large_image_url || '',
            missingFields: missing,
          };
        });

        const [
          { count: userCount },
          { count: orderCount },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
        ]);

        const finalUsers = Math.max(userCount || 0, bubbleUsers.length);

        setStats({
          products: erpProductsCount,
          brands: uniqueBrands || 151,
          totalStock: totalStockUnits || 455550,
          users: finalUsers,
          orders: orderCount || 0,
          withImage: withImageCount,
          withoutImage: withoutImageCount,
        });

        setAuditList(processed);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardStatsAndAudit();
  }, []);

  // Filter products based on search, category, and missing fields
  const filteredProducts = useMemo(() => {
    return auditList.filter((p) => {
      // Search
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const matchesSearch = 
          p.reference.toLowerCase().includes(s) || 
          p.code.toLowerCase().includes(s) || 
          p.description.toLowerCase().includes(s) ||
          p.brand.toLowerCase().includes(s);
        if (!matchesSearch) return false;
      }

      // Category
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Missing Checkboxes
      if (filterMissing.noImage && p.hasLargeImage) return false;
      if (filterMissing.noSaleType && p.saleType) return false;
      if (filterMissing.noEyeSize && p.eyeSize) return false;
      if (filterMissing.noGender && (p.gender && p.gender !== 'all')) return false;
      if (filterMissing.noFlex && p.flex) return false;
      if (filterMissing.noMaterial && p.material) return false;
      if (filterMissing.noBrand && (p.brand && p.brand !== 'SM' && p.brand !== 'GENERAL')) return false;
      if (filterMissing.noCategory && p.category) return false;

      return true;
    });
  }, [auditList, searchTerm, selectedCategory, filterMissing]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handleCheckboxChange = (key: keyof typeof filterMissing) => {
    setFilterMissing((prev) => ({ ...prev, [key]: !prev[key] }));
    setCurrentPage(1);
  };

  const handleDownloadCSV = () => {
    const headers = [
      'Referencia', 'Codigo', 'Marca', 'Categoria', 'Material', 
      'Genero', 'Flex', 'Talla Ocular', 'Tipo Venta', 'Precio', 
      'Tiene Imagen Grande', 'Campos Faltantes', 'Descripcion'
    ];

    const rows = filteredProducts.map((p) => [
      `"${p.reference}"`,
      `"${p.code}"`,
      `"${p.brand}"`,
      `"${p.category}"`,
      `"${p.material}"`,
      `"${p.gender}"`,
      `"${p.flex}"`,
      `"${p.eyeSize}"`,
      `"${p.saleType}"`,
      `"${p.price.toFixed(2)}"`,
      `"${p.hasLargeImage ? 'SI' : 'NO'}"`,
      `"${p.missingFields.join(', ')}"`,
      `"${p.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Auditoria_Articulos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>📊 Inicio Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Auditoría de inventario, detección de campos faltantes y sincronización de catálogo.
          </p>
        </div>

        <button
          onClick={handleDownloadCSV}
          className="btn-primary"
          style={{
            backgroundColor: '#059669',
            padding: '0.6rem 1.25rem',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 700,
          }}
        >
          <Download size={16} /> Descargar CSV ({filteredProducts.length.toLocaleString()})
        </button>
      </div>

      {/* KPI TOP METRICS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Card 1: Total Modelos */}
        <div className="card" style={{ borderLeft: '4px solid var(--blue)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total de Modelos</span>
            <Tag size={18} color="var(--blue)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {loading ? <Loader2 className="animate-spin" size={24} /> : stats.products.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Artículos en base de datos</span>
        </div>

        {/* Card 2: Total Marcas */}
        <div className="card" style={{ borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total de Marcas</span>
            <Layers size={18} color="#8B5CF6" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {loading ? <Loader2 className="animate-spin" size={24} /> : stats.brands.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Marcas registradas</span>
        </div>

        {/* Card 3: Con Imagen Grande */}
        <div className="card" style={{ borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Con Imagen S3</span>
            <ImageIcon size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>
            {loading ? <Loader2 className="animate-spin" size={24} /> : stats.withImage.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>Fotografía lista en AWS S3</span>
        </div>

        {/* Card 4: Sin Imagen / Faltantes */}
        <div className="card" style={{ borderLeft: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#B91C1C', fontWeight: 600 }}>Sin Imagen Grande</span>
            <AlertTriangle size={18} color="#EF4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#DC2626' }}>
            {loading ? <Loader2 className="animate-spin" size={24} /> : stats.withoutImage.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>Requieren carga de foto</span>
        </div>
      </div>

      {/* INTERACTIVE PRODUCT AUDITOR SECTION */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
            Auditoría de Productos & Campos Faltantes
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            Identifica rápidamente qué armazones necesitan foto, género, material, flex o talla ocular y expórtalos en CSV.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Buscar referencia o código de producto..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '0.85rem 1rem 0.85rem 2.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-primary)',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
        </div>

        {/* CATEGORY SELECTOR & ACTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Escoger categoría:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-primary)',
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">Todas las categorías ({auditList.length.toLocaleString()} artículos)</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setFilterMissing({
                  noImage: false,
                  noSaleType: false,
                  noEyeSize: false,
                  noGender: false,
                  noFlex: false,
                  noMaterial: false,
                  noBrand: false,
                  noCategory: false,
                });
                setCurrentPage(1);
              }}
              className="btn-secondary"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
            >
              Limpiar Filtros
            </button>
            <button
              onClick={handleDownloadCSV}
              className="btn-primary"
              style={{
                backgroundColor: '#059669',
                padding: '0.65rem 1.25rem',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 700,
              }}
            >
              <Download size={15} /> Descargar CSV
            </button>
          </div>
        </div>

        {/* MISSING FIELDS CHECKBOXES (BUSCAR VACÍOS) */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
            Filtrar por datos vacíos o faltantes:
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, color: filterMissing.noImage ? '#DC2626' : 'var(--text-primary)' }}>
              <input
                type="checkbox"
                checked={filterMissing.noImage}
                onChange={() => handleCheckboxChange('noImage')}
              />
              🖼️ Sin foto grande
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={filterMissing.noGender}
                onChange={() => handleCheckboxChange('noGender')}
              />
              👤 Género
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={filterMissing.noFlex}
                onChange={() => handleCheckboxChange('noFlex')}
              />
              ⚡ Flex
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={filterMissing.noMaterial}
                onChange={() => handleCheckboxChange('noMaterial')}
              />
              🧱 Material
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={filterMissing.noEyeSize}
                onChange={() => handleCheckboxChange('noEyeSize')}
              />
              📐 Talla ocular
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={filterMissing.noBrand}
                onChange={() => handleCheckboxChange('noBrand')}
              />
              🏷️ Marca
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={filterMissing.noCategory}
                onChange={() => handleCheckboxChange('noCategory')}
              />
              📂 Categoría
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={filterMissing.noSaleType}
                onChange={() => handleCheckboxChange('noSaleType')}
              />
              📦 Tipo de venta
            </label>
          </div>
        </div>

        {/* AUDIT PRODUCTS TABLE */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Referencia / Alerta</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Marca</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Material</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Precio</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Descripción</th>
                <th style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Faltantes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                    <Loader2 size={30} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                    Analizando artículos...
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                    ✓ No se encontraron artículos con los criterios de filtro seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p, idx) => (
                  <tr
                    key={p.reference + idx}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      backgroundColor: !p.hasLargeImage ? '#FFF5F5' : 'transparent',
                    }}
                  >
                    {/* Referencia + Aviso */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 800, color: !p.hasLargeImage ? '#DC2626' : 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {p.reference}
                      </div>
                      {!p.hasLargeImage && (
                        <div style={{ color: '#DC2626', fontSize: '0.74rem', fontWeight: 700, marginTop: '2px' }}>
                          ⚠️ Referencia no cuenta con imagen grande
                        </div>
                      )}
                    </td>

                    {/* Marca */}
                    <td style={{ padding: '0.85rem 1rem', color: p.brand ? 'var(--text-primary)' : '#DC2626', fontWeight: 600 }}>
                      {p.brand || 'Sin marca'}
                    </td>

                    {/* Material */}
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {p.material || '-'}
                    </td>

                    {/* Precio */}
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ${p.price.toFixed(2)}
                    </td>

                    {/* Descripción */}
                    <td style={{ padding: '0.85rem 1rem', color: !p.hasLargeImage ? '#DC2626' : 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '300px' }}>
                      {p.description}
                    </td>

                    {/* Faltantes Badges */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {p.missingFields.length === 0 ? (
                        <span style={{ fontSize: '0.72rem', backgroundColor: '#DEF7EC', color: '#03543F', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
                          ✓ Completo
                        </span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {p.missingFields.map((f, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: '0.7rem',
                                backgroundColor: f === 'Foto Grande' ? '#FEE2E2' : '#FEF3C7',
                                color: f === 'Foto Grande' ? '#991B1B' : '#92400E',
                                padding: '0.15rem 0.45rem',
                                borderRadius: 'var(--radius-sm)',
                                fontWeight: 700,
                              }}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Mostrando {paginatedProducts.length} de {filteredProducts.length.toLocaleString()} artículos encontrados
            </span>

            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Anterior
              </button>

              <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0 0.5rem' }}>
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QUICK ACTIONS */}
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
        Accesos Rápidos
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <Link href="/dashboard/articulos" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
              📥 Carga Masiva de Metadatos (CSV)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Subir archivos CSV con género, flex, material y tallas
            </p>
          </div>
          <ArrowUpRight size={20} color="var(--blue)" />
        </Link>

        <Link href="/dashboard/usuarios" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
              Gestión de Ópticas y Clientes
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Administrar los 464 clientes y códigos ERP
            </p>
          </div>
          <ArrowUpRight size={20} color="var(--blue)" />
        </Link>

        <Link href="/dashboard/restricciones" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
              Restricción por País
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Configurar visibilidad de marcas en Latinoamérica
            </p>
          </div>
          <ArrowUpRight size={20} color="var(--blue)" />
        </Link>
      </div>
    </div>
  );
}
