import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function verifyUserPassword() {
    const email = 'user1@example.com';
    const password = '123456';

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (user) {
        console.log('User found:', user.email);
        const match = await bcrypt.compare(password, user.password);
        console.log('Password "123456" matches:', match);
    } else {
        console.log('User not found');
    }
}

verifyUserPassword()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
