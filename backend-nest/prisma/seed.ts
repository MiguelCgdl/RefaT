import { PrismaClient, RolUsuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin', 10);

  await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: { passwordHash, rol: RolUsuario.ADMIN, activo: true },
    create: {
      username: 'admin',
      email: 'admin@refa.local',
      passwordHash,
      rol: RolUsuario.ADMIN,
      activo: true,
    },
  });

  console.log('Seed OK: usuario admin/admin');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
