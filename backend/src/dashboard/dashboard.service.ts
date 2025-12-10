import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalListings, pendingReports, acceptedBookings] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.listing.count(),
        this.prisma.report.count({
          where: { status: 'PENDING' },
        }),
        this.prisma.bookingRequest.count({
          where: { status: 'ACCEPTED' },
        }),
      ]);

    // Get recent activities (new listings)
    const recentListings = await this.prisma.listing.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        landlord: {
          select: { name: true },
        },
      },
    });

    return {
      stats: [
        { label: 'Tổng người dùng', value: totalUsers, type: 'users' },
        { label: 'Tin đăng hiện có', value: totalListings, type: 'listings' },
        { label: 'Báo cáo chờ xử lý', value: pendingReports, type: 'reports' },
        {
          label: 'Đơn đặt phòng thành công',
          value: acceptedBookings,
          type: 'bookings',
        },
      ],
      recentActivities: recentListings.map((listing) => ({
        id: listing.id,
        user: listing.landlord.name,
        action: 'đăng tin mới',
        target: listing.title,
        time: listing.createdAt,
      })),
    };
  }
}
