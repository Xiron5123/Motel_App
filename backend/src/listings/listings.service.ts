import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

    return listing;
  }

  async findAll(query: QueryListingDto) {
    const { q, priceMin, priceMax, amenities, lat, lng, radius, status, page = 1, limit = 10 } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Text search
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Price range
    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) where.price.gte = priceMin;
      if (priceMax !== undefined) where.price.lte = priceMax;
    }

    // Amenities filter
    if (amenities && amenities.length > 0) {
      where.amenities = {
        hasEvery: amenities,
      };
    }

    // Status filter
    if (status) {
      where.status = status;
    } else {
      // Default: only show AVAILABLE listings
      where.status = 'AVAILABLE';
    }

    // Get listings
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
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.listing.count({ where }),
    ]);

    // Apply geo filter if provided (Haversine distance)
    let filteredListings = listings;
    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      filteredListings = listings.filter((listing) => {
        if (!listing.lat || !listing.lng) return false;
        const distance = this.calculateDistance(lat, lng, listing.lat, listing.lng);
        return distance <= radius;
      });
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
      throw new ForbiddenException('You can only add photos to your own listings');
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
      throw new ForbiddenException('You can only delete photos from your own listings');
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

  // Haversine formula to calculate distance between two coordinates
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in km
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
