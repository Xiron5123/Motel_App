const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getUserIds() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log('\n📋 USER IDs FOR TESTING:\n');
  users.forEach(user => {
    console.log(`${user.role.padEnd(10)} | ${user.name.padEnd(20)} | ${user.email.padEnd(25)} | ${user.id}`);
  });

  console.log('\n💡 Copy User IDs để dùng trong test-socket.html\n');
  
  await prisma.$disconnect();
}

getUserIds();
