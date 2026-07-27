// =============================================================================
// ERP Switch-Soft — TypeScript Type Definitions
// =============================================================================
// These types map directly to the JSON responses from the ERP API.
// All sensitive credentials are stored in environment variables (.env.local).
// =============================================================================

// --- Authentication ---
export interface ErpAuthResponse {
  data: {
    token: string;
    sucursalId: number;
    vendedorId: number;
    codigoPais: string;
    registroBancos: string;
    registroTarjetas: string;
    cliente: {
      id: number;
      nombre: string;
      codigo: string;
      clienteImpuesto: string | number;
      clienteImpuestoCodigo: string;
    };
    vendedor: {
      id: number;
      nombre: string;
    };
    expires_in: number;
    logo: string;
    expires_at: string;
    http_code?: string;
  };
  http_code?: string;
}

// --- Articles / Products ---
export interface ErpArticle {
  id: number;
  codigo: string;
  descripcion: string;
  referencia?: string;
  imagen: string;
  codigoBarra: string;
  codigoBarraId: number;
  costo: string;
  precio: string;
  saldo?: number;
  disponible: number;
  tipoArticulo: string;
  rubroId: number;
  rubro: string;           // Category (e.g., "AROS OPTICOS", "LENTE DE SOL")
  subrubroId: number;
  subrubro: string;         // Material/Subcategory (e.g., "PASTA", "METAL")
  marcaId: number;
  marca: string;            // Brand (e.g., "RAY-BAN", "CANDY COLORS")
  articuloImpuestoId?: number;
  articuloImpuesto: string;
  articuloImpuestoCodigo: string;
  unidadmedidaId: number;
  unidadmedida: string;
  listaprecoId?: number;
  proveedorId?: number;
  proveedor?: string;
  fechacreacion?: string;
  cantidadAgregar?: number;
  bonificacion?: string;
}

export interface ErpArticlesResponse {
  data: {
    articulos: ErpArticle[];
    paginacion: ErpPagination;
  };
  http_code: string;
}

export interface ErpArticleDetailResponse {
  data: {
    articulo: ErpArticle;
  };
  http_code: string;
}

// --- Clients ---
export interface ErpClient {
  id: number;
  codigo: string;
  nombre: string;
  razonsocial: string;
  tipocomercio: string;
  email: string;
  identificacion: string;
  dv: string;
  telefono: string;
  celular: string;
  fax: string;
  fechaNacimiento: string;
  sexo: string;
  clienteImpuesto: number;
  clienteImpuestoCodigo: string;
  direccion: string;
  fechaCreacion: string;
  vendedorId: number;
  vendedor: string;
  categoriaId?: string;
  categoria?: string;
  industriaId?: string;
  industria?: string;
  zonaId?: string;
  zona?: string;
  tamanoId?: string;
  tamano?: string;
  referenciaId?: string;
  referencia?: string;
}

export interface ErpClientsResponse {
  data: {
    clientes: ErpClient[];
    paginacion: ErpPagination;
  };
  http_code: string;
}

// --- Vendors / Sellers ---
export interface ErpVendor {
  id: number;
  nombre: string;
}

export interface ErpVendorsResponse {
  data: {
    vendedores: ErpVendor[];
    paginacion: ErpPagination;
  };
  http_code: string;
}

// --- Orders ---
export interface ErpCreateOrderPayload {
  vendedorId: number;
  clienteId: number;
  articulos: ErpOrderArticle[];
}

export interface ErpOrderArticle {
  articuloId: number;
  cantidad: number;
  precio?: number;
}

export interface ErpCreateOrderResponse {
  data: {
    mensaje: string;
    numeroInterno: string;
    pedidoId: string;
    clienteEmail: string;
    urlswitchpay: string;
  };
  http_code: string;
}

// --- CRM Leads ---
export interface ErpCreateLeadPayload {
  nombre: string;
  celular: string;
  email: string;
  asunto: string;
}

export interface ErpCreateLeadResponse {
  response: {
    http_code: string;
    message: string;
    data: {
      nombre: string;
      celular: string;
      email: string;
      asunto: string;
      empresa: string;
      telefono: string;
      monto: string;
      usuarioId: number;
      vendedorId: number;
      crmleadetapaId: number;
      fechaCreacion: string;
      fechaEdicion: string;
      proximaAccion: string;
      updated_at: string;
      created_at: string;
      Id: number;
    };
  };
}

// --- Pagination ---
export interface ErpPagination {
  porPagina: number;
  paginaActual: number;
  total: number;
}

// --- Mapeo ERP → Supabase Products ---
export interface SupabaseProductFromERP {
  sku: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  material: string;
  brand: string;
  image_url: string;
  erp_id: number;
  erp_rubro_id: number;
  erp_subrubro_id: number;
  erp_marca_id: number;
  tax_rate: number;
  unit: string;
  last_synced_at: string;
}
