export interface CRMAuthResponse {
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
      clienteImpuesto: string;
      clienteImpuestoCodigo: string;
    };
    vendedor: {
      id: number;
      nombre: string;
    };
    expires_in: string;
    logo: string;
    expires_at: string;
    http_code: string;
  };
}

/**
 * Autentica contra el CRM / ERP (Switch-Soft) y devuelve el token JWT
 * y los detalles de sesión (vendedor, sucursal, etc).
 */
export async function authenticateCRM(): Promise<CRMAuthResponse> {
  // Leemos desde las variables de entorno, con fallbacks a los datos que proporcionaste
  const baseUrl = process.env.CRM_AUTH_URL || 'https://dubros.switch-soft.com/autenticacion';
  const user = process.env.CRM_USER || 'master';
  const pass = process.env.CRM_PASS || 'master';

  // Construimos la URL con los query parameters
  const url = new URL(baseUrl);
  url.searchParams.append('usuario', user);
  url.searchParams.append('password', pass);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'AuthorizationApp': 'true',
      'tipoapp': 'zonalibre',
      'Content-Type': 'application/json',
    },
    // cache: 'no-store' // Descomentar si el token cambia frecuentemente y no queremos caché
  });

  if (!response.ok) {
    throw new Error(`Error autenticando en el CRM: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
