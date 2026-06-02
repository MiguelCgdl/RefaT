// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

/**
 * Key for roles metadata used by RolesGuard.
 */
export const ROLES_KEY = 'roles';

/**
 * Decorador para especificar los roles requeridos en un handler.
 * Uso: @Roles('ADMIN', 'KANBAN_CREATE')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
