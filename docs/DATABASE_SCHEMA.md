# DUBROS EYEWEAR — DATABASE SCHEMA & RELATIONAL ERD

Este documento detalla la estructura completa de la base de datos alojada en **Supabase (PostgreSQL 15)** que da soporte a Dubros Eyewear B2B.

---

## 1. Diagrama Entidad-Relación (Mermaid ERD)

```mermaid
erDiagram
    PROFILES ||--o{ ORDERS : "places"
    PROFILES {
        uuid id PK
        string email
        string full_name
        string company_name
        string ruc
        string phone
        string country
        string role
        timestamp created_at
    }

    BRANDS ||--o{ PRODUCTS : "produces"
    BRANDS {
        uuid id PK
        string name
        string logo_url
        boolean active
        timestamp created_at
    }

    CATEGORIES ||--o{ PRODUCTS : "classifies"
    CATEGORIES {
        uuid id PK
        string name
        string slug
        timestamp created_at
    }

    PRODUCTS ||--o{ ORDER_ITEMS : "included_in"
    PRODUCTS {
        uuid id PK
        string reference
        string code
        string description
        numeric price
        integer quantity
        string sale_type
        string material
        string gender
        integer eye_size
        integer bridge_size
        integer temple_length
        string frame_size
        boolean flex
        string thumbnail_url
        string large_image_url
        uuid brand_id FK
        uuid category_id FK
        timestamp created_at
    }

    ORDERS ||--|{ ORDER_ITEMS : "contains"
    ORDERS {
        uuid id PK
        string order_number UK
        uuid user_id FK
        string customer_email
        string customer_name
        string company_name
        string phone
        string shipping_address
        string notes
        string status
        integer total_items
        integer total_pieces
        numeric subtotal
        numeric total_amount
        string switch_order_number
        boolean switch_synced
        timestamp created_at
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        string reference
        string code
        string brand
        string material
        numeric unit_price
        integer quantity
        numeric item_subtotal
        numeric total_price
        timestamp created_at
    }

    BLOG_POSTS {
        uuid id PK
        string title
        string slug UK
        string short_description
        text content
        string featured_image_url
        string author
        string[] tags
        timestamp published_at
    }

    ERP_SYNC_LOGS {
        uuid id PK
        string sync_type
        string status
        integer records_processed
        integer records_updated
        text error_message
        timestamp created_at
    }
```

---

## 2. Diccionario de Datos por Tabla

### 2.1. `products` (Catálogo Maestro de Artículos)
Contiene las más de 5,440 referencias ópticas sincronizadas con Switch ERP.

| Columna | Tipo | Nulo | Descripción |
|---|---|---|---|
| `id` | `UUID` | NO | Llave primaria (`gen_random_uuid()`) |
| `reference` | `VARCHAR(100)` | NO | Modelo óptico (ej. `PRESTIGE211221`, `MAR-GEL220805`) |
| `code` | `VARCHAR(100)` | NO | Código de barras o SKU Switch ERP |
| `description` | `TEXT` | SÍ | Descripción técnica de la montura o accesorio |
| `price` | `NUMERIC(10,2)` | NO | **Precio unitario por pieza física** en USD |
| `quantity` | `INTEGER` | NO | Stock físico disponible en bodega Zona Libre |
| `sale_type` | `VARCHAR(20)` | NO | `'PIEZA'` o `'DOCENA'` (define regla de cobro en frontend) |
| `material` | `VARCHAR(50)` | SÍ | Acetato, Metal, TR-90, Titanio, etc. |
| `gender` | `VARCHAR(20)` | SÍ | Hombre, Mujer, Unisex, Niños |
| `eye_size` | `INTEGER` | SÍ | Calibre (Boxing ISO 8624) en mm (ej. 54) |
| `bridge_size` | `INTEGER` | SÍ | Puente nasal en mm (ej. 19) |
| `temple_length` | `INTEGER` | SÍ | Longitud de varilla en mm (ej. 145) |
| `frame_size` | `VARCHAR(30)` | SÍ | Formato combinado Boxing (ej. `54-19-145`) |
| `flex` | `BOOLEAN` | SÍ | Bisagras flexibles con resorte (`true` / `false`) |
| `thumbnail_url` | `TEXT` | SÍ | URL de imagen miniatura |
| `large_image_url` | `TEXT` | SÍ | URL de imagen alta resolución con zoom |
| `brand_id` | `UUID` | SÍ | Llave foránea a `brands.id` |
| `category_id` | `UUID` | SÍ | Llave foránea a `categories.id` |

### 2.2. `orders` (Encabezados de Pedidos)
| Columna | Tipo | Nulo | Descripción |
|---|---|---|---|
| `id` | `UUID` | NO | Llave primaria |
| `order_number` | `VARCHAR(50)` | NO | Código único (ej. `DB-260914-4821`) |
| `user_id` | `UUID` | NO | Llave foránea a `profiles.id` |
| `customer_email`| `VARCHAR(255)`| NO | Correo del comprador mayorista |
| `company_name` | `VARCHAR(255)`| SÍ | Razón social de la óptica o distribuidora |
| `total_items` | `INTEGER` | NO | Cantidad de paquetes/unidades de compra en carrito |
| `total_pieces`| `INTEGER` | NO | Total de piezas físicas reales (docenas multiplicadas x12) |
| `subtotal` | `NUMERIC(10,2)`| NO | Total monetario calculado en USD |
| `status` | `VARCHAR(30)` | NO | `'Pendiente'`, `'En Proceso'`, `'Completada'`, `'Cancelada'` |
| `switch_order_number` | `VARCHAR(50)` | SÍ | Número de orden generado al sincronizar con Switch ERP |

### 2.3. `order_items` (Líneas de Detalle de Pedido)
| Columna | Tipo | Nulo | Descripción |
|---|---|---|---|
| `id` | `UUID` | NO | Llave primaria |
| `order_id` | `UUID` | NO | Llave foránea a `orders.id` (ON DELETE CASCADE) |
| `product_id` | `UUID` | SÍ | Llave foránea a `products.id` |
| `reference` | `VARCHAR(100)` | NO | Modelo del producto ordenado |
| `code` | `VARCHAR(100)` | NO | Código Switch ERP |
| `unit_price` | `NUMERIC(10,2)` | NO | Precio unitario facturado (x12 si fue docena) |
| `quantity` | `INTEGER` | NO | Unidades ordenadas por el cliente |
| `item_subtotal` | `NUMERIC(10,2)` | NO | `unit_price * quantity` |
