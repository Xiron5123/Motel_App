import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // Tạo hoặc lấy conversation giữa 2 users
  async getOrCreateConversation(userId1: string, userId2: string) {
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
            create: [
              { userId: userId1 },
              { userId: userId2 },
            ],
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
    } catch (error) {
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
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    // Format response với last message
    return conversations.map((conv) => ({
      id: conv.id,
      lastMessageAt: conv.lastMessageAt,
      createdAt: conv.createdAt,
      participants: conv.participants.map((p) => p.user),
      lastMessage: conv.messages[0] || null,
      unreadCount: 0, // TODO: implement unread count
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
      throw new NotFoundException('Conversation not found');
    }

    // Kiểm tra user có trong conversation không
    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    return conversation;
  }

  // Lấy messages trong conversation
  async getMessages(conversationId: string, userId: string, limit = 50, before?: string) {
    // Verify user is participant
    await this.getConversationById(conversationId, userId);

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
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
      },
    });

    return messages.reverse(); // Trả về oldest -> newest
  }

  // Gửi message
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ) {
    // Verify user is participant
    await this.getConversationById(conversationId, senderId);

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
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

    return message;
  }

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string) {
    await this.getConversationById(conversationId, userId);

    // TODO: implement read receipts
    return { message: 'Marked as read' };
  }
}
