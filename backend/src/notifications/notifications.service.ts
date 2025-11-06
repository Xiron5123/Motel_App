import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum NotificationType {
  BOOKING_CREATED = 'booking_created',
  BOOKING_ACCEPTED = 'booking_accepted',
  BOOKING_REJECTED = 'booking_rejected',
  BOOKING_CANCELLED = 'booking_cancelled',
  NEW_MESSAGE = 'new_message',
}

export interface NotificationData {
  bookingId?: string;
  listingId?: string;
  listingTitle?: string;
  conversationId?: string;
  senderName?: string;
  message?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Tạo notification
  async createNotification(
    userId: string,
    type: NotificationType,
    data: NotificationData,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        data: data as any,
      },
    });
  }

  // Lấy danh sách notifications của user
  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Giới hạn 50 notifications mới nhất
    });
  }

  // Đánh dấu đã đọc
  async markAsRead(notificationId: string, userId: string) {
    // Kiểm tra ownership
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new Error('Notification không tồn tại');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  // Đánh dấu tất cả đã đọc
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return { message: 'Đã đánh dấu tất cả đã đọc' };
  }

  // Lấy số lượng unread
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });

    return { unreadCount: count };
  }
}
