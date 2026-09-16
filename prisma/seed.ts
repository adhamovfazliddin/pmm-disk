import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const superadminEmail = process.env.SUPERADMIN_EMAIL || 'adminpmm@example.com';
  let superadminPassword = process.env.SUPERADMIN_PASSWORD;
  let isGeneratedPassword = false;

  if (!superadminPassword) {
    // Xavfsizlik uchun default parol o'rniga tasodifiy parol yaratish
    const crypto = require('crypto');
    superadminPassword = crypto.randomBytes(12).toString('base64');
    isGeneratedPassword = true;
  }

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
  
  console.log(`Ensured superadmin: ${superadminEmail}`);
  if (isGeneratedPassword) {
    console.log(`\n=============================================================`);
    console.log(`[WARNING] SUPERADMIN_PASSWORD kiritilmagan!`);
    console.log(`Xavfsizlik maqsadida avtomatik ravishda tasodifiy parol yaratildi:`);
    console.log(`Email: ${superadminEmail}`);
    console.log(`Password: ${superadminPassword}`);
    console.log(`Iltimos, ushbu parolni saqlab qo'ying yoki darhol o'zgartiring!`);
    console.log(`=============================================================\n`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
