const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  // Get landlord user
  const landlord = await prisma.user.findFirst({
    where: { role: 'LANDLORD' },
  });

  if (!landlord) {
    console.log('❌ No landlord found. Please create a landlord first.');
    return;
  }

  console.log(`✅ Found landlord: ${landlord.name}`);

  // Create listings
  const listing1 = await prisma.listing.create({
    data: {
      landlordId: landlord.id,
      title: 'Phòng trọ cao cấp gần ĐH Bách Khoa',
      description: 'Phòng mới xây, đầy đủ nội thất, gần trường học, siêu thị, công viên',
      price: 3000000,
      deposit: 2000000,
      area: 25,
      address: '123 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
      lat: 21.0031177,
      lng: 105.8201408,
      amenities: ['wifi', 'parking', 'kitchen', 'washing_machine', 'air_conditioner'],
      status: 'AVAILABLE',
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      landlordId: landlord.id,
      title: 'Phòng trọ giá rẻ Cầu Giấy',
      description: 'Phòng sạch sẽ, thoáng mát, an ninh tốt',
      price: 2000000,
      deposit: 1000000,
      area: 20,
      address: '456 Xuân Thủy, Cầu Giấy, Hà Nội',
      lat: 21.0381554,
      lng: 105.7824516,
      amenities: ['wifi', 'parking'],
      status: 'AVAILABLE',
    },
  });

  console.log(`✅ Created 2 listings`);
  console.log(`   - ${listing1.title}`);
  console.log(`   - ${listing2.title}`);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
