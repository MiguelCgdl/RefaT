# Refa — Control vehicular (taller + refaccionaria)

Sistema para gestionar clientes, vehículos, órdenes de trabajo, presupuestos, refacciones e inventario.

## Arquitectura (stack premium)

```
┌──────────────────┐     REST /api      ┌─────────────────────────┐
│  Next.js (App)   │ ◄────────────────► │  NestJS + Prisma        │
│  frontend-next/  │     JWT Bearer     │  backend-nest/          │
└──────────────────┘                    └───────────┬─────────────┘
                                                    │
                         ┌──────────────────────────┼──────────────────┐
                         ▼                          ▼                  ▼
                   PostgreSQL                    Redis            BullMQ (stubs)
```

| Capa | Tecnología |
|------|------------|
| Frontend | React + **Next.js 14** (App Router), TypeScript |
| Backend | **NestJS** + TypeScript, módulos por dominio |
| DB | **PostgreSQL** + **Prisma** ORM |
| Auth | **JWT** + Passport (roles: admin, mecanico, recepcion, almacen, cliente) |
| Cola | **BullMQ** + Redis (recordatorios, alertas stock — processors stub) |
| Reportes | **PDFKit** + **ExcelJS** (PDF presupuesto, Excel refacciones) |
| Notificaciones | Stubs Twilio / SendGrid / WhatsApp (solo env) |
| Infra | **Docker Compose**: postgres, redis, api, frontend, nginx opcional |

### Legacy (deprecado)

- `backend/` — Django + DRF (ver [backend/DEPRECATED.md](backend/DEPRECATED.md))
- `frontend/` — Vite + React

## Requisitos

- Node.js 20+
- Docker Desktop (recomendado para PostgreSQL y Redis)
- PowerShell o bash

## Inicio rápido con Docker

```powershell
# 1. Variables de entorno
Copy-Item .env.example .env

# 2. Levantar postgres, redis, API y frontend
docker compose up --build -d

# 3. (Opcional) Proxy nginx en puerto 80
docker compose --profile with-nginx up -d nginx
```

- Frontend: http://localhost:3000  
- API: http://localhost:3001/api  
- Login por defecto (seed): **admin** / **admin**

## Desarrollo local (sin Docker para Node)

```powershell
# 1. Solo infraestructura
docker compose up -d postgres redis

# 2. Copiar env y ajustar DATABASE_URL / REDIS_URL
Copy-Item .env.example .env

# 3. Instalar dependencias
npm run install:all

# 4. Base de datos
cd backend-nest
npx prisma db push
npx prisma db seed
cd ..

# 5. API + frontend en paralelo
npm run dev
```

## Scripts raíz

| Script | Descripción |
|--------|-------------|
| `npm run install:all` | Instala backend-nest y frontend-next |
| `npm run dev` | Nest watch + Next dev (concurrently) |
| `npm run build` | Build producción de ambos |
| `npm run docker:up` | `docker compose up --build -d` |
| `npm run prisma:push` | Sincroniza schema Prisma |
| `npm run prisma:seed` | Usuario admin/admin |

## Endpoints principales (`/api`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/login` o `/auth/token` | JWT (compat. nombre legacy) |
| GET/POST | `/clientes` | CRUD clientes |
| GET/POST/PATCH | `/vehiculos` | CRUD vehículos |
| GET | `/vehiculos/:id/historial` | Historial OT del vehículo |
| GET/POST/PATCH | `/ordenes` | Órdenes (folio `OT-YYYYMMDD-NNNN`) |
| GET/POST | `/presupuestos` | Presupuestos |
| POST | `/presupuestos/:id/aprobar` | Aprueba y descuenta stock (transacción) |
| POST | `/lineas-presupuesto` | Líneas de presupuesto |
| GET/POST | `/refacciones` | Refacciones |
| GET/POST | `/movimientos-inventario` | Movimientos |
| GET | `/reportes/resumen` | Dashboard |
| GET | `/reportes/presupuestos/:id/pdf` | PDF presupuesto |
| GET | `/reportes/refacciones/excel` | Export Excel |
| GET | `/notificaciones/health` | Estado stubs notificaciones |
| POST | `/cola/recordatorio` | Encolar recordatorio (stub) |
| POST | `/cola/stock-alert` | Encolar alerta stock (stub) |

Autenticación: cabecera `Authorization: Bearer <token>`.

## Seguridad

- **helmet** en NestJS
- **@nestjs/throttler** (120 req/min por IP)
- **CORS** configurable (`CORS_ORIGIN`)
- En producción: terminar TLS en nginx/ingress, rotar `JWT_SECRET`, no commitear `.env`

## Dashboard analítico (futuro)

Documentado para despliegue opcional:

- **Grafana** — métricas de API/Redis/Postgres vía Prometheus
- **Metabase** — BI sobre PostgreSQL (conexión read-only)

No se incluye manifiesto K8s completo; path sugerido: Helm chart con postgres/redis externos y secrets en vault.

## Estructura del repositorio

```
Refa/
├── backend-nest/      # API NestJS + Prisma
├── frontend-next/     # UI Next.js
├── nginx/             # Proxy opcional
├── backend/           # LEGACY Django
├── frontend/          # LEGACY Vite
├── docker-compose.yml
├── .env.example
└── package.json
```

## Roles

| Rol Prisma | Uso |
|------------|-----|
| ADMIN | Acceso completo |
| RECEPCION | Alta clientes, vehículos, órdenes |
| MECANICO | Actualización OT |
| ALMACEN | Inventario y cola stock |
| CLIENTE | Reservado (portal futuro) |
