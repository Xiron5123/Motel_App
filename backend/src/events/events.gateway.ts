import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Trong production nên giới hạn origins cụ thể
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');

  // Map để lưu user đang online
  private userSockets = new Map<string, Set<string>>(); // userId -> Set<socketId>

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Xóa khỏi map
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  // User authenticate với socket (gọi từ client sau khi login)
  registerUser(userId: string, socketId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
    this.logger.log(`User ${userId} registered with socket ${socketId}`);
  }

  // Gửi notification cho user cụ thể
  sendNotificationToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets && sockets.size > 0) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
      this.logger.log(
        `Sent ${event} to user ${userId} (${sockets.size} sockets)`,
      );
    } else {
      this.logger.log(`User ${userId} not connected`);
    }
  }

  // Gửi notification cho nhiều users
  sendNotificationToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach((userId) => {
      this.sendNotificationToUser(userId, event, data);
    });
  }

  // Broadcast cho tất cả
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.log(`Broadcasted ${event}`);
  }

  // Room support for chat
  @SubscribeMessage('join_conversation')
  handleJoinConversation(client: Socket, payload: { conversationId: string }) {
    client.join(payload.conversationId);
    this.logger.log(
      `Client ${client.id} joined conversation ${payload.conversationId}`,
    );
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(client: Socket, payload: { conversationId: string }) {
    client.leave(payload.conversationId);
    this.logger.log(
      `Client ${client.id} left conversation ${payload.conversationId}`,
    );
  }

  emitToRoom(roomId: string, event: string, data: any) {
    this.server.to(roomId).emit(event, data);
    this.logger.log(`Emitted ${event} to room ${roomId}`);
  }
}
