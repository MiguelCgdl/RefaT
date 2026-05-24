# Refa

Sistema de gestión para taller mecánico, clientes, vehículos, órdenes de trabajo, presupuestos y almacén de refacciones.

## Resumen

Refa es un monorepo con una arquitectura moderna orientada a operación interna de taller:

- Frontend en `Next.js 14` con `App Router`
- Backend en `NestJS` con `Prisma`
- Base de datos `PostgreSQL`
- `Redis` para colas y procesos auxiliares
- Autenticación con `JWT`

Actualmente la interfaz principal organiza el sistema en cuatro áreas:

- `Dashboard`
- `Clientes y Vehículos`
- `Taller`
- `Almacén`

## Arquitectura

```text
┌──────────────────────┐      HTTP /api      ┌─────────────────────────┐
│ frontend-next/       │ <-----------------> │ backend-nest/           │
│ Next.js 14 + TS      │    JWT Bearer       │ NestJS + Prisma + TS    │
└──────────────────────┘                     └──────────┬──────────────┘
                                                        │
                                      ┌─────────────────┴─────────────────┐
                                      │                                   │
                                      ▼                                   ▼
                                PostgreSQL                              Redis
```

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | `Next.js 14`, `React 18`, `TypeScript`, `Tailwind`, `PrimeReact`, `React Query` |
| Backend | `NestJS`, `TypeScript`, `Prisma`, `Passport JWT` |
| Base de datos | `PostgreSQL` |
| Cola / mensajería | `Redis`, `BullMQ` |
| Reportes | `PDFKit`, `ExcelJS`, `xlsx` |
| Infra | `Docker Compose`, `Nginx` opcional |

## Módulos funcionales

### Dashboard

- Vista ejecutiva con métricas operativas
- Resumen de órdenes activas
- Conteo de refacciones con bajo stock
- Accesos rápidos a los módulos principales

### Clientes y Vehículos

- Alta, edición y eliminación de clientes
- Asociación de vehículos por cliente
- Historial de órdenes por vehículo
- Validaciones en captura, incluyendo:
  - `RFC` en mayúsculas y con máximo `13` caracteres
  - Selección guiada de marca, modelo y color del vehículo

### Taller

Concentra la operación del taller en una sola sección:

- `Órdenes de trabajo`
- `Presupuestos`
- Pantallas de detalle para diagnóstico y conceptos

### Almacén

- Gestión de refacciones e inventario
- Altas, ediciones y bajas
- Importación y exportación
- Control visual de stock bajo

## Flujo principal del sistema

1. Registrar cliente
2. Vincular uno o más vehículos
3. Crear orden de trabajo
4. Capturar diagnóstico técnico
5. Crear presupuesto
6. Agregar refacciones y mano de obra
7. Enviar o aprobar presupuesto
8. Descontar inventario cuando aplique

## Estructura del repositorio

```text
Refa/
├── backend-nest/      # Backend principal en NestJS + Prisma
├── frontend-next/     # Frontend principal en Next.js
├── nginx/             # Proxy opcional
├── backend/           # Backend legacy en Django
├── frontend/          # Frontend legacy en Vite
├── docker-compose.yml
├── .env.example
├── FUNCIONALIDADES.md
└── package.json
```

## Estado actual del repositorio

### Activo

- `backend-nest/`
- `frontend-next/`
- `docker-compose.yml`
- `nginx/`

### Legacy

- `backend/` (`Django + DRF`)
- `frontend/` (`React + Vite`)

Referencia: [backend/DEPRECATED.md](backend/DEPRECATED.md)

## Requisitos

- `Node.js 20+`
- `npm`
- `Docker` y `Docker Compose` recomendados
- `PostgreSQL` y `Redis` si se ejecuta sin Docker

## Variables de entorno

El proyecto usa variables de entorno centralizadas en la raíz.

1. Copia el archivo base:

```bash
cp .env.example .env
```

2. Ajusta al menos:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `CORS_ORIGIN`

El archivo base disponible es [`.env.example`](.env.example).

## Ejecución con Docker

Levanta todo el stack principal:

```bash
docker compose up --build -d
```

Servicios esperados:

- Frontend: `http://localhost:3000`
- API: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/api/docs`
- Health check: `http://localhost:3001/api/health`

Si quieres exponer Nginx:

```bash
docker compose --profile with-nginx up -d nginx
```

## Desarrollo local

### 1. Infraestructura

```bash
docker compose up -d postgres redis
```

### 2. Instalar dependencias

```bash
npm run install:all
```

### 3. Preparar base de datos

```bash
cd backend-nest
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
cd ..
```

### 4. Ejecutar frontend y backend

```bash
npm run dev
```

## Scripts útiles

### Raíz

| Script | Descripción |
|---|---|
| `npm run install:all` | Instala dependencias de `backend-nest` y `frontend-next` |
| `npm run dev` | Ejecuta API y frontend en paralelo |
| `npm run build` | Construye backend y frontend |
| `npm run docker:up` | Levanta el stack con Docker |
| `npm run docker:down` | Baja el stack Docker |
| `npm run prisma:generate` | Genera cliente Prisma |
| `npm run prisma:push` | Sincroniza esquema Prisma |
| `npm run prisma:seed` | Ejecuta seed del backend |

### Backend

Archivo: [`backend-nest/package.json`](backend-nest/package.json)

- `npm run start:dev`
- `npm run build`
- `npm run prisma:generate`
- `npm run prisma:push`
- `npm run prisma:seed`

### Frontend

Archivo: [`frontend-next/package.json`](frontend-next/package.json)

- `npm run dev`
- `npm run build`
- `npm run start`

## API principal

La API expone prefijo global `api`.

### Autenticación

- `POST /api/auth/login`
- `POST /api/auth/token`

### Salud y documentación

- `GET /api/health`
- `GET /api/docs`

### Recursos principales

- `GET/POST/PATCH/DELETE /api/clientes`
- `GET/POST/PATCH/DELETE /api/vehiculos`
- `GET /api/vehiculos/:id/historial`
- `GET/POST/PATCH/DELETE /api/ordenes`
- `GET/POST/PATCH/DELETE /api/presupuestos`
- `POST /api/lineas-presupuesto`
- `GET/POST/PATCH/DELETE /api/refacciones`
- `GET/POST /api/movimientos-inventario`
- `GET /api/reportes/resumen`

Autenticación por cabecera:

```text
Authorization: Bearer <token>
```

## Seguridad

El backend y frontend ya contemplan medidas base de seguridad:

- `helmet` en NestJS
- `ValidationPipe` global con `whitelist`, `transform` y `forbidNonWhitelisted`
- `@nestjs/throttler` con límite global
- `CORS` configurable por entorno
- `Swagger` protegido por JWT en endpoints autenticados
- Comportamiento fail-fast ante error de conexión a base de datos
- Endpoint de salud para verificación operativa
- Uso de variables de entorno para datos sensibles
- Headers de seguridad en el frontend Next.js

## UI actual

La interfaz principal usa un lenguaje visual oscuro premium y navegación lateral centralizada.

Rutas funcionales actuales:

- `/login`
- `/dashboard`
- `/clientes`
- `/taller`
- `/ordenes`
- `/ordenes/[id]`
- `/presupuestos`
- `/presupuestos/[id]`
- `/almacen`
- `/refacciones`

Nota: `Taller` agrupa visualmente órdenes y presupuestos. `Almacén` concentra refacciones e inventario.

## Seeds y acceso inicial

El proyecto incluye seed para generar usuario administrador.

Ejecutar:

```bash
npm run prisma:seed
```

Las credenciales concretas dependen de las variables de entorno configuradas, especialmente:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## Documentación complementaria

- [FUNCIONALIDADES.md](FUNCIONALIDADES.md)
- [backend/DEPRECATED.md](backend/DEPRECATED.md)

## CI/CD Pipeline

The repository includes GitHub Actions workflows for continuous integration and deployment.

- **CI workflow (`.github/workflows/ci.yml`)** runs linting, matrix testing on Node 18 & 20, builds Docker images, pushes them to Docker Hub, and uploads test artifacts.
- **Deploy workflow (`.github/workflows/deploy.yml`)** triggers after a successful Docker push, logs in via SSH, pulls the new images and restarts services using `docker-compose`.

Ensure the following secrets are configured in the repository settings:

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub account username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `SSH_PRIVATE_KEY` | SSH private key for the deployment server |
| `SSH_HOST` (optional) | Hostname or IP of the server |
| `SSH_USER` (optional) | SSH user (defaults to `user`) |
