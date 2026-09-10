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
import { ProductSkeletonGrid } from '@/components/catalog/ProductSkeletonGrid';
import { Globe, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, SlidersHorizontal, X } from 'lucide-react';
import { useAuth, hasAdminAccess } from '@/context/AuthContext';

function CatalogContent() {
  const searchParams = useSearchParams();
  const isFavOnly = searchParams.get('type') === 'fav';
  const collectionId = searchParams.get('collection') || undefined;
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

  const initialMaterial = searchParams.get('material') || 'all';

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState(initialMaterial);
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('PA');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedStock, setSelectedStock] = useState('all');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync selectedMaterial if URL search param changes
  useEffect(() => {
    const mat = searchParams.get('material');
    if (mat) {
      setSelectedMaterial(mat);
    }
  }, [searchParams]);

  const isAdmin = hasAdminAccess(userProfile?.role, userProfile?.email);

  // Active filters count for mobile button
  const activeFiltersCount = [
    searchTerm ? 1 : 0,
    selectedBrand !== 'all' ? 1 : 0,
    selectedCategory !== 'all' ? 1 : 0,
    selectedMaterial !== 'all' ? 1 : 0,
    selectedGender !== 'all' ? 1 : 0,
    selectedPrice !== 'all' ? 1 : 0,
    isAdmin && selectedStock !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);
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

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedBrand, selectedCategory, selectedMaterial, selectedGender, selectedPrice, selectedStock]);

  // Load products when page changes or filters change
  const loadProducts = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      let minPrice: number | undefined;
      let maxPrice: number | undefined;

      if (selectedPrice === '1-5') {
        minPrice = 1;
        maxPrice = 5;
      } else if (selectedPrice === '5-10') {
        minPrice = 5;
        maxPrice = 10;
      } else if (selectedPrice === '10-20') {
        minPrice = 10;
        maxPrice = 20;
      } else if (selectedPrice === '20+') {
        minPrice = 20;
        maxPrice = 99999;
      }

      let minStock: number | undefined;
      if (isAdmin && selectedStock !== 'all') {
        if (selectedStock === '5+') minStock = 5;
        else if (selectedStock === '10+') minStock = 10;
        else if (selectedStock === '20+') minStock = 20;
        else if (selectedStock === '1+') minStock = 1;
      }

      const result = await getProducts({
        page,
        pageSize: PAGE_SIZE,
        collectionId,
        search: debouncedSearch,
        brandName: selectedBrand,
        categoryName: selectedCategory,
        material: selectedMaterial,
        gender: selectedGender !== 'all' ? selectedGender : undefined,
        minPrice,
        maxPrice,
        minStock,
      });
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
  }, [collectionId, debouncedSearch, selectedBrand, selectedCategory, selectedMaterial, selectedGender, selectedPrice, selectedStock, isAdmin]);

  useEffect(() => {
    loadProducts(currentPage);
  }, [currentPage, loadProducts]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedBrand('all');
    setSelectedCategory('all');
    setSelectedMaterial('all');
    setSelectedGender('all');
    setSelectedSize('all');
    setSelectedPrice('all');
    setSelectedStock('all');
    setCurrentPage(1);
  }, []);

  const displayedProducts = isFavOnly
    ? allProducts.filter((p) => favorites.includes(p.id))
    : allProducts;

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
    <div className="container catalog-main-container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div>
          <h1 className="catalog-title" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            {isFavOnly ? t('catalog.favorites_title') : t('catalog.title')}
          </h1>
          <p className="catalog-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.4 }}>
            {isFavOnly ? t('catalog.favorites_subtitle') : t('catalog.subtitle')}
          </p>
        </div>

        {isAdmin && (
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
          </div>
        )}
      </div>

      <div className="catalog-layout-grid">
        <div className="catalog-desktop-sidebar">
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
            selectedStock={selectedStock}
            setSelectedStock={setSelectedStock}
            isAdmin={isAdmin}
            resetFilters={resetFilters}
            brands={brands}
            categories={categories}
            materials={materials}
          />
        </div>

        <div>
          {/* TOP STATUS AND MOBILE FILTER BAR */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <span>
              Mostrando <strong>{rangeStart}–{rangeEnd}</strong> de <strong>{totalCount.toLocaleString()}</strong> artículos
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="btn-secondary catalog-mobile-filter-btn"
                style={{
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: activeFiltersCount > 0 ? '#EFF6FF' : 'var(--bg-secondary)',
                  borderColor: activeFiltersCount > 0 ? 'var(--blue)' : 'var(--border-medium)',
                  color: activeFiltersCount > 0 ? 'var(--blue)' : 'var(--text-primary)',
                }}
              >
                <SlidersHorizontal size={16} />
                Filtros
                {activeFiltersCount > 0 && (
                  <span
                    style={{
                      backgroundColor: 'var(--blue)',
                      color: '#FFF',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <span style={{ fontSize: '0.85rem' }}>Página {currentPage} de {totalPages}</span>
            </div>
          </div>

          {loading ? (
            <ProductSkeletonGrid count={8} />
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p style={{ color: '#EF4444', fontSize: '1.1rem', marginBottom: '1rem' }}>⚠️ {error}</p>
              <button onClick={() => loadProducts(currentPage)} className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <ProductGrid products={displayedProducts} resetFilters={resetFilters} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-container">
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
                          minWidth: '34px',
                          height: '34px',
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

      {/* MOBILE FILTER MODAL DRAWER */}
      {isMobileFilterOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div
            className="animate-toast-in"
            style={{
              width: '100%',
              maxWidth: '340px',
              height: '100%',
              backgroundColor: 'var(--bg-primary)',
              boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              padding: '1.25rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-light)',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SlidersHorizontal size={20} color="var(--blue)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Filtros</h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.3rem',
                  color: 'var(--text-primary)',
                }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ flex: 1 }}>
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
                selectedStock={selectedStock}
                setSelectedStock={setSelectedStock}
                isAdmin={isAdmin}
                resetFilters={resetFilters}
                brands={brands}
                categories={categories}
                materials={materials}
              />
            </div>

            <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontWeight: 700, fontSize: '0.95rem' }}
              >
                Ver Resultados ({totalCount.toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      )}
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
