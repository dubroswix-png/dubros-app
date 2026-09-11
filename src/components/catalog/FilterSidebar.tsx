'use client';

import React from 'react';
import { Filter, RotateCcw, Search, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth, hasAdminAccess } from '@/context/AuthContext';
import { normalizeText, normalizeGender, normalizeFlex, normalizeSaleType } from '@/lib/products';

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
  selectedBridge?: string;
  setSelectedBridge?: (v: string) => void;
  selectedTemple?: string;
  setSelectedTemple?: (v: string) => void;
  selectedSaleType?: string;
  setSelectedSaleType?: (v: string) => void;
  selectedFlex?: string;
  setSelectedFlex?: (v: string) => void;
  selectedPrice: string;
  setSelectedPrice: (v: string) => void;
  selectedStock?: string;
  setSelectedStock?: (v: string) => void;
  isAdmin?: boolean;
  resetFilters: () => void;
  // Dynamic data from Supabase
  brands?: { id: string; name: string }[];
  categories?: { id: string; name: string }[];
  materials?: string[];
  sizes?: number[];
  bridges?: number[];
  temples?: number[];
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
  selectedBridge,
  setSelectedBridge,
  selectedTemple,
  setSelectedTemple,
  selectedSaleType,
  setSelectedSaleType,
  selectedFlex,
  setSelectedFlex,
  selectedPrice,
  setSelectedPrice,
  selectedStock,
  setSelectedStock,
  isAdmin,
  resetFilters,
  brands = [],
  categories = [],
  materials = [],
  sizes = [44, 46, 48, 50, 51, 52, 53, 54, 55, 56, 58],
  bridges = [14, 15, 16, 17, 18, 19, 20, 21, 22],
  temples = [125, 130, 135, 138, 140, 142, 143, 145, 148, 150],
}: FilterSidebarProps) {
  const { t } = useLanguage();
  const { isLoggedIn, userProfile } = useAuth();
  const isUserAnAdmin = isAdmin ?? hasAdminAccess(userProfile?.role, userProfile?.email);
  const [showOpticalGuide, setShowOpticalGuide] = React.useState(false);

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

  const sizeOptions = [
    { label: 'Todos los calibres', value: 'all' },
    ...sizes.map((s) => ({ label: `Calibre ${s} mm`, value: String(s) })),
  ];

  const bridgeOptions = [
    { label: 'Cualquier puente', value: 'all' },
    ...bridges.map((b) => ({ label: `Puente ${b} mm`, value: String(b) })),
  ];

  const templeOptions = [
    { label: 'Cualquier varilla', value: 'all' },
    ...temples.map((t) => ({ label: `Varilla ${t} mm`, value: String(t) })),
  ];

  const saleTypeOptions = [
    { label: 'Todos los tipos de venta', value: 'all' },
    { label: '📦 Por Docena', value: 'DOCENA' },
    { label: '👓 Por Pieza', value: 'PIEZA' },
  ];

  const flexOptions = [
    { label: 'Flex y No Flex (Todos)', value: 'all' },
    { label: '🔄 Con Flex (Bisagra con resorte)', value: 'flex' },
    { label: '🔒 Sin Flex (Bisagra fija)', value: 'noflex' },
  ];

  const priceOptions = [
    { label: `${t('catalog.filter.all' as any)}`, value: 'all' },
    { label: '$1 - $5', value: '1-5' },
    { label: '$5 - $10', value: '5-10' },
    { label: '$10 - $20', value: '10-20' },
    { label: '+$20', value: '20+' },
  ];

  const stockOptions = [
    { label: 'Todos los niveles de stock', value: 'all' },
    { label: '≥ 5 piezas (5 en adelante)', value: '5+' },
    { label: '≥ 10 piezas (10 en adelante)', value: '10+' },
    { label: '≥ 20 piezas (20 en adelante)', value: '20+' },
    { label: '≥ 1 pieza (En stock)', value: '1+' },
  ];

  const [isSearchingPulse, setIsSearchingPulse] = React.useState(false);

  React.useEffect(() => {
    if (searchTerm.trim().length > 1) {
      setIsSearchingPulse(true);
      const timer = setTimeout(() => setIsSearchingPulse(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const normalizedSelectedMaterial = React.useMemo(() => {
    if (!selectedMaterial || selectedMaterial === 'all') return 'all';
    const clean = normalizeText(selectedMaterial);
    const found = materialOptions.find((o) => normalizeText(o.value) === clean);
    return found ? found.value : selectedMaterial;
  }, [selectedMaterial, materialOptions]);

  const normalizedSelectedGender = React.useMemo(() => {
    if (!selectedGender || selectedGender === 'all') return 'all';
    const norm = normalizeGender(selectedGender);
    return norm || selectedGender;
  }, [selectedGender]);

  const normalizedSelectedFlex = React.useMemo(() => {
    if (selectedFlex === undefined || selectedFlex === 'all') return 'all';
    const norm = normalizeFlex(selectedFlex);
    if (norm === true) return 'flex';
    if (norm === false) return 'noflex';
    return selectedFlex;
  }, [selectedFlex]);

  const normalizedSelectedSaleType = React.useMemo(() => {
    if (!selectedSaleType || selectedSaleType === 'all') return 'all';
    const norm = normalizeSaleType(selectedSaleType);
    return norm || selectedSaleType;
  }, [selectedSaleType]);

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
        className={isSearchingPulse ? 'animate-search-pulse' : ''}
        onChange={(e) => setSearchTerm(e.target.value)}
        icon={<Search size={16} className={isSearchingPulse ? 'text-blue-500' : ''} />}
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
        value={normalizedSelectedMaterial}
        onChange={(e) => setSelectedMaterial(e.target.value)}
      />

      <Select
        label="Colección / Género"
        options={genderOptions}
        value={normalizedSelectedGender}
        onChange={(e) => setSelectedGender(e.target.value)}
      />

      {/* 3D OPTICAL MEASUREMENTS (ISO 8624 BOXING SYSTEM) */}
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            👓 Medidas Ópticas (ISO)
          </span>
          <button
            type="button"
            onClick={() => setShowOpticalGuide(!showOpticalGuide)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.72rem',
              color: 'var(--blue)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              padding: '0.1rem 0.3rem',
            }}
            title="Ver guía de medidas ópticas"
          >
            <HelpCircle size={13} /> {showOpticalGuide ? 'Ocultar' : 'Guía (?)'}
          </button>
        </div>

        {showOpticalGuide && (
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              backgroundColor: '#FFF',
              border: '1px dashed var(--blue)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.55rem 0.65rem',
              lineHeight: 1.45,
            }}
          >
            <strong>Formato Boxing (ej. 55-18-143):</strong>
            <br />• <strong>Ojo:</strong> Ancho horizontal de la lente (39-60 mm).
            <br />• <strong>Puente:</strong> Espacio nasal (14-22 mm).
            <br />• <strong>Varilla:</strong> Largo patilla (125-150 mm).
            <br /><span style={{ color: 'var(--blue)', fontWeight: 700 }}>*Cada medida es independiente.</span>
          </div>
        )}

        <Select
          label="👁️ Calibre / Ojo"
          options={sizeOptions}
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
        />

        {setSelectedBridge && (
          <Select
            label="👃 Puente Nasal"
            options={bridgeOptions}
            value={selectedBridge || 'all'}
            onChange={(e) => setSelectedBridge(e.target.value)}
          />
        )}

        {setSelectedTemple && (
          <Select
            label="📏 Varilla / Patilla"
            options={templeOptions}
            value={selectedTemple || 'all'}
            onChange={(e) => setSelectedTemple(e.target.value)}
          />
        )}
      </div>

      {setSelectedSaleType && (
        <Select
          label="Tipo de Venta"
          options={saleTypeOptions}
          value={normalizedSelectedSaleType}
          onChange={(e) => setSelectedSaleType(e.target.value)}
        />
      )}

      {setSelectedFlex && (
        <Select
          label="Flexibilidad (Bisagra Flex)"
          options={flexOptions}
          value={normalizedSelectedFlex}
          onChange={(e) => setSelectedFlex(e.target.value)}
        />
      )}

      {isLoggedIn && (
        <Select
          label={t('catalog.filter.price' as any)}
          options={priceOptions}
          value={selectedPrice}
          onChange={(e) => setSelectedPrice(e.target.value)}
        />
      )}

      {isUserAnAdmin && setSelectedStock && (
        <div
          style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              📦 Filtro Stock (Admin)
            </span>
            <span style={{ fontSize: '0.62rem', backgroundColor: '#DBEAFE', color: '#1D4ED8', padding: '0.12rem 0.4rem', borderRadius: '4px', fontWeight: 800 }}>
              SOLO ADMIN
            </span>
          </div>
          <Select
            label=""
            options={stockOptions}
            value={selectedStock || 'all'}
            onChange={(e) => setSelectedStock(e.target.value)}
          />
        </div>
      )}
    </aside>
  );
}
