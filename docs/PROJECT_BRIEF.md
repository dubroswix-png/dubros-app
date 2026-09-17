# DUBROS EYEWEAR — PROJECT BRIEF & ARQUITECTURA TÉCNICA

## 1. Visión General del Proyecto
**Dubros Eyewear** es una plataforma B2B mayorista de distribución óptica con sede en la Zona Libre de Colón, Panamá. Con más de 25 años de trayectoria en el mercado latinoamericano, la plataforma digital permite a ópticas independientes, cadenas de retail y distribuidores internacionales explorar un catálogo de más de 5,400 referencias, armar pedidos en volumen, gestionar órdenes y sincronizar pedidos directamente con el software de gestión empresarial **Switch ERP**.

---

## 2. Modelo de Negocio Mayorista (B2B)

### 2.1. Reglas de Acceso y Visibilidad
- **Público / Visitante no autenticado**:
  - Puede explorar el catálogo completo, fotos en alta resolución, zoom óptico interactivo y especificaciones técnicas (calibre, puente, varilla, material, flex).
  - Los precios se mantienen **ocultos** (badge *"Inicia sesión para ver precios B2B"*).
- **Cliente B2B Autenticado**:
  - Acceso a precios mayoristas en dólares (USD).
  - Puede añadir artículos al carrito y enviar pedidos formales.
- **Administrador**:
  - Acceso al dashboard interno de gestión (`/dashboard`), control de inventario Switch ERP, importaciones masivas OCR, auditoría de precios y exportación de pedidos en formato XLSX nativo de Switch.

### 2.2. Unidades de Venta y Catálogo Unificado
- **Venta Unificada por Pieza Individual (`PIEZA`)**:
  - Todo el catálogo mayorista opera con venta y tarificación transparente por pieza individual, facilitando la selección de referencias y combinación de modelos para ópticas y cadenas.
  - Se sincroniza con Switch ERP manteniendo el precio unitario y cantidad física exacta en inventario.
  - En la creación de órdenes de Switch ERP, solo se incluyen productos que cuenten con stock confirmado en bodega.

### 2.3. Reglas de Catálogo y Sincronización Switch ERP
- **Filtrado Automático de Productos sin Foto**:
  - Todo artículo sin fotografía real verificada en AWS S3 se oculta automáticamente del catálogo público, manteniéndose auditable en el Dashboard administrativo bajo "Sin Foto" hasta que se cargue su imagen.
  - En cuanto se asocia una foto válida (`.jpg`, `.JPG`, `.png`, `.PNG`, `.webp`), el artículo se publica inmediatamente.
- **Filtrado Dinámico de Marcas**:
  - En los filtros del catálogo público solo se listan aquellas marcas que tienen stock físico real disponible en inventario.
- **Persistencia y Restauración Automática del Carrito**:
  - Al iniciar sesión, el sistema detecta y restaura automáticamente el carrito que el cliente tenía activo en el servidor (`orders` con estado `Carrito`).
- **Protección de Campos Manuales**:
  - La sincronización periódica con Switch ERP (`/api/admin/sync-erp`) únicamente actualiza precio, costo, stock (`quantity`) y fecha de actualización.
  - Los campos editados manualmente (`marca`, `categoría`, `descripción`, `fotos`, `material`, `género`, `flex`, `calibre`, `puente`) nunca son sobreescritos.
- **Gestión de Marca Genérica (`SIN MARCA`)**:
  - Los productos sin marca registrada se asignan a `SIN MARCA` y pueden reasignarse comercialmente sin riesgo de sobreescritura.
- **Medidas Ópticas Ampliadas**:
  - Calibres de ojo de hasta 62 mm y puentes nasales de hasta 26 mm.

### 2.4. Ciclo de Vida de Pedidos Simplificado
- **Flujo Directo**: `Carrito` ➔ `Pendiente` ➔ `Completado` (o `Cancelado`).
  - `Carrito`: Orden en construcción por parte del cliente.
  - `Pendiente`: Pedido formal enviado por el cliente para revisión y despacho de bodega.
  - `Completado`: Pedido confirmado, facturado y despachado por administración (reemplaza al anterior término "Procesado").
  - Se omite el estado redundante "En Proceso" para una operación más ágil.

### 2.5. Gestión Integral de Clientes, CRM y Cumpleaños
- **Captura de Fecha de Nacimiento / Cumpleaños**:
  - Registro en creación de usuario, edición administrativa y en el perfil de cliente (`/mi-cuenta/perfil`).
  - Visualización directa en listados (`🎂 YYYY-MM-DD`) y exportación en CSV para campañas de felicitaciones y beneficios de aniversario.
- **Edición y Formalización de Perfiles**:
  - Modificación completa de RUC/Tax ID, tipo de negocio, dirección de entrega física, prefijo telefónico internacional automático y rol.
  - Asignación y unificación de códigos de cliente con Switch ERP (`erp_client_code` / `client_code`).
- **Permisos de Roles**:
  - Administradores y Gerentes disponen de permisos para crear, editar y auditar cuentas comerciales.

### 2.6. Dominio Oficial y Presencia SEO
- **Dominio Canónico**: Redirección 301 forzada de `dubros-app.vercel.app` hacia `https://www.dubros.com`.
- **Google OAuth**: Redirección directa y segura a `www.dubros.com/catalogo`.
- **Suite SEO**: Sitemap XML dinámico, robots.txt, manifest para PWA, favicons vectoriales y metadatos JSON-LD Schema.org / Open Graph sin redundancias en títulos.

---

## 3. Stack Tecnológico

| Capa | Tecnología | Propósito |
|---|---|---|
| **Framework** | Next.js 16.2.11 (App Router) + React 19 | SSR, Streaming, Server Actions, Dynamic Routes |
| **Estilos** | CSS Variables nativas (`globals.css`) + Turbopack | Alto rendimiento, sin dependencias pesadas de build |
| **Base de Datos** | Supabase (PostgreSQL 15) | Gestión relacional, RLS, Storage de imágenes, Auth |
| **ERP Integrado** | Switch ERP (API REST + Import XLSX) | Control maestro de inventario, stock y facturación |
| **Iconografía** | Lucide React | Iconos vectoriales coherentes |
| **Exportaciones** | SheetJS (`xlsx`) | Generación en memoria de planillas XLSX y CSV |
| **Confetti & Feedback** | Canvas Confetti | Celebración de pedido exitoso |

---

## 4. Estructura del Código

```
dubros-app/
├── public/
│   ├── images/              # Logos (SVG y PNG), banners y marcas
│   ├── productos_docena_actuales_574.csv  # Reporte de productos docena
│   └── favicon.ico
├── src/
│   ├── app/                 # Next.js App Router (44 rutas)
│   │   ├── api/             # Endpoints server-side (checkout, ERP sync, OCR)
│   │   ├── catalogo/        # Catálogo paginado, filtros y PDP con zoom
│   │   ├── mi-cuenta/       # Carrito, pedidos y perfil B2B
│   │   ├── dashboard/       # Panel administrativo (artículos, pedidos, ERP)
│   │   └── globals.css      # Sistema de diseño con variables semánticas
│   ├── components/          # Componentes modulares reutilizables
│   │   ├── catalog/         # ProductCard, FilterBar, ImageZoom, Skeletons
│   │   ├── cart/            # CartDrawer flotante
│   │   └── layout/          # Navbar, Footer, WhatsAppWidget
│   ├── context/             # React Context Providers (Auth, Cart, Favs, Lang, Toast)
│   ├── lib/                 # Librerías cliente/servidor (Supabase, Switch ERP, OCR)
│   └── types/               # Modelos TypeScript estrictos
└── docs/                    # Documentación técnica del proyecto
```
