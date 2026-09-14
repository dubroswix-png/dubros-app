# DUBROS EYEWEAR — MAPA DE RUTAS Y ASCII ART MOCKUPS

Inventario completo de pantallas y rutas de la aplicación Next.js App Router (44 rutas) junto a mockups visuales en ASCII Art.

---

## 1. Inventario de Rutas

### 1.1. Portal Público & Catálogo
| Ruta | Descripción |
|---|---|
| `/` | Landing page principal con carrusel de colecciones y marcas |
| `/catalogo` | Catálogo B2B con filtros multidimensionales (marca, género, material, flex, docena/pieza) |
| `/catalogo/[id]` | PDP (Página de Detalle de Producto) con zoom óptico interactivo y especificaciones Boxing |
| `/marcas` | Directorio de marcas oficiales |
| `/nosotros` | Historia de Dubros, presencia en Zona Libre de Colón y propuesta de valor |
| `/contacto` | Formulario de contacto directo y mapa interactivo |
| `/blog` | Listado de artículos de tendencias ópticas y salud visual |
| `/blog/[slug]` | Lectura de artículo de blog |

### 1.2. Área de Cliente B2B (`/mi-cuenta`)
| Ruta | Descripción |
|---|---|
| `/login` | Inicio de sesión con Supabase Auth |
| `/registro` | Registro para clientes mayoristas y ópticas |
| `/mi-cuenta` | Panel general del cliente |
| `/mi-cuenta/carrito` | Carrito de pedidos con desglose de docenas, piezas físicas y envío WhatsApp |
| `/mi-cuenta/pedidos` | Historial de pedidos realizados con estados y exportación |
| `/mi-cuenta/pedidos/[id]` | Detalle de orden con opciones de descarga XLSX/CSV |
| `/mi-cuenta/favoritos` | Lista de referencias guardadas |
| `/mi-cuenta/perfil` | Datos fiscales de la empresa (RUC, dirección de entrega) |

### 1.3. Dashboard de Administración (`/dashboard`)
| Ruta | Descripción |
|---|---|
| `/dashboard` | Resumen de métricas de ventas, órdenes pendientes y stock crítico |
| `/dashboard/articulos` | Maestro de productos con editor de `sale_type` (Pieza/Docena) y precios |
| `/dashboard/pedidos` | Gestión de estados de órdenes de clientes |
| `/dashboard/switch-erp` | Consola de sincronización con Switch ERP |
| `/dashboard/inventario` | Monitor de stock de bodega |
| `/dashboard/importar-ocr` | Asistente de importación con OCR de medidas de montura |

---

## 2. Mockups de Pantallas en ASCII Art

### 2.1. Catálogo B2B (`/catalogo`)

```
+----------------------------------------------------------------------------------------------------+
|  [DUBROS LOGO]      Inicio   Catálogo   Blog   Contacto   Pedidos       (ES|ES)  [Heart]  [Cart(3)]  |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  CATÁLOGO MAYORISTA (5,446 Referencias)                                                            |
|  Precios B2B directos desde Zona Libre de Colón                                                    |
|                                                                                                    |
|  [ Buscar referencia o código...              ]  [ Marca: Todas v ]  [ Venta: DOCENA v ]  [Filtrar]|
|                                                                                                    |
|  +---------------------------+  +---------------------------+  +---------------------------+       |
|  | [IMAGEN MONTURA PRESTIGE] |  | [IMAGEN ESTUCHE ST005]    |  | [IMAGEN MAR-GEL DOCENA]   |       |
|  |                           |  |                           |  |                           |       |
|  | [Stock: 289]              |  | [Stock: 787]              |  | [Stock: 415]              |       |
|  | PRESTIGE  [Docena 12 pzs] |  | S-M       [Docena 12 pzs] |  | MAR-GEL   [Docena 12 pzs] |       |
|  | PRESTIGE211221            |  | ST005BROWN                |  | MAR-GEL220805             |       |
|  | Aros ópticos acetato      |  | Estuche rígido café       |  | Aros ópticos acetato      |       |
|  | ------------------------- |  | ------------------------- |  | ------------------------- |       |
|  | PRECIO DOCENA (12 pzs)    |  | PRECIO DOCENA (12 pzs)    |  | PRECIO DOCENA (12 pzs)    |       |
|  | $27.00                    |  | $7.56                     |  | $63.96                    |       |
|  | ($2.25 c/u)               |  | ($0.63 c/u)               |  | ($5.33 c/u)               |       |
|  | [♥] [ + Agregar 1 Docena] |  | [♥] [ + Agregar 1 Docena] |  | [♥] [ + Agregar 1 Docena] |       |
|  +---------------------------+  +---------------------------+  +---------------------------+       |
|                                                                                                    |
|  << Anterior   [ 1 ]  2  3  4  5 ... 455   Siguiente >>                                            |
+----------------------------------------------------------------------------------------------------+
```

### 2.2. Detalle de Producto PDP (`/catalogo/[id]`)

```
+----------------------------------------------------------------------------------------------------+
|  Inicio > Catálogo > MAR-GEL220805                                                                 |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  +----------------------------------+   MAR-GEL                                            [♥ Fav] |
|  |                                  |   MAR-GEL220805                                              |
|  |       [ FOTO EN ALTA RES ]       |   AROS OPTICOS ACETATO MAR-GEL                               |
|  |     + LUPA / ZOOM ACTIVO         |                                                              |
|  |                                  |   Modelo: MAR-GEL220805       Marca: Mar-gel                 |
|  |                                  |   Material: Acetato           Género: Mujer                  |
|  |                                  |   Flexibilidad: [ Con Flex ]  Tipo de Venta: [📦 Por Docena] |
|  +----------------------------------+                                                              |
|  [ Miniatura 1 ] [ Miniatura 2 ]        +--------------------------------------------------------+ |
|                                         | 👓 Dimensiones Ópticas (ISO 8624 Boxing)    [54-19-145]| |
|                                         |  Calibre (Ojo): 54mm | Puente: 19mm | Varilla: 145mm   | |
|                                         +--------------------------------------------------------+ |
|                                                                                                    |
|                                         PRECIO POR DOCENA (12 PZS)                                 |
|                                         $63.96 / docena                                            |
|                                         ($5.33 por pieza)                                          |
|                                                                                                    |
|                                         [ 🛍️ Agregar 1 Docena al Carrito ]                          |
+----------------------------------------------------------------------------------------------------+
```

### 2.3. Carrito de Pedido B2B (`/mi-cuenta/carrito`)

```
+----------------------------------------------------------------------------------------------------+
|  🛒 MI CARRITO DE PEDIDO                                                                           |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  ARTÍCULOS SELECCIONADOS                                RESUMEN DEL PEDIDO                         |
|  +------------------------------------------------+    +-----------------------------------------+ |
|  | [IMG]  MAR-GEL220805                           |    | Notas de Despacho (Opcional):           | |
|  |        Cód: MAR-GEL220805 | Talla 54           |    | [ Enviar por vía aérea / DHL        ]   | |
|  |        $63.96 / docena ($5.33 c/u)             |    | --------------------------------------- | |
|  |        [-] [ 2 docenas (24 pzs) ] [+]  $127.92 |    | Unidades de Pedido: 3 unidades          | |
|  |        [ Eliminar ]                            |    | Total de Piezas Físicas: 36 piezas      | |
|  +------------------------------------------------+    | --------------------------------------- | |
|  | [IMG]  ST005BROWN (Estuche)                    |    | SUBTOTAL ESTIMADO:                      | |
|  |        Cód: ST005BROWN                         |    | $135.48 USD                             | |
|  |        $7.56 / docena ($0.63 c/u)              |    |                                         | |
|  |        [-] [ 1 docena  (12 pzs) ] [+]    $7.56 |    | [🛡️ Precios B2B Zona Libre de Colón]     | |
|  |        [ Eliminar ]                            |    |                                         | |
|  +------------------------------------------------+    | [ ENVIAR PEDIDO AHORA -> ]              | |
|                                                        +-----------------------------------------+ |
+----------------------------------------------------------------------------------------------------+
```
