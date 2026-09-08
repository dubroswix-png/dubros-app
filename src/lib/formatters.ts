// =============================================================================
// Shared Formatters — Currency, Dates, and Codes
// =============================================================================

/**
 * Formats a numeric price to standard currency display.
 * Default: USD with 2 decimals (e.g. "$120.00" or "$120,00" if Spanish format is requested)
 */
export function formatPrice(amount: number | string | null | undefined, useCommaDecimal = false): string {
  const num = typeof amount === 'number' ? amount : Number(amount) || 0;
  if (useCommaDecimal) {
    return `$${num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${num.toFixed(2)}`;
}

/**
 * Formats a date string into readable Spanish format.
 * Example: "13 de enero de 2026" or "Septiembre 26, 2025" (style matching Bubble)
 */
export function formatDateSpanish(dateInput: string | Date | null | undefined, style: 'standard' | 'bubble' = 'bubble'): string {
  if (!dateInput) return 'Fecha no disponible';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    const month = d.toLocaleDateString('es-ES', { month: 'long' });
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

    if (style === 'bubble') {
      return `${capitalizedMonth} ${d.getDate()}, ${d.getFullYear()}`;
    }

    return `${d.getDate()} de ${month} de ${d.getFullYear()}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats order number for display.
 * Strips internal prefixes if needed or formats cleanly.
 */
export function formatOrderNumber(orderNumber?: string | null, keepPrefix = false): string {
  if (!orderNumber) return '#N/A';
  if (keepPrefix) return orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`;
  // Remove "DB-2026-" or "DB-" prefix for concise view if requested
  const clean = orderNumber.replace(/^DB(-\d{4})?-/, '');
  return clean.startsWith('#') ? clean : `#${clean}`;
}

/**
 * Clean and normalize product model references.
 */
export function cleanReference(ref?: string | null): string {
  if (!ref) return '';
  return ref.trim().toUpperCase();
}
