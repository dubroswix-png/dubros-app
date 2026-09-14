// =============================================================================
// Export Utilities — Excel (XLSX) & CSV for ERP and Orders
// =============================================================================

import * as XLSX from 'xlsx';
import { OrderRecord } from '@/lib/orders';
import { isDocena } from '@/lib/products';

/**
 * Generates and triggers download of the Switch ERP format Excel file (.xlsx)
 * Format required by Switch ERP Excel Import: CODIGO, CANTIDAD, PRECIO, DESCUENTO
 *
 * NOTE FOR SWITCH ERP COMPLIANCE:
 * Switch ERP tracks inventory in individual pieces (e.g. 787 units of ST005BROWN at $0.63/pc).
 * When an order sells a DOCENA item, Switch ERP requires CANTIDAD in physical pieces (qty * 12)
 * and PRECIO at the piece rate ($0.63), so total value remains exact ($7.56) and inventory
 * is accurately deducted by 12 units.
 */
export function downloadSwitchXLSX(order: OrderRecord, e?: React.MouseEvent): void {
  if (e) e.stopPropagation();

  const data = (order.order_items || []).map((item) => {
    const code = (item.product?.code || item.code || item.product?.reference || item.reference || '').trim();
    const isDoc = isDocena(item.product?.sale_type || (item as any).sale_type || (item as any).saleType);
    const qty = item.quantity || 1;
    
    // Switch ERP physical quantity and piece rate
    const switchQty = isDoc ? qty * 12 : qty;
    const switchPrice = isDoc
      ? (item.product?.price ?? Number(item.unit_price || 0) / 12)
      : Number(item.unit_price || 0);
    const discount = 0;

    return {
      CODIGO: code,
      CANTIDAD: switchQty,
      PRECIO: Number(switchPrice.toFixed(4)),
      DESCUENTO: discount,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: ['CODIGO', 'CANTIDAD', 'PRECIO', 'DESCUENTO'],
  });

  // Auto-fit column widths
  worksheet['!cols'] = [
    { wch: 18 }, // CODIGO
    { wch: 12 }, // CANTIDAD
    { wch: 12 }, // PRECIO
    { wch: 14 }, // DESCUENTO
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedido_Switch');

  const cleanOrderNum = (order.order_number || 'orden').replace(/[/\\?%*:|"<>]/g, '-');
  XLSX.writeFile(workbook, `Switch_Pedido_${cleanOrderNum}.xlsx`);
}

/**
 * Generates and triggers download of a detailed CSV of an order
 */
export function downloadFullCSV(order: OrderRecord, e?: React.MouseEvent): void {
  if (e) e.stopPropagation();

  const headers = ['Referencia', 'Codigo', 'Descripcion', 'Tipo Venta', 'Precio Unitario', 'Cantidad Pedida', 'Piezas Totales', 'Subtotal'];
  const rows = (order.order_items || []).map((item) => {
    const isDoc = isDocena(item.product?.sale_type || (item as any).sale_type || (item as any).saleType);
    const qty = item.quantity || 1;
    const physicalPieces = isDoc ? qty * 12 : qty;
    const unitPrice = Number(item.unit_price || 0);
    const lineTotal = unitPrice * qty;

    return [
      `"${item.product?.reference || item.reference || ''}"`,
      `"${item.product?.code || item.code || ''}"`,
      `"${(item.product?.description || '').replace(/"/g, '""')}"`,
      `"${isDoc ? 'DOCENA' : 'PIEZA'}"`,
      `"${unitPrice.toFixed(2)}"`,
      `"${qty} ${isDoc ? 'doc' : 'pzs'}"`,
      `"${physicalPieces}"`,
      `"${lineTotal.toFixed(2)}"`,
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const cleanOrderNum = (order.order_number || 'orden').replace(/[/\\?%*:|"<>]/g, '-');
  link.setAttribute('download', `Detalle_Pedido_${cleanOrderNum}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
