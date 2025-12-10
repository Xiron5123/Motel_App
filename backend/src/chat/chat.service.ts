/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  // Tạo hoặc lấy conversation giữa 2 users
  async getOrCreateConversation(
    userId1: string,
    userId2: string,
    listingId?: string,
  ) {
    // Tìm conversation đã tồn tại với đúng 2 users này
    const conversations = await this.prisma.conversation.findMany({
      where: {
        AND: [
          {
            participants: {
              some: { userId: userId1 },
            },
          },
          {
            participants: {
              some: { userId: userId2 },
            },
          },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { sentAt: 'desc' },
        },
      },
    });

    // Tìm conversation có đúng 2 participants
    const existing = conversations.find(
      (conv) => conv.participants.length === 2,
    );

    if (existing) {
      return existing;
    }

    // Tạo mới conversation (handle race condition)
    try {
      const conversation = await this.prisma.conversation.create({
        data: {
          participants: {
            create: [{ userId: userId1 }, { userId: userId2 }],
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                  role: true,
                },
              },
            },
          },
          messages: true,
        },
      });

      return conversation;
    } catch (error: any) {
      // Nếu bị race condition, thử tìm lại
      if (error.code === 'P2002') {
        const retryConversations = await this.prisma.conversation.findMany({
          where: {
            AND: [
              { participants: { some: { userId: userId1 } } },
              { participants: { some: { userId: userId2 } } },
            ],
          },
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    role: true,
                  },
                },
              },
            },
            messages: {
              take: 1,
              orderBy: { sentAt: 'desc' },
            },
          },
        });

        const found = retryConversations.find(
          (conv) => conv.participants.length === 2,
        );

        if (found) {
          return found;
        }
      }
      throw error;
    }
  }

  // Lấy danh sách conversations của user
  async getConversations(userId: string) {
    console.log(`[ChatService] getConversations for userId: ${userId}`);
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { sentAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            listing: {
              select: {
                id: true,
                title: true,
                price: true,
                photos: {
                  take: 1,
                  select: { url: true },
                },
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    console.log(`[ChatService] Found ${conversations.length} conversations`);

    // Get unread counts for all conversations at once (avoid N+1 query)
    const conversationIds = conversations.map((c) => c.id);

    const unreadCounts = await this.prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: userId }, // Không tính tin nhắn của chính mình
        readAt: null, // Chưa đọc
      },
      _count: {
        id: true,
      },
    });

    // Create a map for quick lookup
    const unreadCountMap = new Map(
      unreadCounts.map((item) => [item.conversationId, item._count.id]),
    );

    // Format response với last message và unread count
    return conversations.map((conv) => ({
      id: conv.id,
      lastMessageAt: conv.lastMessageAt,
      createdAt: conv.createdAt,
      participants: conv.participants.map((p) => p.user),
      lastMessage: conv.messages[0] || null,
      unreadCount: unreadCountMap.get(conv.id) || 0,
    }));
  }

  // Lấy chi tiết conversation
  async getConversationById(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Không tìm thấy cuộc trò chuyện');
    }

    // Kiểm tra user có trong conversation không
    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException(
        'Bạn không phải là thành viên của cuộc trò chuyện này',
      );
    }

    return conversation;
  }

  // Lấy messages trong conversation
  async getMessages(
    conversationId: string,
    userId: string,
    limit = 50,
    before?: string,
  ) {
    console.log(
      `[ChatService] getMessages for conversation: ${conversationId}, user: ${userId}`,
    );
    // Verify user is participant
    await this.getConversationById(conversationId, userId);

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
        // NOT: {
        //   deletedBy: {
        //     has: userId,
        //   },
        // },
        ...(before && {
          sentAt: {
            lt: new Date(before),
          },
        }),
      },
      take: limit,
      orderBy: { sentAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            address: true,
            photos: {
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    });

    console.log(`[ChatService] Found ${messages.length} messages`);
    return messages; // Trả về newest -> oldest (để inverted FlatList hiển thị đúng)
  }

  // Gửi message
  async sendMessage(
    conversationId: string,
    senderId: string,
    content?: string,
    imageUrl?: string,
    listingId?: string,
  ) {
    // Verify user is participant
    await this.getConversationById(conversationId, senderId);

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        imageUrl,
        listingId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update lastMessageAt
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Emit real-time event
    this.eventsGateway.emitToRoom(conversationId, 'new_message', message);

    return message;
  }

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string) {
    await this.getConversationById(conversationId, userId);

    // Update all unread messages in this conversation
    const result = await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId }, // Chỉ mark messages của người khác
        readAt: null, // Chưa đọc
      },
      data: {
        readAt: new Date(),
      },
    });

    // Emit real-time event if any messages were updated
    if (result.count > 0) {
      this.eventsGateway.emitToRoom(conversationId, 'messages_read', {
        conversationId,
        userId,
        count: result.count,
      });
    }

    return { message: 'Đã đánh dấu là đã đọc', count: result.count };
  }

  // Thu hồi tin nhắn
  async recallMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Không tìm thấy tin nhắn');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException(
        'Bạn chỉ có thể thu hồi tin nhắn của chính mình',
      );
    }

    const updatedMessage = await this.prisma.message.update({
      where: { id: messageId },
      data: { isRecalled: true },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            address: true,
            photos: {
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    });

    // Emit event
    this.eventsGateway.emitToRoom(
      message.conversationId,
      'message_recalled',
      updatedMessage,
    );

    return updatedMessage;
  }

  // Xóa tin nhắn ở phía người dùng (Gỡ)
  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Không tìm thấy tin nhắn');
    }

    // Verify user is participant (optional but good for security)
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: message.conversationId },
      include: { participants: true },
    });

    const isParticipant = conversation?.participants.some(
      (p) => p.userId === userId,
    );

    if (!isParticipant) {
      throw new ForbiddenException(
        'Bạn không phải là thành viên của cuộc trò chuyện này',
      );
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        deletedBy: {
          push: userId,
        },
      },
    });

    return { message: 'Đã xóa tin nhắn' };
  }
}
