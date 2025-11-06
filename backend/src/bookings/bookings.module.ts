import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EventsGateway } from '../events/events.gateway';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [BookingsService, EventsGateway],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
