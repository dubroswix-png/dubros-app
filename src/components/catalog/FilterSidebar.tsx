'use client';

import React from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { MOCK_BRANDS, MOCK_CATEGORIES, MOCK_PRODUCTS } from '@/data/mock';
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
}: FilterSidebarProps) {
  const { t } = useLanguage();
  const { isLoggedIn } = useAuth();

  const brandOptions = [
    { label: `${t('catalog.filter.all' as any)}`, value: 'all' },
    ...MOCK_BRANDS.map((b) => ({ label: b.name, value: b.name })),
  ];

  const categoryOptions = [
    { label: `${t('catalog.filter.all' as any)}`, value: 'all' },
    ...MOCK_CATEGORIES.map((c) => ({ label: c.name, value: c.name })),
  ];

  const materialOptions = [
    { label: `${t('catalog.filter.all' as any)}`, value: 'all' },
    { label: 'Titanio', value: 'Titanio' },
    { label: 'Acetato', value: 'Acetato' },
    { label: 'Metal', value: 'Metal' },
    { label: 'TR90', value: 'TR90' },
    { label: 'Combinado', value: 'Combinado' },
  ];

  const genderOptions = [
    { label: `${t('catalog.filter.all' as any)}`, value: 'all' },
    { label: 'Hombre', value: 'Hombre' },
    { label: 'Mujer', value: 'Mujer' },
    { label: 'Unisex', value: 'Unisex' },
  ];

  const uniqueSizes = Array.from(new Set(MOCK_PRODUCTS.map((p) => p.eyeSize))).sort();
  const sizeOptions = [
    { label: `${t('catalog.filter.all' as any)}`, value: 'all' },
    ...uniqueSizes.map((s) => ({ label: String(s), value: String(s) })),
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} /> Filtros
        </h2>
        <button
          onClick={resetFilters}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--blue)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <RotateCcw size={14} /> {t('catalog.resetFilters' as any)}
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
        label="Category"
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
        label={t('catalog.filter.gender' as any)}
        options={genderOptions}
        value={selectedGender}
        onChange={(e) => setSelectedGender(e.target.value)}
      />

      <Select
        label={t('catalog.filter.size' as any)}
        options={sizeOptions}
        value={selectedSize}
        onChange={(e) => setSelectedSize(e.target.value)}
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
