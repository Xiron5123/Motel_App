import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) { }

  @Post('token')
  @ApiOperation({ summary: 'Đăng ký push token' })
  registerPushToken(
    @GetUser('id') userId: string,
    @Body('token') token: string,
  ) {
    return this.notificationsService.registerPushToken(userId, token);
  }

  @Delete('token')
  @ApiOperation({ summary: 'Hủy đăng ký push token' })
  unregisterPushToken(@Body('token') token: string) {
    return this.notificationsService.unregisterPushToken(token);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách notifications' })
  getNotifications(@GetUser('id') userId: string) {
    return this.notificationsService.getNotifications(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Lấy số lượng notifications chưa đọc' })
  getUnreadCount(@GetUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Đánh dấu notification đã đọc' })
  markAsRead(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Đánh dấu tất cả notifications đã đọc' })
  markAllAsRead(@GetUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }
}
