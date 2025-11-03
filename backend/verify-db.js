const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const user = await prisma.user.findUnique({
    where: { email: 'alice@example.com' },
  });
  
  if (user) {
    console.log('\n✅ User found in database:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Phone: ${user.phone}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${user.createdAt}\n`);
  } else {
    console.log('❌ User not found');
  }
  
  await prisma.$disconnect();
}

verify();
