'use client';

import React, { useState } from 'react';
import { MOCK_BRANDS, LATAM_COUNTRIES } from '@/data/mock';
import { Globe, ShieldCheck, Save, Check } from 'lucide-react';

export default function AdminCountryRestrictionsPage() {
  const [saved, setSaved] = useState(false);
  // Matrix state: brandId -> countryCode -> boolean (enabled)
  const [matrix, setMatrix] = useState<{ [brandId: string]: { [countryCode: string]: boolean } }>({
    '1': { PA: true, CO: true, EC: true, CR: false, GT: true, HN: true, VE: false, MX: true },
    '2': { PA: true, CO: true, EC: true, CR: true, GT: true, HN: true, VE: true, MX: true },
    '3': { PA: true, CO: false, EC: true, CR: false, GT: true, HN: true, VE: false, MX: true },
  });

  const toggleAccess = (brandId: string, countryCode: string) => {
    const brandMap = matrix[brandId] || {};
    const currentVal = brandMap[countryCode] ?? true;
    setMatrix({
      ...matrix,
      [brandId]: {
        ...brandMap,
        [countryCode]: !currentVal,
      },
    });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>🌎 Restricción de Marcas por País</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Habilite o deshabilite las marcas disponibles para cada país de Latinoamérica en el catálogo de clientes.
          </p>
        </div>

        <button onClick={handleSave} className="btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
          <Save size={18} /> {saved ? '¡Guardado!' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 800, width: '160px' }}>Marca</th>
                {LATAM_COUNTRIES.slice(0, 8).map((country) => (
                  <th key={country.code} style={{ padding: '0.75rem', fontWeight: 700 }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{country.flag}</div>
                    <span>{country.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_BRANDS.map((brand) => (
                <tr key={brand.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem', textAlign: 'left', fontWeight: 800, color: 'var(--blue)' }}>
                    {brand.name}
                  </td>
                  {LATAM_COUNTRIES.slice(0, 8).map((country) => {
                    const isEnabled = matrix[brand.id]?.[country.code] ?? true;
                    return (
                      <td key={country.code} style={{ padding: '1rem' }}>
                        <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => toggleAccess(brand.id, country.code)}
                            style={{
                              width: '18px',
                              height: '18px',
                              accentColor: 'var(--blue)',
                              cursor: 'pointer',
                            }}
                          />
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
