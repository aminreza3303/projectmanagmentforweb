require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();
  const password = await bcrypt.hash('12345678', 10);
  const users = [
    { email: 'admin@example.com', role: 'admin', name: 'Admin' },
    { email: 'amin@example.com', role: 'manager', name: 'Amin' },
    { email: 'amir@example.com', role: 'member', name: 'Amir' },
    { email: 'manager@example.com', role: 'manager', name: 'Manager' },
    { email: 'member@example.com', role: 'member', name: 'Member' }
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      await prisma.user.update({
        where: { email: u.email },
        data: { password, role: u.role, name: u.name }
      });
    } else {
      await prisma.user.create({
        data: { name: u.name, email: u.email, password, role: u.role }
      });
    }
  }

  await prisma.$disconnect();
  console.log('seeded');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
