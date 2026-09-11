'use client';

import { useState, useMemo, useCallback } from 'react';
import { Product } from '@/data/mock';
import { normalizeText, normalizeGender, normalizeFlex, normalizeSaleType } from '@/lib/products';

interface UseCatalogFilterOptions {
  products: Product[];
  favorites: string[];
  isFavOnly?: boolean;
  selectedPrice?: string;
}

interface FilterState {
  searchTerm: string;
  selectedBrand: string;
  selectedCategory: string;
  selectedMaterial: string;
  selectedGender: string;
  selectedSize: string;
  selectedBridge: string;
  selectedTemple: string;
  selectedSaleType: string;
  selectedFlex: string;
  selectedCountry: string;
}

const INITIAL_STATE: FilterState = {
  searchTerm: '',
  selectedBrand: 'all',
  selectedCategory: 'all',
  selectedMaterial: 'all',
  selectedGender: 'all',
  selectedSize: 'all',
  selectedBridge: 'all',
  selectedTemple: 'all',
  selectedSaleType: 'all',
  selectedFlex: 'all',
  selectedCountry: 'PA',
};

export function useCatalogFilter({
  products,
  favorites,
  isFavOnly = false,
  selectedPrice = 'all',
}: UseCatalogFilterOptions) {
  const [filters, setFilters] = useState<FilterState>(INITIAL_STATE);

  const setFilterField = useCallback(<K extends keyof FilterState>(field: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const filteredProducts = useMemo(() => {
    const {
      searchTerm,
      selectedBrand,
      selectedCategory,
      selectedMaterial,
      selectedGender,
      selectedSize,
      selectedBridge,
      selectedTemple,
      selectedSaleType,
      selectedFlex,
      selectedCountry,
    } = filters;

    return products.filter((product) => {
      if (isFavOnly && !favorites.includes(product.id)) {
        return false;
      }
      if (searchTerm) {
        const term = normalizeText(searchTerm);
        const ref = normalizeText(product.reference);
        const code = normalizeText(product.code);
        const desc = normalizeText(product.description);
        if (!ref.includes(term) && !code.includes(term) && !desc.includes(term)) {
          return false;
        }
      }
      if (selectedBrand !== 'all' && normalizeText(product.brand) !== normalizeText(selectedBrand)) {
        return false;
      }
      if (selectedCategory !== 'all' && normalizeText(product.category) !== normalizeText(selectedCategory)) {
        return false;
      }
      if (selectedMaterial !== 'all') {
        const pMat = normalizeText(product.material);
        const sMat = normalizeText(selectedMaterial);
        if (!pMat.includes(sMat) && !sMat.includes(pMat)) {
          return false;
        }
      }
      if (selectedGender !== 'all') {
        const filterGen = normalizeGender(selectedGender);
        const prodGen = normalizeGender(product.gender);
        if (filterGen && prodGen !== filterGen) {
          return false;
        }
      }
      if (selectedSize !== 'all' && product.eyeSize !== parseInt(selectedSize, 10)) {
        return false;
      }
      if (selectedBridge !== 'all' && product.bridgeSize !== parseInt(selectedBridge, 10)) {
        return false;
      }
      if (selectedTemple !== 'all' && product.templeLength !== parseInt(selectedTemple, 10)) {
        return false;
      }
      if (selectedSaleType !== 'all') {
        const filterSale = normalizeSaleType(selectedSaleType);
        const prodSale = normalizeSaleType(product.saleType);
        if (filterSale && prodSale !== filterSale) {
          return false;
        }
      }
      if (selectedFlex !== 'all') {
        const filterFlex = normalizeFlex(selectedFlex);
        const prodFlex = normalizeFlex(product.flex);
        if (filterFlex !== null && prodFlex !== filterFlex) {
          return false;
        }
      }
      if (product.restrictedCountries?.includes(selectedCountry)) {
        return false;
      }
      if (selectedPrice !== 'all') {
        if (selectedPrice === '1-5' && (product.price < 1 || product.price > 5)) return false;
        if (selectedPrice === '5-10' && (product.price <= 5 || product.price > 10)) return false;
        if (selectedPrice === '10-20' && (product.price <= 10 || product.price > 20)) return false;
        if (selectedPrice === '20+' && product.price <= 20) return false;
      }

      return true;
    });
  }, [products, favorites, isFavOnly, selectedPrice, filters]);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_STATE);
  }, []);

  return {
    searchTerm: filters.searchTerm,
    setSearchTerm: (v: string) => setFilterField('searchTerm', v),
    selectedBrand: filters.selectedBrand,
    setSelectedBrand: (v: string) => setFilterField('selectedBrand', v),
    selectedCategory: filters.selectedCategory,
    setSelectedCategory: (v: string) => setFilterField('selectedCategory', v),
    selectedMaterial: filters.selectedMaterial,
    setSelectedMaterial: (v: string) => setFilterField('selectedMaterial', v),
    selectedGender: filters.selectedGender,
    setSelectedGender: (v: string) => setFilterField('selectedGender', v),
    selectedSize: filters.selectedSize,
    setSelectedSize: (v: string) => setFilterField('selectedSize', v),
    selectedBridge: filters.selectedBridge,
    setSelectedBridge: (v: string) => setFilterField('selectedBridge', v),
    selectedTemple: filters.selectedTemple,
    setSelectedTemple: (v: string) => setFilterField('selectedTemple', v),
    selectedSaleType: filters.selectedSaleType,
    setSelectedSaleType: (v: string) => setFilterField('selectedSaleType', v),
    selectedFlex: filters.selectedFlex,
    setSelectedFlex: (v: string) => setFilterField('selectedFlex', v),
    selectedCountry: filters.selectedCountry,
    setSelectedCountry: (v: string) => setFilterField('selectedCountry', v),
    filteredProducts,
    resetFilters,
  };
}
