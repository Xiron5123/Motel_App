import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) { }

  @Post('conversations')
  @ApiOperation({ summary: 'Tạo hoặc lấy conversation với user khác' })
  createConversation(
    @GetUser('id') userId: string,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.getOrCreateConversation(userId, dto.participantId, dto.listingId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Lấy danh sách conversations' })
  getConversations(@GetUser('id') userId: string) {
    return this.chatService.getConversations(userId);
  }

  @Get('landlord/bookings')
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu thuê phòng (cho landlord)' })
  getLandlordBookings(@GetUser('id') landlordId: string) {
    return this.chatService.getConversations(landlordId);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Lấy chi tiết conversation' })
  getConversation(
    @Param('id') conversationId: string,
    @GetUser('id') userId: string,
  ) {
    return this.chatService.getConversationById(conversationId, userId);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Lấy messages trong conversation' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'before', required: false, type: String })
  getMessages(
    @Param('id') conversationId: string,
    @GetUser('id') userId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ) {
    return this.chatService.getMessages(
      conversationId,
      userId,
      limit ? +limit : 50,
      before,
    );
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Gửi message' })
  sendMessage(
    @Param('id') conversationId: string,
    @GetUser('id') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(conversationId, userId, dto.content, dto.imageUrl, dto.listingId);
  }

  @Patch('conversations/:id/read')
  @ApiOperation({ summary: 'Đánh dấu đã đọc' })
  markAsRead(
    @Param('id') conversationId: string,
    @GetUser('id') userId: string,
  ) {
    return this.chatService.markAsRead(conversationId, userId);
  }
}
