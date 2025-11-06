import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingStatusDto {
  @ApiProperty({
    description: 'Trạng thái mới của booking',
    enum: BookingStatus,
    example: BookingStatus.ACCEPTED,
  })
  @IsNotEmpty()
  @IsEnum(BookingStatus)
  status: BookingStatus;
}
