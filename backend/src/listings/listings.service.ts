import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';
import { AddPhotoDto } from './dto/add-photo.dto';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  async create(landlordId: string, dto: CreateListingDto) {
    const listing = await this.prisma.listing.create({
      data: {
        ...dto,
        landlordId,
      },
      include: {
        photos: true,
        landlord: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    // Tự động nâng cấp từ RENTER lên LANDLORD khi đăng tin
    const user = await this.prisma.user.findUnique({
      where: { id: landlordId },
    });
    if (user && user.role === 'RENTER') {
      await this.prisma.user.update({
        where: { id: landlordId },
        data: { role: 'LANDLORD' },
      });
    }

    return listing;
  }

  async findAll(query: QueryListingDto) {
    const {
      q,
      priceMin,
      priceMax,
      areaMin,
      areaMax,
      amenities,
      lat,
      lng,
      radius,
      status,
      sortBy,
      page = 1,
      limit = 10,
      city,
      district,
    } = query;

    const skip = (page - 1) * limit;

    // Xây dựng điều kiện WHERE cho tìm kiếm
    const where: any = {};

    // Tìm kiếm văn bản (Tách thành từng từ để kết quả tốt hơn)
    if (q) {
      const searchTerms = q.trim().split(/\s+/);
      where.AND = searchTerms.map((term) => ({
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { address: { contains: term, mode: 'insensitive' } },
        ],
      }));
    }

    // Lọc theo vị trí (Thành phố/Quận)
    if (query.city) {
      where.city = { contains: query.city, mode: 'insensitive' };
    }
    if (query.district) {
      where.district = { contains: query.district, mode: 'insensitive' };
    }

    // Khoảng giá
    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) where.price.gte = priceMin;
      if (priceMax !== undefined) where.price.lte = priceMax;
    }

    // Khoảng diện tích
    if (areaMin !== undefined || areaMax !== undefined) {
      where.area = {};
      if (areaMin !== undefined) where.area.gte = areaMin;
      if (areaMax !== undefined) where.area.lte = areaMax;
    }

    // Lọc theo tiện ích
    if (amenities && amenities.length > 0) {
      where.amenities = {
        hasEvery: amenities,
      };
    }

    // Lọc theo trạng thái
    if (status) {
      where.status = status;
    } else {
      // Mặc định: chỉ hiển thị các tin đang AVAILABLE (Sẵn có)
      where.status = 'AVAILABLE';
    }

    // Lọc ra các tin từ chủ trọ bị khóa (users không hoạt động)
    where.landlord = {
      isActive: true,
    };

    // Xác định thứ tự sắp xếp
    let orderBy: any = { createdAt: 'desc' }; // Mặc định
    if (sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'created_asc') {
      orderBy = { createdAt: 'asc' };
    } else if (sortBy === 'created_desc') {
      orderBy = { createdAt: 'desc' };
    }
    // Lưu ý: Sắp xếp theo khoảng cách sẽ thực hiện sau khi query nếu có lat/lng

    // Lấy danh sách tin đăng
    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip,
        take: limit,
        include: {
          photos: {
            orderBy: { order: 'asc' },
          },
          landlord: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              favorites: true,
            },
          },
        },
        orderBy,
      }),
      this.prisma.listing.count({ where }),
    ]);

    // Áp dụng lọc theo vị trí GPS nếu có (khoảng cách Haversine)
    let filteredListings = listings;
    if (lat !== undefined && lng !== undefined) {
      // Tính khoảng cách cho mỗi tin đăng
      filteredListings = listings
        .map((listing) => ({
          ...listing,
          distance:
            listing.lat && listing.lng
              ? this.calculateDistance(lat, lng, listing.lat, listing.lng)
              : null,
        }))
        .filter((listing) => {
          if (!listing.distance) return false;
          return radius ? listing.distance <= radius : true;
        });

      // Sắp xếp theo khoảng cách nếu được yêu cầu
      if (sortBy === 'distance') {
        filteredListings.sort(
          (a: any, b: any) => (a.distance || 0) - (b.distance || 0),
        );
      }
    }

    return {
      data: filteredListings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
        landlord: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            email: true,
            isActive: true, // Chọn isActive để kiểm tra trạng thái
          },
        },
        _count: {
          select: {
            favorites: true,
            bookingRequests: true,
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // Kiểm tra xem chủ trọ có đang hoạt động không
    if (!listing.landlord.isActive) {
      throw new NotFoundException('Listing not found (Landlord inactive)');
    }

    return listing;
  }

  async update(id: string, landlordId: string, dto: UpdateListingDto) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.landlordId !== landlordId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: dto,
      include: {
        photos: true,
        landlord: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    return updated;
  }

  async toggleHidden(id: string, landlordId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.landlordId !== landlordId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    const newStatus =
      listing.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';

    const updated = await this.prisma.listing.update({
      where: { id },
      data: { status: newStatus },
    });

    return updated;
  }

  async remove(id: string, landlordId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.landlordId !== landlordId) {
      throw new ForbiddenException('You can only delete your own listings');
    }

    await this.prisma.listing.delete({
      where: { id },
    });

    return { message: 'Listing deleted successfully' };
  }

  async addPhoto(listingId: string, landlordId: string, dto: AddPhotoDto) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.landlordId !== landlordId) {
      throw new ForbiddenException(
        'You can only add photos to your own listings',
      );
    }

    const photo = await this.prisma.photo.create({
      data: {
        listingId,
        url: dto.url,
        order: dto.order || 0,
      },
    });

    return photo;
  }

  async removePhoto(photoId: string, landlordId: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
      include: { listing: true },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (photo.listing.landlordId !== landlordId) {
      throw new ForbiddenException(
        'You can only delete photos from your own listings',
      );
    }

    await this.prisma.photo.delete({
      where: { id: photoId },
    });

    return { message: 'Photo deleted successfully' };
  }

  async getMyListings(landlordId: string, query: QueryListingDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: { landlordId },
        skip,
        take: limit,
        include: {
          photos: {
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              favorites: true,
              bookingRequests: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.listing.count({ where: { landlordId } }),
    ]);

    return {
      data: listings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Công thức Haversine tính khoảng cách giữa hai tọa độ
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Bán kính KM của Trái Đất
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
