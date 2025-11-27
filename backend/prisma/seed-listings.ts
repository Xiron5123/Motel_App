import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding listings...');

    // 1. Find a landlord user (or create one)
    let landlord = await prisma.user.findFirst({
        where: { role: 'LANDLORD' },
    });

    if (!landlord) {
        console.log('No landlord found, creating one...');
        landlord = await prisma.user.create({
            data: {
                email: 'landlord@example.com',
                password: '$2b$10$EpIxNwllq.wOrgh9j.UrUOa.a.a.a.a.a.a.a.a.a.a.a.a.a', // dummy hash
                name: 'Chủ Trọ Mẫu',
                role: 'LANDLORD',
                phone: '0909000111',
            },
        });
    }

    const listings = [
        {
            title: 'Phòng trọ studio full nội thất Q.1',
            description: 'Phòng studio cao cấp, đầy đủ nội thất, ngay trung tâm Quận 1. An ninh 24/7, giờ giấc tự do.',
            price: 4.5,
            area: 30,
            address: 'Đ. Nguyễn Trãi, P. Bến Thành, Q.1, TP. HCM',
            city: 'TP. Hồ Chí Minh',
            district: 'Quận 1',
            amenities: ['wifi', 'ac', 'kitchen', 'parking', 'wc'],
            images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80'],
        },
        {
            title: 'Căn hộ mini ban công thoáng mát',
            description: 'Căn hộ mini mới xây, có ban công rộng, thoáng mát. Gần chợ, siêu thị, trường học.',
            price: 3.8,
            area: 35,
            address: 'Đ. Lê Văn Sỹ, P.14, Q.3, TP. HCM',
            city: 'TP. Hồ Chí Minh',
            district: 'Quận 3',
            amenities: ['wifi', 'ac', 'parking', 'wc'],
            images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=2360&q=80'],
        },
        {
            title: 'Phòng gác lửng gần đại học',
            description: 'Phòng trọ có gác lửng, sạch sẽ, thoáng mát. Phù hợp cho sinh viên, gần các trường đại học lớn.',
            price: 2.5,
            area: 20,
            address: 'Đ. D2, P.25, Q. Bình Thạnh, TP. HCM',
            city: 'TP. Hồ Chí Minh',
            district: 'Bình Thạnh',
            amenities: ['wifi', 'parking', 'wc'],
            images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80'],
        },
    ];

    for (const listingData of listings) {
        const listing = await prisma.listing.create({
            data: {
                title: listingData.title,
                description: listingData.description,
                price: listingData.price,
                area: listingData.area,
                address: listingData.address,
                city: listingData.city,
                district: listingData.district,
                amenities: listingData.amenities,
                landlordId: landlord.id,
                lat: 10.762622, // Mock coords
                lng: 106.660172,
            },
        });

        // Add photos
        for (let i = 0; i < listingData.images.length; i++) {
            await prisma.photo.create({
                data: {
                    url: listingData.images[i],
                    listingId: listing.id,
                    order: i,
                },
            });
        }
        console.log(`Created listing: ${listing.title}`);
    }

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
