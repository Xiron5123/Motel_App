import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const listingCount = await prisma.listing.count();
    const roommateCount = await prisma.roommateProfile.count();
    const userCount = await prisma.user.count();

    console.log(`Listings: ${listingCount}`);
    console.log(`Roommate Profiles: ${roommateCount}`);
    console.log(`Users: ${userCount}`);

    const listings = await prisma.listing.findMany({ take: 1 });
    console.log('Sample Listing:', JSON.stringify(listings[0], null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
