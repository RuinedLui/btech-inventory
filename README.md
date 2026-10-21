# B-TECH — Sistema de Gestión de Inventario

Aplicación web para registrar, consultar y editar productos de inventario, con cálculo de subtotal, descuento por selección, base imponible, IVA y total. El frontend consume una API REST; las validaciones y los cálculos oficiales se ejecutan en el backend.

## Stack tecnológico

| Capa | Tecnologías |
|---|---|
| Frontend | React 18, TypeScript, Vite 5, CSS con variables, Lucide React |
| Backend | Node.js, Express 4, TypeScript, tsx (desarrollo) |
| Monorepo | pnpm workspaces, concurrently |
| Almacenamiento | Repositorio en memoria |

## Requisitos previos

- Node.js 18 o superior.
- pnpm 9 o superior (`npm install -g pnpm` o `corepack enable`).

## Instalación

Desde la raíz del proyecto:

```bash
pnpm install
```

Se instalan las dependencias de ambos paquetes con un único `pnpm-lock.yaml`.

## Ejecución

| Comando | Descripción |
|---|---|
| `pnpm dev` | Inicia backend y frontend en paralelo. |
| `pnpm dev:backend` | Inicia solo la API. |
| `pnpm dev:frontend` | Inicia solo la aplicación web. |
| `pnpm build` | Compila ambos paquetes (`backend/dist`, `frontend/dist`). |

| Servicio | URL |
|---|---|
| Aplicación | http://localhost:5173 |
| API | http://localhost:3001 |

Ambos puertos son fijos. Si alguno está ocupado, el servicio correspondiente termina con un mensaje de error en lugar de usar otro puerto. El backend acepta la variable `PORT` para cambiar el suyo.

En desarrollo, Vite redirige `/api` al backend mediante su proxy, por lo que el frontend no contiene URLs absolutas. Para apuntar a otra API se puede definir `VITE_API_URL`.

## Estructura

```text
btech-inventory/
├── backend/
│   └── src/
│       ├── controllers/    Traducción entre HTTP y el servicio
│       ├── data/           Productos iniciales
│       ├── repositories/   Contrato e implementación en memoria
│       ├── routes/         Definición de endpoints
│       ├── services/       Lógica de inventario y estrategia de descuento
│       ├── types/          Entidades y DTO
│       ├── validators/     Validación de productos
│       ├── app.ts          Composición de dependencias
│       └── server.ts       Arranque del servidor HTTP
├── frontend/
│   └── src/
│       ├── components/     inventory/, summary/, ui/
│       ├── hooks/          useInventory, useInventorySummary
│       ├── pages/          InventoryPage
│       ├── services/       Cliente de la API REST
│       ├── styles/         Estilos globales y tokens visuales
│       └── types/          Contratos TypeScript
├── package.json            Scripts del monorepo
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

## Arquitectura

**Backend.** `app.ts` es el único punto donde se instancian las dependencias: crea el repositorio, la estrategia de descuento y el servicio, y los inyecta en el controlador.

- `InventoryService` depende de la interfaz `IInventoryRepository`, no de la implementación en memoria. Sustituir el almacenamiento solo requiere otra clase que implemente esa interfaz y cambiarla en `app.ts`.
- El descuento se modela con `IDiscountStrategy`. La regla vigente (`SelectedPercentageDiscountStrategy`, 5 %) puede reemplazarse sin modificar el servicio.
- `InventoryValidator` concentra las reglas de validación y devuelve datos normalizados; el servicio decide qué hacer con el resultado y el controlador solo traduce a códigos HTTP.

**Frontend.** `InventoryPage` compone la pantalla a partir de dos hooks:

- `useInventory`: carga de productos, alta y edición.
- `useInventorySummary`: selección, activación del descuento y consulta del resumen al backend.

Los componentes son presentacionales; ninguno implementa reglas de cálculo. Toda la comunicación HTTP está en `services/inventoryApi.ts`.

## API REST

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/products` | Lista los productos. | 200 |
| POST | `/api/products` | Registra un producto. | 201, 400 |
| POST | `/api/products/batch` | Registra entre 1 y 20 productos de forma atómica. | 201, 400 |
| PUT | `/api/products/:code` | Actualiza un producto, incluido su código. | 200, 400, 404 |
| POST | `/api/inventory/summary` | Calcula subtotal, descuento, base imponible, IVA y total. | 200 |
| GET | `/health` | Estado del servidor. | 200 |

**Registro múltiple**

```http
POST /api/products/batch
Content-Type: application/json

{
  "products": [
    { "code": "RTR-01", "description": "Router", "quantity": "2", "price": "45.50" },
    { "code": "MON-01", "description": "Monitor", "quantity": "1", "price": "150.00" }
  ]
}
```

En caso de error responde `400` con un objeto `errors` indexado por la posición del producto (desde `0`) y los mensajes por campo.

**Edición**

```http
PUT /api/products/RTR-01
Content-Type: application/json

{ "code": "RTR-02", "description": "Router Gigabit", "quantity": "3", "price": "49.99" }
```

**Resumen**

```http
POST /api/inventory/summary
Content-Type: application/json

{ "selectedCodes": ["CAM-01", "SW-01"], "applyDiscount": true }
```

Responde `subtotal`, `discount`, `taxableAmount`, `tax` y `total`. Los importes se calculan con los productos almacenados; la solicitud solo indica la selección.

## Reglas de negocio y validaciones

**Validaciones** (aplicadas por el backend en alta y edición):

- Código obligatorio y único. Se normaliza a mayúsculas sin espacios laterales.
- Descripción obligatoria.
- Cantidad: entero positivo.
- Precio: número positivo con un máximo de dos decimales.
- Se rechazan valores negativos, cero y texto en campos numéricos.
- Los errores se devuelven por campo y se muestran junto a cada input.
- En el registro múltiple, si un producto es inválido o repite un código del mismo lote, no se guarda ninguno.

**Cálculos:**

1. Cada precio se convierte a centavos enteros (`Math.round(precio × 100)`).
2. Subtotal = Σ `cantidad × precioEnCentavos`.
3. Descuento = 5 % del importe de los productos seleccionados, redondeado al centavo. Solo se aplica si el descuento está activo y hay selección.
4. Base imponible = subtotal − descuento.
5. IVA = 13 % de la base imponible, redondeado al centavo.
6. Total = base imponible + IVA.

Con el inventario inicial y sin descuento: subtotal **$805.00**, IVA **$104.65**, total **$909.65**.

## Almacenamiento en memoria

`InMemoryInventoryRepository` mantiene los productos en un arreglo dentro del proceso del backend. Al iniciar se carga con los datos de `data/initialProducts.ts`:

| Código | Descripción | Cantidad | Precio |
|---|---|---:|---:|
| CAM-01 | Cámara IP | 2 | 125.00 |
| SW-01 | Switch | 1 | 180.00 |
| UPS-01 | UPS | 1 | 250.00 |
| CAB-01 | Cable | 5 | 15.00 |
| CON-01 | Conector | 10 | 5.00 |

Limitaciones:

- Altas y ediciones se conservan solo mientras el proceso está activo; al reiniciar el backend (incluido el reinicio automático de `tsx watch` al guardar archivos) el inventario vuelve a los cinco productos iniciales.
- El estado no se comparte entre varias instancias del servidor.
- No hay autenticación ni control de concurrencia.

## Despliegue en Railway (Backend)

El repositorio incluye la configuración `railway.json` para compilar y ejecutar exclusivamente el backend desde el monorepo pnpm.

Configuración del servicio en Railway:

- **Root Directory:** `/` (o dejarlo vacío / raíz del repositorio). *No asignar `/backend` para que pnpm pueda resolver `pnpm-workspace.yaml` y `pnpm-lock.yaml`*.
- **Build Command:** `pnpm --filter btech-inventory-backend build` (o `pnpm run build:backend`).
- **Start Command:** `pnpm --filter btech-inventory-backend start` (o `pnpm start`).
- **Healthcheck Path:** `/health`.

Variables de entorno:

| Variable | Descripción | Valor |
|---|---|---|
| `PORT` | Asignado automáticamente por Railway. | Automático (ej. `3001`, `8080`) |
| `FRONTEND_URL` | URL de la aplicación frontend en Netlify para CORS. | `https://tu-app.netlify.app` (opcional, permite `*.netlify.app` por defecto) |

