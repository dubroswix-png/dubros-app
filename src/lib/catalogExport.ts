import * as XLSX from 'xlsx';
import { Product } from '@/data/mock';

export interface ExportCatalogOptions {
  includePrice: boolean;
  filterSummary?: string;
  scope?: 'all' | 'page';
  filename?: string;
}

/**
 * Exports products directly to an Excel (.xlsx) file in the browser
 */
export function exportProductsToExcel(products: Product[], options: ExportCatalogOptions) {
  if (!products || products.length === 0) {
    throw new Error('No hay productos para exportar.');
  }

  const rows = products.map((p, idx) => {
    const row: Record<string, any> = {
      '#': idx + 1,
      'Referencia': p.reference,
      'Código': p.code || p.reference,
      'Marca': p.brand || 'Dubros',
      'Categoría': p.category || 'Aros Ópticos',
      'Material': p.material || 'N/A',
      'Género': p.gender || 'Unisex',
      'Talla Ocular (Calibre)': p.eyeSize && p.eyeSize > 0 ? p.eyeSize : '-',
      'Flex': p.flex ? 'Sí' : 'No',
      'Tipo de Venta': p.saleType || 'PIEZA',
      'Stock Disponible (uds)': Number(p.quantity || 0),
    };

    if (options.includePrice) {
      const unitPrice = Number(p.price || 0);
      const stock = Number(p.quantity || 0);
      row['Precio Mayorista (USD)'] = unitPrice;
      row['Valor Total Stock (USD)'] = Number((unitPrice * stock).toFixed(2));
    }

    row['Foto (URL)'] = p.largeImageUrl || p.thumbnailUrl || '';

    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Set column widths for optimal reading
  const columnWidths = [
    { wch: 5 },  // #
    { wch: 16 }, // Referencia
    { wch: 16 }, // Código
    { wch: 16 }, // Marca
    { wch: 16 }, // Categoría
    { wch: 18 }, // Material
    { wch: 12 }, // Género
    { wch: 12 }, // Talla
    { wch: 8 },  // Flex
    { wch: 14 }, // Tipo Venta
    { wch: 16 }, // Stock
  ];

  if (options.includePrice) {
    columnWidths.push({ wch: 18 }); // Precio
    columnWidths.push({ wch: 20 }); // Valor Total
  }
  columnWidths.push({ wch: 45 }); // Foto URL

  ws['!cols'] = columnWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Catálogo Dubros');

  const today = new Date().toISOString().slice(0, 10);
  const priceTag = options.includePrice ? 'ConPrecios' : 'SinPrecios';
  const name = options.filename || `Catalogo_Dubros_${priceTag}_${today}.xlsx`;

  XLSX.writeFile(wb, name);
}

/**
 * Prepares data in sessionStorage and opens the printable Lookbook view
 */
export function openPrintableCatalog(products: Product[], options: ExportCatalogOptions) {
  if (typeof window === 'undefined') return;

  const exportPayload = {
    products,
    includePrice: options.includePrice,
    filterSummary: options.filterSummary || 'Catálogo General',
    exportDate: new Date().toLocaleDateString('es-PA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };

  try {
    sessionStorage.setItem('dubros_catalog_export', JSON.stringify(exportPayload));
    window.open('/catalogo/imprimir', '_blank');
  } catch (err) {
    console.error('[openPrintableCatalog] Error storing catalog export payload:', err);
    window.open('/catalogo/imprimir', '_blank');
  }
}
