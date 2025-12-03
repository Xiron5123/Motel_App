import { PrismaClient, Gender, Occupation } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // 1. Create Admin (if not exists)
    const adminEmail = 'admin@xmotelr.com';
    const adminPassword = await bcrypt.hash('admin123', 10);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            isActive: true,
            avatar: `https://ui-avatars.com/api/?name=Admin+User&background=FF9F1C&color=fff&size=128`,
        },
        create: {
            email: adminEmail,
            password: adminPassword,
            name: 'Admin User',
            role: 'ADMIN',
            phone: '0987654321',
            isActive: true,
            avatar: `https://ui-avatars.com/api/?name=Admin+User&background=FF9F1C&color=fff&size=128`,
        },
    });

    console.log('Admin created/verified.');

    // Helper for Vietnamese Names
    const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
    const middleNames = ['Văn', 'Thị', 'Minh', 'Thanh', 'Đức', 'Hồng', 'Quang', 'Kim', 'Hoài', 'Ngọc'];
    const firstNames = ['Anh', 'Bình', 'Châu', 'Dũng', 'Em', 'Giang', 'Hà', 'Hải', 'Hiếu', 'Hòa', 'Hùng', 'Huy', 'Khánh', 'Lan', 'Linh', 'Long', 'Mai', 'Minh', 'Nam', 'Nga', 'Nhi', 'Nhung', 'Phúc', 'Quân', 'Quỳnh', 'Sơn', 'Thảo', 'Thắng', 'Thủy', 'Trang', 'Trung', 'Tú', 'Tùng', 'Vân', 'Việt', 'Yến'];

    const generateVietnameseName = () => {
        const last = lastNames[Math.floor(Math.random() * lastNames.length)];
        const middle = middleNames[Math.floor(Math.random() * middleNames.length)];
        const first = firstNames[Math.floor(Math.random() * firstNames.length)];
        return `${last} ${middle} ${first}`;
    };

    // Locations Data
    const locations = [
        {
            city: 'Hồ Chí Minh',
            districts: ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 10', 'Bình Thạnh', 'Phú Nhuận', 'Tân Bình', 'Gò Vấp']
        },
        {
            city: 'Hà Nội',
            districts: ['Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Thanh Xuân']
        },
        {
            city: 'Đà Nẵng',
            districts: ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu']
        }
    ];

    // Furniture Options
    const furnitureOptions = ['furniture_full', 'furniture_basic', 'furniture_empty'];

    // 2. Create Landlords and Listings
    for (let i = 0; i < 10; i++) {
        const name = generateVietnameseName();
        // Create email from name (remove accents and spaces)
        const emailName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '.');
        const email = `${emailName}.${Math.floor(Math.random() * 1000)}@example.com`;
        const password = await bcrypt.hash('123456', 10);

        const user = await prisma.user.create({
            data: {
                email,
                password,
                name,
                role: 'LANDLORD',
                phone: faker.phone.number(),
                isActive: true,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`,
            },
        });

        // Create Listings for this landlord
        const numListings = Math.floor(Math.random() * 5) + 2; // 2-6 listings
        for (let j = 0; j < numListings; j++) {
            const location = locations[Math.floor(Math.random() * locations.length)];
            const district = location.districts[Math.floor(Math.random() * location.districts.length)];
            const price = parseFloat(faker.commerce.price({ min: 2000000, max: 15000000 }));
            const area = faker.number.float({ min: 15, max: 60, fractionDigits: 1 });

            // Determine furniture
            const furnitureType = furnitureOptions[Math.floor(Math.random() * furnitureOptions.length)];
            const amenities = ['Wifi', 'Chỗ để xe'];
            if (furnitureType === 'furniture_full') {
                amenities.push('Máy lạnh', 'Tủ lạnh', 'Máy giặt', 'Giường', 'Tủ quần áo', 'furniture_full');
            } else if (furnitureType === 'furniture_basic') {
                amenities.push('Máy lạnh', 'Giường', 'furniture_basic');
            } else {
                amenities.push('furniture_empty');
            }

            // Randomly add other amenities
            if (Math.random() > 0.5) amenities.push('Ban công');
            if (Math.random() > 0.5) amenities.push('Thang máy');
            if (Math.random() > 0.5) amenities.push('Bảo vệ 24/7');

            await prisma.listing.create({
                data: {
                    landlordId: user.id,
                    title: `Phòng trọ ${district} - ${area}m2 - ${furnitureType === 'furniture_full' ? 'Full nội thất' : furnitureType === 'furniture_basic' ? 'Nội thất cơ bản' : 'Nhà trống'}`,
                    description: `Cho thuê phòng trọ tại ${district}, ${location.city}.\nDiện tích: ${area}m2.\nGiá: ${price.toLocaleString('vi-VN')} VND.\nTiện ích: ${amenities.join(', ')}.\nLiên hệ ngay: ${user.phone}`,
                    price: price,
                    deposit: price,
                    area: area,
                    address: `${faker.number.int({ min: 1, max: 999 })} đường ${faker.person.lastName()}`, // Fake street name roughly
                    city: location.city,
                    district: district,
                    ward: 'Phường X',
                    amenities: amenities,
                    status: 'AVAILABLE',
                    photos: {
                        create: [
                            { url: `https://picsum.photos/seed/${faker.string.uuid()}/800/600` },
                            { url: `https://picsum.photos/seed/${faker.string.uuid()}/800/600` },
                            { url: `https://picsum.photos/seed/${faker.string.uuid()}/800/600` },
                        ]
                    }
                }
            });
        }
    }
    console.log('Landlords and Listings created.');

    // 3. Create Renters and Roommate Profiles
    const jobs = ['Sinh viên', 'Nhân viên văn phòng', 'Lập trình viên', 'Kế toán', 'Marketing', 'Giáo viên', 'Bác sĩ', 'Kỹ sư', 'Designer', 'Freelancer'];
    const intros = [
        'Mình là người hòa đồng, vui vẻ, sạch sẽ.',
        'Cần tìm bạn ở ghép tính tình thoải mái, tôn trọng riêng tư.',
        'Mình đi làm cả ngày, tối về chỉ cần yên tĩnh nghỉ ngơi.',
        'Thích nấu ăn, cuối tuần có thể cùng nhau nấu nướng.',
        'Không hút thuốc, không nuôi thú cưng, sống kỷ luật.',
        'Tìm bạn ở ghép khu vực trung tâm để tiện đi làm.',
        'Sinh viên năm cuối cần tìm người ở ghép để share tiền phòng.',
        'Mình khá trầm tính, ít nói nhưng sống biết điều.'
    ];

    for (let i = 0; i < 20; i++) {
        const name = generateVietnameseName();
        const emailName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '.');
        const email = `${emailName}.${Math.floor(Math.random() * 1000)}@example.com`;
        const password = await bcrypt.hash('123456', 10);

        const user = await prisma.user.create({
            data: {
                email,
                password,
                name,
                role: 'RENTER',
                phone: faker.phone.number(),
                isActive: Math.random() > 0.05, // 5% chance of being locked
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`,
            },
        });

        // Create Roommate Profile for some renters (60%)
        if (Math.random() > 0.4) {
            const location = locations[Math.floor(Math.random() * locations.length)];
            const district = location.districts[Math.floor(Math.random() * location.districts.length)];

            await prisma.roommateProfile.create({
                data: {
                    userId: user.id,
                    name: user.name,
                    age: faker.number.int({ min: 18, max: 35 }),
                    gender: Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE,
                    job: jobs[Math.floor(Math.random() * jobs.length)],
                    budgetMin: 1500000,
                    budgetMax: 5000000,
                    location: `${district}, ${location.city}`,
                    intro: intros[Math.floor(Math.random() * intros.length)],
                    occupation: Math.random() > 0.3 ? Occupation.WORKER : Occupation.STUDENT,
                    habits: ['Sạch sẽ', 'Không hút thuốc', 'Thích yên tĩnh', 'Hòa đồng'].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1),
                }
            });
        }
    }
    console.log('Renters and Roommate Profiles created.');
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
