import { PrismaClient, RolUsuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminUsername || !adminPassword) {
    console.error('ERROR: ADMIN_USERNAME and ADMIN_PASSWORD environment variables must be set');
    console.error('For local development, create a .env file with these variables');
    process.exit(1);
  }
  
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.usuario.upsert({
    where: { username: adminUsername },
    update: { passwordHash: passwordHash, rol: RolUsuario.ADMIN, activo: true },
    create: {
      username: adminUsername,
      email: `${adminUsername}@refa.local`,
      passwordHash: passwordHash,
      rol: RolUsuario.ADMIN,
      activo: true,
    },
  });

  console.log(`Seed OK: usuario ${adminUsername}/${adminPassword}`);

  // ── Seed system module permissions ──
  const modules = [
    { nombre: 'Dashboard',  descripcion: 'Panel principal con métricas y KPIs del taller.' },
    { nombre: 'Clientes',   descripcion: 'Gestión de clientes y vehículos.' },
    { nombre: 'Taller',     descripcion: 'Órdenes de trabajo, presupuestos y reparaciones.' },
    { nombre: 'Almacen',    descripcion: 'Inventario de refacciones y movimientos de stock.' },
    { nombre: 'Admin',      descripcion: 'Administración del sistema, usuarios y configuración.' },
  ];

  for (const mod of modules) {
    await prisma.permiso.upsert({
      where: { nombre: mod.nombre },
      update: { descripcion: mod.descripcion },
      create: mod,
    });
  }
  console.log(`Seed OK: ${modules.length} módulos de permisos creados / actualizados`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
