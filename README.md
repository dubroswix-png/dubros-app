# Dubros B2B Web App 👓

Plataforma B2B de distribución óptica de alta fidelidad, construida para facilitar la visualización, compra y administración de monturas ópticas y gafas de sol en Latinoamérica.

## 🚀 Tecnologías Principales

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router con Turbopack) + React 19
- **Lenguaje**: TypeScript
- **Estilos**: Vanilla CSS Modules y Variables CSS Globales (CSS-in-JS minimalista).
- **Temas**: Soporte integrado para Modo Claro (☀️) y Modo Oscuro (🌙) mediante `next-themes` y variables nativas.
- **Internacionalización**: Español (es) e Inglés (en) utilizando `next-intl`.
- **Base de Datos & Auth**: [Supabase](https://supabase.com) (PostgreSQL 15 + Row Level Security + Google OAuth).
- **Dominio & Despliegue**: [Vercel](https://vercel.com/) con dominio canónico oficial [www.dubros.com](https://www.dubros.com) y redirección 301.
- **SEO & PWA**: Dynamic XML Sitemap, Robots.txt, Web Manifest, favicons SVG/PNG y Schema.org JSON-LD.

## 🛠️ Estructura del Proyecto (Clean Architecture)

El proyecto está diseñado de forma modular, separando la lógica de estado de los componentes visuales:

- `/src/app/` -> Rutas de Next.js App Router (Páginas públicas, área de cliente y dashboard admin).
- `/src/components/ui/` -> Componentes atómicos reutilizables (`Input`, `Select`, `DataTable`).
- `/src/components/catalog/` -> Componentes de lógica de dominio (ej: `ProductGrid`, `FilterSidebar`).
- `/src/context/` -> Estado global de React (`AuthContext`, `CartContext`, `FavoritesContext`).
- `/src/hooks/` -> Custom hooks (`useCatalogFilter`, `useTheme`).
- `/database/migrations/` -> Scripts de migración SQL para Supabase.
- `/docs/` -> Documentación técnica de arquitectura, base de datos y pantallas.

## 📊 Dashboard de Administración & Funcionalidades B2B

El sistema incluye un panel de control avanzado (`/dashboard`) para gestionar la operación:

1. **KPIs & Auditoría en Vivo**: Métricas clave en tiempo real, auditoría de campos incompletos y control de imágenes en AWS S3.
2. **Catálogo Exclusivo con Fotos**: Ocultación automática de productos sin fotografía del catálogo público; los artículos nuevos permanecen auditables en el Dashboard bajo "Sin Foto" hasta que se sube su imagen a S3.
3. **Catálogo Unificado por Pieza**: Venta directa y transparente por unidad individual en todas las monturas y aros ópticos.
4. **Sincronización Blindada con Switch ERP**:
   - Sincroniza precio, costo y stock en tiempo real asegurando que solo productos con inventario físico confirmado pasen a órdenes de Switch ERP.
   - Protege de forma estricta los campos editados manualmente (marca, categoría, descripción, fotos, medidas y género).
   - Soporte para monturas genéricas bajo la marca oficial `SIN MARCA`.
5. **Gestión Integral de Usuarios y CRM**:
   - Control de roles (`admin`, `manager`, `client`, `pending`).
   - Modal de edición completa de datos comerciales (RUC/Tax ID, dirección de despacho, código ERP).
   - Selector telefónico inteligente con autocompletado de prefijo por país.
   - **Captura de Cumpleaños**: Campo de fecha de nacimiento (`birth_date`), distintivo `🎂` en listados y columna dedicada en la exportación CSV.
6. **Ciclo de Pedidos Simplificado**:
   - Flujo directo: `Carrito` ➔ `Pendiente` ➔ `Completado` (con opción a `Cancelado`).
   - Monitoreo de carritos activos en servidor y restauración automática cuando el cliente inicia sesión.
   - Exportación de órdenes a formato XLSX nativo de Switch ERP.
7. **Filtros Ópticos Extendidos**: Calibre de ojo ampliado hasta 62 mm y puente nasal hasta 26 mm, con filtrado inteligente de marcas con stock activo.
8. **Campañas & CRM**: Envío masivo de promociones y boletines segmentados con SendGrid.
9. **Métodos de Pago**: Aceptación de transferencias bancarias, tarjetas y **Binance Pay**.
10. **Dirección Principal**: Zona Libre de Colón Interplaza Piso 4- Local 514, Colón, Panamá.

## ⚙️ Configuración y Despliegue Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```
2. **Ejecutar el servidor local:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## ☁️ Base de Datos (Supabase)

Para desplegar la base de datos:
1. Crea un nuevo proyecto en Supabase.
2. Copia el contenido de `supabase_schema.sql`.
3. Pega el código en el **SQL Editor** de Supabase y ejecútalo (Run).
4. Agrega las credenciales generadas al entorno (Vercel o `.env` local).

### Variables de Entorno Requeridas:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<TU-PROYECTO>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```
