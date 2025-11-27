import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
    const email = 'xirontester01@gmail.com';
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (user) {
        console.log('User found:', {
            id: user.id,
            email: user.email,
            passwordHash: user.password,
            role: user.role
        });
    } else {
        console.log('User not found:', email);
    }
}

checkUser()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
