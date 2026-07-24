'use client';

import { useState, useMemo } from 'react';
import { Product } from '@/data/mock';

interface UseCatalogFilterOptions {
  products: Product[];
  favorites: string[];
  isFavOnly?: boolean;
  selectedPrice?: string;
}

export function useCatalogFilter({ products, favorites, isFavOnly = false, selectedPrice = 'all' }: UseCatalogFilterOptions) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('PA');

  const filteredProducts = useMemo(() => {
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
  }, [
    products,
    searchTerm,
    selectedBrand,
    selectedCategory,
    selectedMaterial,
    selectedGender,
    selectedSize,
    selectedCountry,
    isFavOnly,
    favorites,
    selectedPrice,
  ]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedBrand('all');
    setSelectedCategory('all');
    setSelectedMaterial('all');
    setSelectedGender('all');
    setSelectedSize('all');
  };

  return {
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
  };
}
