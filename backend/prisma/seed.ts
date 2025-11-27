import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const FIRST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const MIDDLE_NAMES = ['Văn', 'Thị', 'Đức', 'Minh', 'Hoàng', 'Thu', 'Hải', 'Anh', 'Thanh', 'Quốc'];
const LAST_NAMES = ['An', 'Bình', 'Cường', 'Dũng', 'Giang', 'Hà', 'Hương', 'Lan', 'Long', 'Mai', 'Nam', 'Phương', 'Quân', 'Sơn', 'Tâm', 'Thảo', 'Tuấn', 'Vân', 'Yến'];
const CITIES = [
    { name: 'Hà Nội', lat: 21.0285, lng: 105.8542, districts: ['Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng'] },
    { name: 'Hồ Chí Minh', lat: 10.8231, lng: 106.6297, districts: ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận 10', 'Bình Thạnh'] },
    { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022, districts: ['Hải Châu', 'Thanh Khê', 'Sơn Trà'] },
];
const AMENITIES = ['wifi', 'parking', 'kitchen', 'ac', 'wc_private', 'fridge', 'bed', 'wardrobe'];
const HOBBIES = ['Đọc sách', 'Xem phim', 'Du lịch', 'Nấu ăn', 'Tập gym', 'Chơi game', 'Nghe nhạc'];

function randomName() {
    return `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${MIDDLE_NAMES[Math.floor(Math.random() * MIDDLE_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
}

function randomHobbies() {
    return [...HOBBIES].sort(() => 0.5 - Math.random()).slice(0, 3);
}

async function main() {
    console.log('🌱 Seeding database...\n');
    const password = await bcrypt.hash('123456', 10);
    const users: User[] = [];

    // 1. Create 20 users
    for (let i = 1; i <= 20; i++) {
        const user = await prisma.user.upsert({
            where: { email: `user${i}@motel.com` },
            update: {},
            create: {
                email: `user${i}@motel.com`,
                name: randomName(),
                password,
                role: i <= 10 ? 'LANDLORD' : 'RENTER',
                phone: `09${Math.floor(Math.random() * 90000000 + 10000000)}`,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(randomName())}&background=random`,
            },
        });
        users.push(user);
    }
    console.log(`✅ Created ${users.length} users`);

    // 2. Create 18 listings
    const landlords = users.filter(u => u.role === 'LANDLORD');
    for (let i = 0; i < 18; i++) {
        const landlord = landlords[i % landlords.length];
        const city = CITIES[Math.floor(Math.random() * CITIES.length)];
        const district = city.districts[Math.floor(Math.random() * city.districts.length)];
        const area = 15 + Math.floor(Math.random() * 30);
        const amenities = [...AMENITIES].sort(() => 0.5 - Math.random()).slice(0, 5);
        amenities.push(`furniture_${['full', 'basic', 'empty'][Math.floor(Math.random() * 3)]}`);

        await prisma.listing.create({
            data: {
                title: `Phòng trọ ${area}m² tại ${district}, ${city.name}`,
                description: `Phòng trọ sạch sẽ, thoáng mát. Giờ giấc tự do, an ninh 24/7.`,
                price: 1500000 + Math.floor(Math.random() * 50) * 100000,
                area,
                address: `${Math.floor(Math.random() * 500 + 1)} ${district}`,
                city: city.name,
                district,
                ward: `Phường ${Math.floor(Math.random() * 20 + 1)}`,
                lat: city.lat + (Math.random() - 0.5) * 0.1,
                lng: city.lng + (Math.random() - 0.5) * 0.1,
                amenities,
                status: Math.random() > 0.2 ? 'AVAILABLE' : 'UNAVAILABLE',
                landlordId: landlord.id,
                photos: {
                    create: [
                        { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', order: 0 },
                        { url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80', order: 1 },
                    ]
                }
            }
        });
    }
    console.log('✅ Created 18 listings');

    // 3. Create 10 roommate profiles
    const renters = users.filter(u => u.role === 'RENTER');
    for (const renter of renters) {
        const city = CITIES[Math.floor(Math.random() * CITIES.length)];
        const district = city.districts[Math.floor(Math.random() * city.districts.length)];
        const age = 20 + Math.floor(Math.random() * 15);
        const gender: 'MALE' | 'FEMALE' = Math.random() > 0.5 ? 'MALE' : 'FEMALE';
        const budgetMin = 1500000 + Math.floor(Math.random() * 20) * 100000;
        const occupation: 'STUDENT' | 'WORKER' | 'OTHER' = ['STUDENT', 'WORKER', 'OTHER'][Math.floor(Math.random() * 3)] as any;

        await prisma.roommateProfile.upsert({
            where: { userId: renter.id },
            update: {},
            create: {
                userId: renter.id,
                name: renter.name,
                age,
                gender,
                job: occupation === 'STUDENT' ? 'Sinh viên' : 'Nhân viên',
                budgetMin,
                budgetMax: budgetMin + 1000000,
                location: `${district}, ${city.name}`,
                intro: `Tìm bạn ở ghép tại ${district}. Mình ${age} tuổi, thân thiện!`,
                avatar: renter.avatar,
                habits: randomHobbies(),
                occupation,
            }
        });
    }
    console.log('✅ Created 10 roommate profiles\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SEED COMPLETE!');
    console.log('📊 SUMMARY: 20 users, 18 listings, 10 profiles');
    console.log('🔐 LOGIN: user1@motel.com - user20@motel.com | Password: 123456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
