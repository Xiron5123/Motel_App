import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  // Thêm listing vào favorites
  async addFavorite(userId: string, listingId: string) {
    // Kiểm tra listing có tồn tại không
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing không tồn tại');
    }

    // Kiểm tra đã favorite chưa
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Đã lưu listing này rồi');
    }

    return this.prisma.favorite.create({
      data: {
        userId,
        listingId,
      },
      include: {
        listing: {
          include: {
            photos: {
              orderBy: { order: 'asc' },
              take: 1,
            },
          },
        },
      },
    });
  }

  // Xóa listing khỏi favorites
  async removeFavorite(userId: string, listingId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Chưa lưu listing này');
    }

    await this.prisma.favorite.delete({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    return { message: 'Đã xóa khỏi danh sách yêu thích' };
  }

  // Lấy danh sách favorites của user
  async getFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            photos: {
              orderBy: { order: 'asc' },
            },
            landlord: {
              select: {
                id: true,
                name: true,
                avatar: true,
                phone: true,
              },
            },
            _count: {
              select: {
                favorites: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return favorites.map((fav) => ({
      ...fav.listing,
      favoritedAt: fav.createdAt,
    }));
  }

  // Kiểm tra user đã favorite listing chưa
  async isFavorited(userId: string, listingId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    return !!favorite;
  }
}
