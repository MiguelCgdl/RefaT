# Refa — Control vehicular (taller + refaccionaria)

Scaffold funcional para gestionar clientes, vehículos, órdenes de trabajo, presupuestos, refacciones e inventario.

## Arquitectura

```
┌─────────────┐     REST /api      ┌──────────────────┐
│  React SPA  │ ◄────────────────► │  Django + DRF    │
│  (Vite)     │                    │  (backend/)      │
└─────────────┘                    └────────┬─────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    ▼                       ▼                       ▼
              PostgreSQL                 Redis                  Celery Worker
```

### Módulos backend (`backend/apps/`)

| App | Responsabilidad |
|-----|-----------------|
| `accounts` | Permisos por rol (grupos Django) |
| `customers` | Clientes |
| `vehicles` | Vehículos + historial de OTs |
| `workorders` | Órdenes de trabajo (folio autogenerado) |
| `quotes` | Presupuestos, líneas, aprobación con descuento de stock |
| `parts` | Refacciones y movimientos de inventario |
| `notifications` | Modelo de notificaciones + tarea Celery ejemplo |
| `reports` | Resumen para dashboard |

## Requisitos

- Docker y Docker Compose
- Node.js 18+ (solo para desarrollo del frontend en local)

## Levantar con Docker

```bash
# 1. Variables de entorno
cp .env.example .env

# 2. Servicios (postgres, redis, backend, celery)
docker compose up --build -d

# 3. Crear superusuario y grupos de roles
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py crear_grupos
```

API disponible en: http://localhost:8000/api/  
Admin Django: http://localhost:8000/admin/

### Token de API

```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"tu_password"}'
```

Usa el token en el frontend (pantalla de login) o en cabecera `Authorization: Token <token>`.

## Frontend (desarrollo local)

```bash
cd frontend
npm install
cp .env.example .env   # opcional: VITE_API_URL=http://localhost:8000/api
npm run dev
```

Abre http://localhost:5173 — el proxy de Vite reenvía `/api` al backend.

### Frontend desde la raíz

También puedes correr los comandos del frontend sin entrar a la carpeta:

```bash
npm run install:frontend
npm run dev
```

Scripts disponibles en raíz:

- `npm run dev` -> `frontend` dev server
- `npm run build` -> build del frontend
- `npm run preview` -> vista previa del build

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/clientes/` | CRUD clientes |
| GET/POST | `/api/vehiculos/` | CRUD vehículos |
| GET | `/api/vehiculos/{id}/historial/` | Historial de OTs del vehículo |
| GET/POST | `/api/ordenes/` | CRUD órdenes de trabajo |
| GET/POST | `/api/presupuestos/` | CRUD presupuestos |
| POST | `/api/presupuestos/{id}/aprobar/` | Aprueba y descuenta stock (transaccional) |
| GET/POST | `/api/lineas-presupuesto/` | Líneas de presupuesto |
| GET/POST | `/api/refacciones/` | CRUD refacciones |
| GET/POST | `/api/movimientos-inventario/` | Movimientos (solo lectura/creación) |
| GET | `/api/reportes/resumen/` | Métricas del dashboard |
| POST | `/api/auth/token/` | Obtener token DRF |

## Roles (grupos Django)

- `administrador` — acceso completo
- `recepcion` — alta de clientes, vehículos, órdenes
- `mecanico` — actualización de estados de OT
- `almacen` — refacciones e inventario

Ejecutar `python manage.py crear_grupos` y asignar usuarios desde el admin.

## Celery

El worker procesa tareas en `apps.notifications.tasks` (ej. `verificar_stock_bajo`). Configuración en `config/celery.py` y variables `CELERY_*` en `.env`.

## Estructura del repositorio

```
Refa/
├── docker-compose.yml
├── .env.example
├── backend/          # Django 5 + DRF
├── frontend/         # React 18 + TypeScript + Vite
└── README.md
```
