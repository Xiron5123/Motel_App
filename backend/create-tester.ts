import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTesterUser() {
    const email = 'xirontester01@gmail.com';
    const passwordRaw = 'P!assword123';

    console.log(`Creating user ${email}...`);

    const hashedPassword = await bcrypt.hash(passwordRaw, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword, // Update password if exists (though we know it doesn't)
        },
        create: {
            email,
            name: 'Xiron Tester',
            password: hashedPassword,
            role: 'RENTER',
            phone: '0999999999',
        },
    });

    console.log('User created/updated:', user.email);
}

createTesterUser()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
