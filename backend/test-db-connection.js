const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Testing database connection...\n');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Count records in each table
    const userCount = await prisma.user.count();
    const listingCount = await prisma.listing.count();
    const photoCount = await prisma.photo.count();
    const bookingCount = await prisma.bookingRequest.count();
    const conversationCount = await prisma.conversation.count();
    const messageCount = await prisma.message.count();
    const favoriteCount = await prisma.favorite.count();
    const notificationCount = await prisma.notification.count();
    
    console.log('\n📊 Database Statistics:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Listings: ${listingCount}`);
    console.log(`   Photos: ${photoCount}`);
    console.log(`   Booking Requests: ${bookingCount}`);
    console.log(`   Conversations: ${conversationCount}`);
    console.log(`   Messages: ${messageCount}`);
    console.log(`   Favorites: ${favoriteCount}`);
    console.log(`   Notifications: ${notificationCount}`);
    
    console.log('\n✅ All tables are accessible!\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
