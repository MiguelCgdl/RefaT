# DEPRECATED — Django + DRF

Esta carpeta contiene el stack **legacy** (Django 5 + DRF + Celery + frontend Vite en `frontend/`).

La arquitectura activa del proyecto es:

- `backend-nest/` — API NestJS + Prisma
- `frontend-next/` — UI Next.js App Router

No elimines este código hasta completar la migración de datos y validación en producción. Para desarrollo nuevo, usa `docker compose` en la raíz (servicios `api` y `frontend`).
