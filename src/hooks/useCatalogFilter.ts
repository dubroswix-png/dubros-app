'use client';

import { useState, useMemo, useCallback } from 'react';
import { Product } from '@/data/mock';

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
  selectedCountry: string;
}

const INITIAL_STATE: FilterState = {
  searchTerm: '',
  selectedBrand: 'all',
  selectedCategory: 'all',
  selectedMaterial: 'all',
  selectedGender: 'all',
  selectedSize: 'all',
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
      selectedCountry,
    } = filters;

    return products.filter((product) => {
      if (isFavOnly && !favorites.includes(product.id)) {
        return false;
      }
      if (
        searchTerm &&
        !product.reference.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !product.code.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !product.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      if (selectedBrand !== 'all' && product.brand !== selectedBrand) {
        return false;
      }
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      if (selectedMaterial !== 'all' && product.material !== selectedMaterial) {
        return false;
      }
      if (selectedGender !== 'all' && product.gender !== selectedGender) {
        return false;
      }
      if (selectedSize !== 'all' && product.eyeSize !== parseInt(selectedSize)) {
        return false;
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
    selectedCountry: filters.selectedCountry,
    setSelectedCountry: (v: string) => setFilterField('selectedCountry', v),
    filteredProducts,
    resetFilters,
  };
}
