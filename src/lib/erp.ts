// =============================================================================
// ERP Switch-Soft — Connector Library
// =============================================================================
// Central module for authenticating and communicating with the Dubros ERP.
// All credentials come from environment variables (.env.local).
// This file is server-side only (never imported from client components).
// =============================================================================

import type {
  ErpAuthResponse,
  ErpArticlesResponse,
  ErpArticleDetailResponse,
  ErpClientsResponse,
  ErpVendorsResponse,
  ErpCreateOrderPayload,
  ErpCreateOrderResponse,
  ErpCreateLeadPayload,
  ErpCreateLeadResponse,
  ErpArticle,
  SupabaseProductFromERP,
} from './erp-types';

// ---------------------------------------------------------------------------
// Environment Variables
// ---------------------------------------------------------------------------
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

// ---------------------------------------------------------------------------
// Token Cache (in-memory, per-process)
// ---------------------------------------------------------------------------
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------
/**
 * Authenticate against the ERP and obtain a JWT token.
 * The token is cached in memory and reused until it expires.
 */
export async function erpAuth(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const baseUrl = getEnvVar('ERP_BASE_URL');
  const user = getEnvVar('ERP_USER');
  const pass = getEnvVar('ERP_PASS');

  const url = `${baseUrl}/autenticacion?usuario=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'AuthorizationApp': getEnvVar('ERP_AUTH_APP'),
      'TipoApp': getEnvVar('ERP_TIPO_APP'),
    },
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`ERP Auth failed (${response.status} ${response.statusText}): ${responseText.substring(0, 150)}`);
  }

  let data: ErpAuthResponse;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`El servidor ERP no devolvió JSON válido (${response.status}): ${responseText.substring(0, 150)}`);
  }

  cachedToken = data.data.token;
  // Parse expires_in (seconds) or default to 55 minutes
  const expiresInMs = (data.data?.expires_in || 3300) * 1000;
  tokenExpiresAt = Date.now() + expiresInMs;

  return cachedToken;
}

// ---------------------------------------------------------------------------
// Internal HTTP Helper
// ---------------------------------------------------------------------------
async function erpFetch<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    params?: Record<string, string | number>;
    body?: unknown;
  } = {}
): Promise<T> {
  const token = await erpAuth();
  const baseUrl = getEnvVar('ERP_BASE_URL');
  const { method = 'GET', params, body } = options;

  // Build URL with query parameters
  const url = new URL(`${baseUrl}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const headers: Record<string, string> = {
    'Authorization': token,
    'AuthorizationApp': getEnvVar('ERP_AUTH_APP'),
    'TipoApp': getEnvVar('ERP_TIPO_APP'),
    'Content-Type': 'application/json',
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
    cache: 'no-store',
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), fetchOptions);
  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`ERP API Error [${method} ${path}]: ${response.status} - ${responseText.substring(0, 150)}`);
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new Error(`ERP API no devolvió JSON válido [${method} ${path}] (${response.status}): ${responseText.substring(0, 150)}`);
  }
}

// ---------------------------------------------------------------------------
// Articles / Products
// ---------------------------------------------------------------------------
/**
 * List articles from the ERP with pagination.
 * @param page - Page number (1-based). Each page returns up to 500 articles.
 * @param inventario - Optional inventory filter.
 */
export async function erpListArticles(
  page: number = 1,
  inventario?: string
): Promise<ErpArticlesResponse> {
  return erpFetch<ErpArticlesResponse>('/apiarticulos/inventario', {
    params: {
      paginaActual: page,
      ...(inventario ? { inventario } : {}),
    },
  });
}

/**
 * Get detailed information for a single article by its barcode.
 * @param codigoBarra - The barcode/SKU code of the article.
 */
export async function erpDetailArticle(
  codigoBarra: string
): Promise<ErpArticleDetailResponse> {
  return erpFetch<ErpArticleDetailResponse>('/apiarticulos/info', {
    params: { codigoBarra },
  });
}

/**
 * Fetch ALL articles from the ERP by paginating through all pages.
 * Downloads up to 500 articles per page, iterating until all are retrieved.
 * @returns Array of all ERP articles.
 */
export async function erpFetchAllArticles(): Promise<ErpArticle[]> {
  const allArticles: ErpArticle[] = [];
  let currentPage = 1;
  let totalPages = 1;

  // Fetch first page to determine total
  const firstPageResult = await erpListArticles(1);
  const { paginacion } = firstPageResult.data;
  totalPages = Math.ceil(paginacion.total / paginacion.porPagina);
  allArticles.push(...firstPageResult.data.articulos);

  console.log(`[ERP Sync] Total articles: ${paginacion.total}, Pages: ${totalPages}`);

  // Fetch remaining pages in controlled batches of 5
  const BATCH_SIZE = 5;
  for (let batchStart = 2; batchStart <= totalPages; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, totalPages);
    const batchPromises: Promise<ErpArticlesResponse>[] = [];

    for (let page = batchStart; page <= batchEnd; page++) {
      batchPromises.push(erpListArticles(page));
    }

    const batchResults = await Promise.all(batchPromises);
    for (const result of batchResults) {
      allArticles.push(...result.data.articulos);
    }

    console.log(`[ERP Sync] Fetched pages ${batchStart}-${batchEnd} of ${totalPages}`);
  }

  return allArticles;
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------
/**
 * List B2B clients from the ERP with pagination.
 * @param page - Page number (1-based).
 */
export async function erpListClients(
  page: number = 1
): Promise<ErpClientsResponse> {
  return erpFetch<ErpClientsResponse>('/apicliente/lista', {
    params: { paginaActual: page },
  });
}

/**
 * Fetch ALL clients by paginating through all pages.
 */
export async function erpFetchAllClients() {
  const allClients: ErpClientsResponse['data']['clientes'] = [];
  let currentPage = 1;
  let totalPages = 1;

  const firstPageResult = await erpListClients(1);
  totalPages = Math.ceil(
    firstPageResult.data.paginacion.total / firstPageResult.data.paginacion.porPagina
  );
  allClients.push(...firstPageResult.data.clientes);

  for (let page = 2; page <= totalPages; page++) {
    const result = await erpListClients(page);
    allClients.push(...result.data.clientes);
  }

  return allClients;
}

/**
 * Search for a client in the ERP by email or tax ID.
 * Iterates through all pages to find a match.
 */
export async function erpFindClient(
  searchBy: { email?: string; identificacion?: string }
): Promise<ErpClientsResponse['data']['clientes'][0] | null> {
  const allClients = await erpFetchAllClients();

  return allClients.find((client) => {
    if (searchBy.email && client.email?.toLowerCase() === searchBy.email.toLowerCase()) {
      return true;
    }
    if (searchBy.identificacion && client.identificacion === searchBy.identificacion) {
      return true;
    }
    return false;
  }) || null;
}

// ---------------------------------------------------------------------------
// Vendors / Sellers
// ---------------------------------------------------------------------------
/**
 * List all vendors/sellers from the ERP.
 */
export async function erpListVendors(): Promise<ErpVendorsResponse> {
  return erpFetch<ErpVendorsResponse>('/apivendedor/lista');
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
/**
 * Create a new order in the ERP.
 * @returns The order ID, internal number, and SwitchPay payment URL.
 */
export async function erpCreateOrder(
  payload: ErpCreateOrderPayload
): Promise<ErpCreateOrderResponse> {
  return erpFetch<ErpCreateOrderResponse>('/apipedido/terminar', {
    method: 'POST',
    body: payload,
  });
}

// ---------------------------------------------------------------------------
// CRM — Leads
// ---------------------------------------------------------------------------
/**
 * Create a new lead in the ERP's CRM module.
 * Used when a visitor submits the contact form.
 */
export async function erpCreateLead(
  payload: ErpCreateLeadPayload
): Promise<ErpCreateLeadResponse> {
  return erpFetch<ErpCreateLeadResponse>('/apileads/crear', {
    method: 'POST',
    body: payload,
  });
}

// ---------------------------------------------------------------------------
// Image URL Builder
// ---------------------------------------------------------------------------
/**
 * Build the product image URL.
 * Tries the S3 image repository first (by SKU/reference),
 * falls back to the ERP's uploaded image URL.
 */
export function buildProductImageUrl(article: ErpArticle): string {
  const s3BaseUrl = process.env.ERP_IMAGE_REPO_URL;

  // If S3 repo is configured and article has a reference code, use S3
  if (s3BaseUrl && article.referencia) {
    return `${s3BaseUrl}/${article.referencia}.jpg`;
  }

  // If the ERP provides a direct image URL, use it
  if (article.imagen && !article.imagen.includes('notimage')) {
    return article.imagen;
  }

  // Default placeholder
  return '/images/product-placeholder.png';
}

// ---------------------------------------------------------------------------
// Mapper: ERP Article → Supabase Product
// ---------------------------------------------------------------------------
/**
 * Transform an ERP article into the format expected by the Supabase `products` table.
 */
export function mapArticleToProduct(article: ErpArticle): SupabaseProductFromERP {
  return {
    sku: article.codigo || article.codigoBarra,
    name: article.descripcion,
    price: parseFloat(article.precio) || 0,
    cost: parseFloat(article.costo) || 0,
    stock: typeof article.disponible === 'number' ? article.disponible : parseFloat(String(article.disponible)) || 0,
    category: article.rubro,
    material: article.subrubro,
    brand: article.marca,
    image_url: buildProductImageUrl(article),
    erp_id: article.id,
    erp_rubro_id: article.rubroId,
    erp_subrubro_id: article.subrubroId,
    erp_marca_id: article.marcaId,
    tax_rate: parseFloat(article.articuloImpuesto) || 0,
    unit: article.unidadmedida || 'PIEZA',
    last_synced_at: new Date().toISOString(),
  };
}
