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

## 📊 Dashboard de Administración

El sistema incluye un panel de control avanzado (`/dashboard`) con 12 módulos funcionales para gestionar la operación:

1. **KPIs & Inicio**: Vista general de métricas clave.
2. **Usuarios & Perfiles**: Control de roles y tipos de negocio.
3. **Gestión de Pedidos**: Sincronización simulada con el ERP Switch.
4. **Artículos & Catálogo**: Formulario de registro y carga masiva (CSV).
5. **Restricciones por País**: Matriz geográfica de marcas habilitadas por país en LATAM.
6. **Almacenamiento S3**: Gestor de imágenes alojadas (mock AWS).
7. **Control de Duplicados**: Escáner y conciliador de referencias.
8. **Promociones**: Reglas de descuento dinámico.
9. **Campañas**: CRM para envíos de correo.
10. **Leads y Contactos**: Registro comercial.
11. **Blog CMS**: Gestión de artículos.
12. **Data Wizard**: Exportador avanzado de catálogos y CSVs.

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
