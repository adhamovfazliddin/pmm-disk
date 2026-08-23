import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const superadminEmail = process.env.SUPERADMIN_EMAIL || 'admin@arcpe.uz';
  const superadminPassword = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin!2024'; // Change this in production

  const hashedPassword = await bcrypt.hash(superadminPassword, 10);
  
  await prisma.user.upsert({
    where: { email: superadminEmail },
    update: {
      password: hashedPassword,
      role: Role.SUPERADMIN,
    },
    create: {
      email: superadminEmail,
      password: hashedPassword,
      name: 'System Superadmin',
      role: Role.SUPERADMIN,
    },
  });
  console.log(`Ensured superadmin: ${superadminEmail} with updated password`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
