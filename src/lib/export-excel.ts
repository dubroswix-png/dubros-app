// =============================================================================
// Export Utilities — Excel (XLSX) & CSV for ERP and Orders
// =============================================================================

import * as XLSX from 'xlsx';
import { OrderRecord } from '@/lib/orders';

/**
 * Generates and triggers download of the Switch ERP format Excel file (.xlsx)
 * Format required by Switch ERP Excel Import: CODIGO, CANTIDAD, PRECIO, DESCUENTO
 */
export function downloadSwitchXLSX(order: OrderRecord, e?: React.MouseEvent): void {
  if (e) e.stopPropagation();

  const data = (order.order_items || []).map((item) => {
    const code = (item.product?.code || item.code || item.product?.reference || item.reference || '').trim();
    const qty = item.quantity || 1;
    const price = Number(item.unit_price || 0);
    const discount = 0;
    return {
      CODIGO: code,
      CANTIDAD: qty,
      PRECIO: price,
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

  const headers = ['Referencia', 'Codigo', 'Descripcion', 'Precio Unitario', 'Cantidad', 'Subtotal'];
  const rows = (order.order_items || []).map((item) => [
    `"${item.product?.reference || item.reference || ''}"`,
    `"${item.product?.code || item.code || ''}"`,
    `"${(item.product?.description || '').replace(/"/g, '""')}"`,
    `"${item.unit_price}"`,
    `"${item.quantity}"`,
    `"${(item.unit_price * item.quantity).toFixed(2)}"`,
  ]);

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
