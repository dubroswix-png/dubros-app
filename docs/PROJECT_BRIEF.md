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

### 2.2. Unidades de Venta y Regla de Precios (`PIEZA` vs `DOCENA`)
- **Venta por Pieza (`PIEZA`)**:
  - La unidad mínima de compra es 1 unidad física.
  - El precio mostrado y facturado es el precio unitario directo.
- **Venta por Docena (`DOCENA`)**:
  - Aplica a estuches (`ST005BROWN`, etc.), cordones (`108RED`, etc.) y monturas específicas presentadas en paquetes de 12 unidades (ej. Prestige, Dreamy, Goretty, etc.).
  - **Base de Datos y ERP**: Almacenan siempre el precio unitario por pieza individual para mantener la consistencia del inventario por unidad física en Switch ERP.
  - **Experiencia de Usuario (Frontend)**:
    - Etiqueta clara: `Precio DOCENA (12 pzs)`.
    - Precio calculado en pantalla: `precio_unitario * 12`.
    - Desglose informativo: `($X.XX c/u)`.
    - El carrito agrega 1 unidad de compra = 1 docena (12 piezas físicas).
  - **Sincronización con Switch ERP**:
    - El exportador a Excel (`Switch_Pedido_*.xlsx`) exporta automáticamente `CANTIDAD: cantidad_docenas * 12` al precio unitario `precio_pieza`.

### 2.3. Reglas de Catálogo y Sincronización Switch ERP
- **Filtrado Automático de Productos sin Foto (Opción A)**:
  - Los productos recién ingresados en Switch ERP suelen demorar hasta 2 semanas en ser fotografiados. Para proteger la estética profesional del catálogo B2B, **todo artículo sin fotografía real verificada en AWS S3 se oculta automáticamente del catálogo público**, de las colecciones y de los productos destacados.
  - Los artículos sin foto permanecen activos y auditables en el Dashboard administrativo (`/dashboard`), permitiendo al equipo monitorear qué referencias están pendientes de fotografía y cargar sus imágenes cuando estén listas.
  - En cuanto se asocia o sube una imagen válida a AWS S3 (con soporte para `.jpg`, `.JPG`, `.png`, `.PNG`, `.jpeg`, `.webp`), el producto se hace visible de inmediato en el catálogo público.
- **Protección de Campos Manuales**:
  - La sincronización periódica con Switch ERP (`/api/admin/sync-erp`) **únicamente actualiza precio, costo, stock (`quantity`) y fecha de actualización**.
  - Los campos editados manualmente por el equipo (`marca`, `categoría`, `descripción`, `fotos`, `material`, `género`, `flex`, `calibre`, `puente`) **nunca son sobreescritos por Switch ERP**.
- **Gestión de Marca Genérica (`SIN MARCA`)**:
  - Los productos genéricos o sin marca registrada ingresados en Switch ERP quedan asignados a la marca oficial `SIN MARCA`. Si el equipo edita un producto y le asigna una marca comercial real (como *LCT*, *Verona*, *Mantovanni*), dicha asignación queda protegida.
- **Medidas Ópticas Ampliadas**:
  - Calibres de ojo de hasta 62 mm y puentes nasales de hasta 26 mm para abarcar monturas de gran tamaño y acetatos especiales.
- **Seguimiento de Carritos en Pedidos**:
  - El módulo de pedidos incluye la vista y filtro de "Carrito", permitiendo al equipo de ventas monitorear las órdenes en armado antes de su confirmación final.
- **Permisos de Roles**:
  - Los usuarios con rol de **Gerente** tienen facultades para crear y gestionar usuarios comerciales.

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
