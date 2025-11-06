import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  private userSockets = new Map<string, Set<string>>(); // userId -> Set<socketId>
  private typingUsers = new Map<string, Set<string>>(); // conversationId -> Set<userId>

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove from userSockets
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }

    // Remove from typing
    for (const [conversationId, users] of this.typingUsers.entries()) {
      const userId = this.getUserIdBySocketId(client.id);
      if (userId && users.has(userId)) {
        users.delete(userId);
        this.emitTypingStatus(conversationId);
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    const { userId } = data;

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);

    this.logger.log(`User ${userId} registered with socket ${client.id}`);

    // Join user's conversations
    this.joinUserConversations(userId, client);

    return { status: 'registered', userId };
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const { conversationId } = data;
    client.join(conversationId);
    this.logger.log(`Socket ${client.id} joined conversation ${conversationId}`);
    return { status: 'joined', conversationId };
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const { conversationId } = data;
    client.leave(conversationId);
    this.logger.log(`Socket ${client.id} left conversation ${conversationId}`);
    return { status: 'left', conversationId };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; userId: string; content: string },
  ) {
    const { conversationId, userId, content } = data;

    try {
      const message = await this.chatService.sendMessage(
        conversationId,
        userId,
        content,
      );

      // Emit to all clients in the conversation
      this.server.to(conversationId).emit('new_message', message);

      this.logger.log(`Message sent to conversation ${conversationId}`);
      return { status: 'sent', message };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; userId: string },
  ) {
    const { conversationId, userId } = data;

    if (!this.typingUsers.has(conversationId)) {
      this.typingUsers.set(conversationId, new Set());
    }
    this.typingUsers.get(conversationId)!.add(userId);

    this.emitTypingStatus(conversationId);

    return { status: 'typing_started' };
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; userId: string },
  ) {
    const { conversationId, userId } = data;

    const users = this.typingUsers.get(conversationId);
    if (users) {
      users.delete(userId);
      if (users.size === 0) {
        this.typingUsers.delete(conversationId);
      }
    }

    this.emitTypingStatus(conversationId);

    return { status: 'typing_stopped' };
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; userId: string },
  ) {
    const { conversationId, userId } = data;

    try {
      await this.chatService.markAsRead(conversationId, userId);

      // Emit read receipt to conversation
      this.server.to(conversationId).emit('message_read', {
        conversationId,
        userId,
        readAt: new Date(),
      });

      return { status: 'marked_read' };
    } catch (error) {
      this.logger.error(`Error marking as read: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  // Helper methods
  private async joinUserConversations(userId: string, client: Socket) {
    try {
      const conversations = await this.chatService.getConversations(userId);
      conversations.forEach((conv) => {
        client.join(conv.id);
        this.logger.log(`User ${userId} auto-joined conversation ${conv.id}`);
      });
    } catch (error) {
      this.logger.error(`Error joining conversations: ${error.message}`);
    }
  }

  private emitTypingStatus(conversationId: string) {
    const users = this.typingUsers.get(conversationId);
    const typingUserIds = users ? Array.from(users) : [];

    this.server.to(conversationId).emit('typing_status', {
      conversationId,
      typingUsers: typingUserIds,
    });
  }

  private getUserIdBySocketId(socketId: string): string | undefined {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(socketId)) {
        return userId;
      }
    }
    return undefined;
  }

  // Public method to send message from REST API
  sendMessageToConversation(conversationId: string, message: any) {
    this.server.to(conversationId).emit('new_message', message);
  }
}
