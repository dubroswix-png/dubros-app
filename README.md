# Dubros B2B Web App 👓

Plataforma B2B de distribución óptica de alta fidelidad, construida para facilitar la visualización, compra y administración de monturas ópticas y gafas de sol en Latinoamérica.

## 🚀 Tecnologías Principales

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Vanilla CSS Modules y Variables CSS Globales (CSS-in-JS minimalista).
- **Temas**: Soporte integrado para Modo Claro (☀️) y Modo Oscuro (🌙) mediante `next-themes` y variables nativas.
- **Internacionalización**: Español (es) e Inglés (en) utilizando `next-intl`.
- **Base de Datos & Auth**: [Supabase](https://supabase.com) (PostgreSQL + Row Level Security).
- **Despliegue**: [Vercel](https://vercel.com/) (Totalmente estático e híbrido).

## 🛠️ Estructura del Proyecto (Clean Architecture)

El proyecto está diseñado de forma modular, separando la lógica de estado de los componentes visuales:

- `/src/app/` -> Rutas de Next.js App Router (Páginas públicas, área de cliente y dashboard admin).
- `/src/components/ui/` -> Componentes atómicos reutilizables (`Input`, `Select`, `DataTable`).
- `/src/components/catalog/` -> Componentes de lógica de dominio (ej: `ProductGrid`, `FilterSidebar`).
- `/src/context/` -> Estado global de React (`CartContext`, `FavoritesContext`).
- `/src/hooks/` -> Custom hooks (`useCatalogFilter`, `useTheme`).
- `/supabase_schema.sql` -> Esquema SQL completo y script de creación (14 tablas).

## 📊 Dashboard de Administración & Funcionalidades B2B

El sistema incluye un panel de control avanzado (`/dashboard`) para gestionar la operación:

1. **KPIs & Auditoría en Vivo**: Métricas clave en tiempo real, auditoría de campos incompletos y control de imágenes en AWS S3.
2. **Catálogo Exclusivo con Fotos**: Ocultación automática de productos sin fotografía del catálogo público; los artículos nuevos permanecen auditables en el Dashboard bajo "Sin Foto" hasta que se sube su imagen a S3.
3. **Sincronización Blindada con Switch ERP**:
   - Sincroniza precio, costo y stock en tiempo real.
   - Protege de forma estricta los campos editados manualmente (marca, categoría, descripción, fotos, medidas y género).
   - Soporte para monturas genéricas bajo la marca oficial `SIN MARCA`.
4. **Usuarios & Perfiles**: Control de roles (Administrador, Gerente, Vendedor, Cliente). Los **Gerentes** tienen permisos para crear y gestionar usuarios.
5. **Gestión de Pedidos & Filtro de Carrito**: Monitoreo de pedidos en tiempo real con filtro de "Carrito" para hacer seguimiento a órdenes en proceso de armado antes de checkout.
6. **Filtros Ópticos Extendidos**: Calibre de ojo ampliado hasta 62 mm y puente nasal hasta 26 mm.
7. **Artículos & Catálogo**: Formulario de registro, edición rápida y carga masiva (CSV).
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
