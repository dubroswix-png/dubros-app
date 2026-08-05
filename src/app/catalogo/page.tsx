'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { LATAM_COUNTRIES, Product } from '@/data/mock';
import { getProducts, getBrands, getCategories, getMaterials, type SupabaseBrand, type SupabaseCategory } from '@/lib/products';
import { useFavorites } from '@/context/FavoritesContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCatalogFilter } from '@/hooks/useCatalogFilter';
import { FilterSidebar } from '@/components/catalog/FilterSidebar';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Globe, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function CatalogContent() {
  const searchParams = useSearchParams();
  const isFavOnly = searchParams.get('type') === 'fav';
  const { favorites } = useFavorites();
  const { t } = useLanguage();
  const { userProfile } = useAuth();

  // Data states
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<SupabaseBrand[]>([]);
  const [categories, setCategories] = useState<SupabaseCategory[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 24;

  const [selectedPrice, setSelectedPrice] = useState('all');

  const isAdmin = userProfile?.role === 'admin';
  const userCountryObj = LATAM_COUNTRIES.find(
    (c) => c.name === userProfile?.country || c.code === userProfile?.country
  );
  const userCountryName = userCountryObj?.name || userProfile?.country || 'Panamá';

  // Load filter options (brands, categories, materials) once on mount
  useEffect(() => {
    async function loadFilterOptions() {
      const [brandsData, categoriesData, materialsData] = await Promise.all([
        getBrands(),
        getCategories(),
        getMaterials(),
      ]);
      setBrands(brandsData);
      setCategories(categoriesData);
      setMaterials(materialsData);
    }
    loadFilterOptions();
  }, []);

  // Load products when page changes
  const loadProducts = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProducts({ page, pageSize: PAGE_SIZE });
      setAllProducts(result.products);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (e) {
      console.error('Error loading products:', e);
      setError('Error al cargar los productos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(currentPage);
  }, [currentPage, loadProducts]);

  // Client-side filters on loaded products
  const {
    searchTerm,
    setSearchTerm,
    selectedBrand,
    setSelectedBrand,
    selectedCategory,
    setSelectedCategory,
    selectedMaterial,
    setSelectedMaterial,
    selectedGender,
    setSelectedGender,
    selectedSize,
    setSelectedSize,
    selectedCountry,
    setSelectedCountry,
    filteredProducts,
    resetFilters,
  } = useCatalogFilter({
    products: allProducts,
    favorites,
    isFavOnly,
    selectedPrice,
  });

  React.useEffect(() => {
    if (!isAdmin && userCountryObj?.code) {
      setSelectedCountry(userCountryObj.code);
    }
  }, [isAdmin, userCountryObj?.code, setSelectedCountry]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);
      
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 5);
      }
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 4);
      }
      
      if (start > 2) pages.push(-1); // ellipsis
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push(-2); // ellipsis
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Calculate display range
  const rangeStart = (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalCount);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {isFavOnly ? t('catalog.favorites_title') : t('catalog.title')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            {isFavOnly ? t('catalog.favorites_subtitle') : t('catalog.subtitle')}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-secondary)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-medium)',
          }}
        >
          <Globe size={18} color="var(--blue)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>País de venta:</span>
          {isAdmin ? (
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                fontWeight: 700,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {LATAM_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          ) : (
            <span style={{ fontWeight: 700, color: 'var(--navy)' }}>
              {userCountryObj ? `${userCountryObj.flag} ${userCountryName}` : userCountryName}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>
        <FilterSidebar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedMaterial={selectedMaterial}
          setSelectedMaterial={setSelectedMaterial}
          selectedGender={selectedGender}
          setSelectedGender={setSelectedGender}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          selectedPrice={selectedPrice}
          setSelectedPrice={setSelectedPrice}
          resetFilters={resetFilters}
          brands={brands}
          categories={categories}
          materials={materials}
        />

        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span>
              Mostrando <strong>{rangeStart}–{rangeEnd}</strong> de <strong>{totalCount.toLocaleString()}</strong> artículos
            </span>
            <span>Página {currentPage} de {totalPages}</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1rem' }}>
              <Loader2 size={40} color="var(--blue)" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Cargando productos...</span>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p style={{ color: '#EF4444', fontSize: '1.1rem', marginBottom: '1rem' }}>⚠️ {error}</p>
              <button onClick={() => loadProducts(currentPage)} className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <ProductGrid products={filteredProducts} resetFilters={resetFilters} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.25rem',
                  marginTop: '2.5rem',
                  padding: '1rem 0',
                }}>
                  {/* First */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-medium)',
                      background: currentPage === 1 ? '#f3f4f6' : '#fff',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      color: currentPage === 1 ? '#9ca3af' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Primera página"
                  >
                    <ChevronsLeft size={18} />
                  </button>

                  {/* Prev */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-medium)',
                      background: currentPage === 1 ? '#f3f4f6' : '#fff',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      color: currentPage === 1 ? '#9ca3af' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Anterior"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {/* Page numbers */}
                  {getVisiblePages().map((page, idx) =>
                    page < 0 ? (
                      <span key={`ellipsis-${idx}`} style={{ padding: '0 0.3rem', color: 'var(--text-tertiary)' }}>…</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        style={{
                          minWidth: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid',
                          borderColor: currentPage === page ? 'var(--blue)' : 'var(--border-medium)',
                          background: currentPage === page ? 'var(--blue)' : '#fff',
                          color: currentPage === page ? '#fff' : 'var(--text-primary)',
                          cursor: 'pointer',
                          fontWeight: currentPage === page ? 700 : 400,
                          fontSize: '0.85rem',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {page}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-medium)',
                      background: currentPage === totalPages ? '#f3f4f6' : '#fff',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      color: currentPage === totalPages ? '#9ca3af' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Siguiente"
                  >
                    <ChevronRight size={18} />
                  </button>

                  {/* Last */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-medium)',
                      background: currentPage === totalPages ? '#f3f4f6' : '#fff',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      color: currentPage === totalPages ? '#9ca3af' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Última página"
                  >
                    <ChevronsRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>Cargando catálogo...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
