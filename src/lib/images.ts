// =============================================================================
// Shared Image Utilities — AWS S3 & Fallbacks
// =============================================================================

export const DUBROS_S3_BUCKET_URL = 'https://dubros-image-repository.s3.amazonaws.com';
export const DEFAULT_PRODUCT_PLACEHOLDER = '/images/product-placeholder.png';

/**
 * Resolves the official image URL for a product or order item.
 * Prioritizes direct S3 references, existing valid HTTP URLs, and rewrites legacy Lambda endpoints.
 */
export function resolveProductImageUrl(itemOrRef: any): string {
  if (!itemOrRef) return DEFAULT_PRODUCT_PLACEHOLDER;

  // Case 1: Pure string reference or code passed directly
  if (typeof itemOrRef === 'string') {
    const trimmed = itemOrRef.trim();
    if (!trimmed) return DEFAULT_PRODUCT_PLACEHOLDER;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return normalizeLegacyApiUrl(trimmed);
    }
    return `${DUBROS_S3_BUCKET_URL}/${encodeURIComponent(trimmed)}.jpg`;
  }

  // Case 2: Object with thumbnail_url or large_image_url
  const productObj = itemOrRef.product || itemOrRef;
  const directUrl = productObj.thumbnail_url || productObj.thumbnailUrl || productObj.large_image_url || productObj.largeImageUrl;

  if (directUrl && typeof directUrl === 'string' && directUrl.startsWith('http') && !directUrl.includes('placeholder')) {
    return normalizeLegacyApiUrl(directUrl);
  }

  // Case 3: Derive from reference or code
  const ref = (itemOrRef.reference || itemOrRef.code || productObj.reference || productObj.code || '').trim();
  if (ref) {
    return `${DUBROS_S3_BUCKET_URL}/${encodeURIComponent(ref)}.jpg`;
  }

  return DEFAULT_PRODUCT_PLACEHOLDER;
}

/**
 * Helper to rewrite old AWS Lambda API gateway URLs to direct S3 URLs
 */
export function normalizeLegacyApiUrl(url: string): string {
  if (!url) return DEFAULT_PRODUCT_PLACEHOLDER;
  return url.replace(
    'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository',
    DUBROS_S3_BUCKET_URL
  );
}

/**
 * Fallback event handler for <img> tags
 */
export function handleImageFallback(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  if (target && target.src !== DEFAULT_PRODUCT_PLACEHOLDER) {
    target.src = DEFAULT_PRODUCT_PLACEHOLDER;
  }
}
