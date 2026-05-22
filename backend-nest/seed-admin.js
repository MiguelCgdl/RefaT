require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminUsername || !adminPassword) {
    console.error('ERROR: ADMIN_USERNAME and ADMIN_PASSWORD environment variables must be set');
    console.error('For local development, create a .env file with these variables');
    process.exit(1);
  }
  
  console.log(`Checking if user ${adminUsername} exists...`);
  
  const existingUser = await prisma.usuario.findUnique({
    where: { username: adminUsername },
  });

  if (existingUser) {
    console.log(`User ${adminUsername} already exists. Updating password...`);
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.usuario.update({
      where: { id: existingUser.id },
      data: { passwordHash: hashedPassword },
    });
    console.log('Password updated successfully.');
  } else {
    console.log(`User ${adminUsername} not found. Creating...`);
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.usuario.create({
      data: {
        username: adminUsername,
        passwordHash: hashedPassword,
        rol: 'ADMIN',
      },
    });
    console.log('User created successfully.');
  }
}

main()
  .catch((e) => {
    console.error('Error seeding admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
