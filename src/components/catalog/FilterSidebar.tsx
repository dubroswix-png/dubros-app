'use client';

import React from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface FilterSidebarProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedBrand: string;
  setSelectedBrand: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  selectedMaterial: string;
  setSelectedMaterial: (v: string) => void;
  selectedGender: string;
  setSelectedGender: (v: string) => void;
  selectedSize: string;
  setSelectedSize: (v: string) => void;
  selectedPrice: string;
  setSelectedPrice: (v: string) => void;
  resetFilters: () => void;
  // Dynamic data from Supabase
  brands?: { id: string; name: string }[];
  categories?: { id: string; name: string }[];
  materials?: string[];
}

export function FilterSidebar({
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
  selectedPrice,
  setSelectedPrice,
  resetFilters,
  brands = [],
  categories = [],
  materials = [],
}: FilterSidebarProps) {
  const { t } = useLanguage();
  const { isLoggedIn } = useAuth();

  const brandOptions = [
    { label: `${t('catalog.filter.all' as any)}`, value: 'all' },
    ...brands.map((b) => ({ label: b.name, value: b.name })),
  ];

  const categoryOptions = [
    { label: `${t('catalog.filter.all' as any)}`, value: 'all' },
    ...categories.map((c) => ({ label: c.name, value: c.name })),
  ];

  const materialOptions = [
    { label: `${t('catalog.filter.all' as any)}`, value: 'all' },
    ...materials.map((m) => ({ label: m, value: m })),
  ];

  const genderOptions = [
    { label: `${t('catalog.filter.all' as any)}`, value: 'all' },
    { label: 'Hombre', value: 'Hombre' },
    { label: 'Mujer', value: 'Mujer' },
    { label: 'Unisex', value: 'Unisex' },
    { label: 'Niños', value: 'Niños' },
  ];

  const priceOptions = [
    { label: `${t('catalog.filter.all' as any)}`, value: 'all' },
    { label: '$1 - $5', value: '1-5' },
    { label: '$5 - $10', value: '5-10' },
    { label: '$10 - $20', value: '10-20' },
    { label: '+$20', value: '20+' },
  ];

  return (
    <aside
      style={{
        backgroundColor: 'var(--bg-card)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        height: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={18} color="var(--navy)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
            Filtros
          </h2>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          title="Restablecer todos los filtros"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.6rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--blue)',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <RotateCcw size={12} /> Limpiar
        </button>
      </div>

      <Input
        label={t('nav.search' as any)}
        placeholder="..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        icon={<Search size={16} />}
      />

      <Select
        label={t('catalog.filter.brand' as any)}
        options={brandOptions}
        value={selectedBrand}
        onChange={(e) => setSelectedBrand(e.target.value)}
      />

      <Select
        label="Categoría"
        options={categoryOptions}
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      />

      <Select
        label={t('catalog.filter.material' as any)}
        options={materialOptions}
        value={selectedMaterial}
        onChange={(e) => setSelectedMaterial(e.target.value)}
      />

      <Select
        label="Colección / Género"
        options={genderOptions}
        value={selectedGender}
        onChange={(e) => setSelectedGender(e.target.value)}
      />

      {isLoggedIn && (
        <Select
          label={t('catalog.filter.price' as any)}
          options={priceOptions}
          value={selectedPrice}
          onChange={(e) => setSelectedPrice(e.target.value)}
        />
      )}
    </aside>
  );
}
