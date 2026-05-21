# RefaT — Documentación de Funcionalidades

> Sistema de gestión para taller mecánico y refaccionaria.
> **Stack:** NestJS (backend) + Next.js 14 App Router (frontend) + Supabase/PostgreSQL + Prisma ORM

---

## 🏗️ Arquitectura General

```
RefaT/
├── backend-nest/   → API REST (NestJS, puerto 3001)
└── frontend-next/  → UI (Next.js, puerto 3000)
```

### Dependencias de ambiente
- **Redis** corriendo localmente (`brew services start redis`) antes de `npm run dev`
- Variables de entorno en `.env` en la raíz del monorepo

---

## 🔐 Autenticación

| Característica | Detalle |
|---|---|
| Tipo | JWT (JSON Web Tokens) |
| Endpoint login | `POST /auth/login` |
| Guard | `JwtAuthGuard` aplicado en todos los controladores |
| Almacenamiento cliente | `localStorage` (token) |
| Hidratación | Componente `AppShell` usa estado `mounted` para evitar errores de SSR |

---

## 👥 Módulo: Clientes

### Backend (`/clientes`)
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/clientes/` | Lista paginada de clientes |
| POST | `/clientes/` | Crear cliente (opcionalmente con vehículo anidado) |
| PATCH | `/clientes/:id` | Actualizar datos del cliente |
| DELETE | `/clientes/:id` | Eliminar cliente |

### Características especiales
- **Alta con vehículo integrado:** Al crear un cliente se puede registrar su vehículo en el mismo paso (checkbox opcional en el formulario). Usa Prisma nested create en una sola transacción.
- Campos: `nombre`, `email`, `telefono`, `rfc`, `direccion`, `notas`, `activo`

### Frontend (`/clientes`)
- Tabla con búsqueda en tiempo real (nombre, email, teléfono)
- Modal de creación con sección colapsable de vehículo
- Modal de edición con datos precargados
- Modal de confirmación de eliminación

---

## 🚗 Módulo: Vehículos

### Backend (`/vehiculos`)
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/vehiculos/` | Lista paginada con nombre del propietario |
| POST | `/vehiculos/` | Crear vehículo (requiere `clienteId`) |
| PATCH | `/vehiculos/:id` | Actualizar vehículo |
| DELETE | `/vehiculos/:id` | Eliminar vehículo |
| GET | `/vehiculos/:id/historial` | Historial de órdenes del vehículo |

- Campos: `clienteId`, `marca`, `modelo`, `anio`, `placas`, `color`, `serieVin`, `kilometrajeActual`, `notas`, `activo`

### Frontend (`/vehiculos`)
- Tabla con búsqueda por placas, marca, modelo y propietario
- Campos adicionales: color, km actuales, VIN
- Selector de cliente propietario (obligatorio)
- Modal editar / modal confirmar eliminación

---

## 🔧 Módulo: Órdenes de Trabajo

### Backend (`/ordenes`)
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/ordenes/` | Lista paginada |
| POST | `/ordenes/` | Crear orden (genera folio automático) |
| PATCH | `/ordenes/:id` | Actualizar estado, prioridad, diagnóstico |
| DELETE | `/ordenes/:id` | Eliminar orden |

- Campos: `vehiculoId`, `quejaCliente`, `diagnostico`, `estado`, `prioridad`, `mecanicoId`
- **Estados posibles:** `RECIBIDO`, `DIAGNOSTICO`, `ESPERA_APROBACION`, `EN_PROCESO`, `COMPLETADO`, `ENTREGADO`, `CANCELADO`
- **Prioridades:** `NORMAL`, `ALTA`, `URGENTE`
- Folio generado automáticamente por el backend

### Frontend (`/ordenes`)
- Tabla con búsqueda por folio y placas
- Badges de color por estado y prioridad
- Botón **"Ver detalle"** → navega a `/ordenes/[id]` (hoja de diagnóstico)
- Modal de creación (vehículo + queja + prioridad)
- Modal de edición (cambia estado, prioridad, queja, diagnóstico)
- Modal de confirmación de eliminación

---

## 📋 Módulo: Hoja de Diagnóstico (`/ordenes/[id]`)

Pantalla de detalle de una orden de trabajo que permite:

- Ver información del vehículo y cliente
- Registrar/actualizar el **diagnóstico técnico**
- **Cargar refacciones del inventario** con validación de stock
- Agregar líneas de **mano de obra** (precio libre)
- Ver cálculo automático en tiempo real: Subtotal → IVA 16% → **Total**

---

## 📦 Módulo: Refacciones / Inventario

### Backend
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/refacciones/` | Lista paginada con alerta de bajo stock |
| POST | `/refacciones/` | Crear refacción |
| PATCH | `/refacciones/:id` | Actualizar refacción |
| DELETE | `/refacciones/:id` | Eliminar refacción |
| GET | `/movimientos-inventario/` | Historial de movimientos |
| POST | `/movimientos-inventario/` | Registrar movimiento manual |

- Campos: `sku`, `nombre`, `categoria`, `costo`, `precioVenta`, `stock`, `stockMinimo`, `ubicacion`, `activo`
- Flag `bajo_stock` automático cuando `stock <= stockMinimo`

### Frontend (`/refacciones`)
- Tabla con búsqueda por SKU y nombre
- Columnas: SKU, nombre, costo, precio venta, stock (rojo si bajo stock)
- Badge "Escaso" con ícono de alerta cuando hay bajo stock
- Modal de creación con campos completos (costo, precio venta, stock mínimo, ubicación)
- Modal de edición con datos precargados
- Modal de confirmación de eliminación

---

## 💰 Módulo: Presupuestos

### Backend
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/presupuestos` | Lista paginada de presupuestos |
| GET | `/presupuestos/:id` | Detalle con todas las líneas |
| POST | `/presupuestos` | Crear presupuesto vacío ligado a una orden |
| PATCH | `/presupuestos/:id` | Cambiar estado del presupuesto |
| DELETE | `/presupuestos/:id` | Eliminar presupuesto |
| POST | `/presupuestos/:id/aprobar` | Aprobar (descuenta stock automáticamente) |
| POST | `/presupuestos/:id/enviar` | Marcar como enviado (email o WhatsApp) |
| POST | `/lineas-presupuesto` | Agregar línea (refacción o mano de obra) |
| DELETE | `/lineas-presupuesto/:id` | Eliminar línea (recalcula totales) |

### Cálculo automático
- Cada línea: `cantidad × precioUnitario − descuento`
- **Subtotal** = suma de todas las líneas
- **IVA** = Subtotal × 16%
- **Total** = Subtotal + IVA
- Recálculo automático al agregar/eliminar líneas

### Estados del presupuesto
`BORRADOR` → `ENVIADO` → `APROBADO` / `RECHAZADO`

### Aprobación
- Valida stock suficiente de todas las refacciones incluidas
- Descuenta stock de cada refacción en una transacción atómica
- Registra movimientos de inventario tipo `SALIDA`
- Actualiza el estado de la orden a `EN_PROCESO`

### Envío al cliente
- **Email:** requiere que el cliente tenga `email` registrado
- **WhatsApp:** requiere que el cliente tenga `telefono` registrado
- Actualmente en modo stub (log en consola); listo para integrar Twilio/SendGrid

### Frontend (`/presupuestos`)
- Tabla con búsqueda por folio
- Acciones por fila:
  - 📊 Ver/editar líneas del presupuesto
  - ✏️ Cambiar estado
  - 📧 Enviar por **Email** o **WhatsApp** (modal de selección)
  - ⬇️ Descargar **PDF**
  - 🗑️ Eliminar
- Modal de creación vinculada a una orden

---

## 📊 Dashboard

- Resumen de órdenes por estado
- Contador de refacciones con bajo stock
- Contador de órdenes activas

---

## 🧩 Componentes Compartidos

| Componente | Ubicación | Descripción |
|---|---|---|
| `Modal` | `src/components/Modal.tsx` | Modal reutilizable con cierre por `Escape` y clic en overlay |
| `AppShell` | `src/components/AppShell.tsx` | Layout con sidebar, navegación y control de autenticación |
| `useAuth` | `src/hooks/useAuth.ts` | Hook para obtener token JWT del localStorage |

---

## 🗄️ Base de Datos (Prisma + Supabase)

### Modelos principales
- `Cliente` — datos del propietario
- `Vehiculo` — vehículo asociado a un cliente
- `OrdenTrabajo` — orden de servicio con folio único
- `Presupuesto` — cotización versionada por orden
- `LineaPresupuesto` — líneas de refacción o mano de obra
- `Refaccion` — catálogo de partes con stock
- `MovimientoInventario` — bitácora de entradas/salidas
- `User` — usuarios del sistema (mecánicos, admin)

### Conexión
- **Session Pooler** de Supabase para estabilidad en IPv4
- Variables: `DATABASE_URL` en `.env`

---

## 🚀 Comandos de Desarrollo

```bash
# Levantar todo
npm run dev                    # desde la raíz del monorepo

# Solo backend
cd backend-nest && npm run dev

# Solo frontend
cd frontend-next && npm run dev

# Prerequisito: Redis
brew services start redis

# Migraciones Prisma
cd backend-nest
npx prisma migrate dev
npx prisma generate
```

---

## 📋 Pendientes / Roadmap

- [ ] Integración real de email (SendGrid / Nodemailer)
- [ ] Integración real de WhatsApp (Twilio)
- [ ] Reversión de stock al editar/rechazar presupuestos aprobados
- [ ] Paginación en tablas del frontend (actualmente carga primera página)
- [ ] Roles de usuario (admin vs. mecánico)
- [ ] Reportes exportables (Excel de inventario, PDF de presupuesto)
- [ ] Notificaciones en tiempo real (Supabase Realtime)
