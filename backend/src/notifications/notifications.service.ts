import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { NotificationType } from '@prisma/client';

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
  private expo: Expo;

  constructor(private prisma: PrismaService) {
    this.expo = new Expo();
  }

  // Register push token
  async registerPushToken(userId: string, token: string) {
    // Remove existing token if exists
    await this.prisma.pushToken.deleteMany({
      where: { token },
    });

    return this.prisma.pushToken.create({
      data: { userId, token },
    });
  }

  // Unregister push token
  async unregisterPushToken(token: string) {
    return this.prisma.pushToken.deleteMany({
      where: { token },
    });
  }

  // Send push notification
  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any,
  ) {
    const pushTokens = await this.prisma.pushToken.findMany({
      where: { userId },
    });

    if (pushTokens.length === 0) return;

    const messages: ExpoPushMessage[] = [];
    for (const { token } of pushTokens) {
      if (!Expo.isExpoPushToken(token)) continue;

      messages.push({
        to: token,
        sound: 'default',
        title,
        body,
        data,
      });
    }

    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error('Push error:', error);
      }
    }
  }

  // Send message notification
  async sendMessageNotification(
    recipientId: string,
    senderName: string,
    messagePreview: string,
    conversationId: string,
  ) {
    return this.sendPushNotification(
      recipientId,
      `Tin nhắn từ ${senderName}`,
      messagePreview,
      { type: 'message', conversationId },
    );
  }

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
        title: this.getNotificationTitle(type, data),
        body: this.getNotificationBody(type, data),
        data: data as any,
      },
    });
  }

  private getNotificationTitle(type: NotificationType, data: NotificationData): string {
    switch (type) {
      case NotificationType.MESSAGE:
        return `Tin nhắn từ ${data.senderName}`;
      case NotificationType.BOOKING:
        return 'Yêu cầu đặt phòng mới';
      case NotificationType.SYSTEM:
        return 'Thông báo hệ thống';
      default:
        return 'Thông báo';
    }
  }

  private getNotificationBody(type: NotificationType, data: NotificationData): string {
    switch (type) {
      case NotificationType.MESSAGE:
        return data.message || '';
      case NotificationType.BOOKING:
        return `Có yêu cầu đặt phòng cho ${data.listingTitle}`;
      case NotificationType.SYSTEM:
        return '';
      default:
        return '';
    }
  }

  // Lấy danh sách notifications của user
  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // Đánh dấu đã đọc
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification không tồn tại');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  // Đánh dấu tất cả đã đọc
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'Đã đánh dấu tất cả đã đọc' };
  }

  // Lấy số lượng unread
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { unreadCount: count };
  }
}
