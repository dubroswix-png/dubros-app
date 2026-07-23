'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MOCK_PRODUCTS, LATAM_COUNTRIES } from '@/data/mock';
import { useFavorites } from '@/context/FavoritesContext';
import { useCatalogFilter } from '@/hooks/useCatalogFilter';
import { FilterSidebar } from '@/components/catalog/FilterSidebar';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Globe } from 'lucide-react';

function CatalogContent() {
  const searchParams = useSearchParams();
  const isFavOnly = searchParams.get('type') === 'fav';
  const { favorites } = useFavorites();

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
    products: MOCK_PRODUCTS,
    favorites,
    isFavOnly,
  });

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
          resetFilters={resetFilters}
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
              Mostrando <strong>{filteredProducts.length}</strong> artículos
            </span>
            <span>Página 1 de 1</span>
          </div>

          <ProductGrid products={filteredProducts} resetFilters={resetFilters} />
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
