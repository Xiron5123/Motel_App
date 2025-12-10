import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Role } from '@prisma/client';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo booking request (RENTER)' })
  createBooking(@GetUser('id') userId: string, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bookings (theo role)' })
  getBookings(@GetUser('id') userId: string, @GetUser('role') userRole: Role) {
    return this.bookingsService.getBookings(userId, userRole);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết booking' })
  getBookingById(
    @Param('id') bookingId: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.bookingsService.getBookingById(bookingId, userId, userRole);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái booking' })
  updateBookingStatus(
    @Param('id') bookingId: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateBookingStatus(
      bookingId,
      userId,
      userRole,
      dto,
    );
  }
}
