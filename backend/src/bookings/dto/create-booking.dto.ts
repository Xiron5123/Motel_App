import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID của listing muốn đặt',
    example: 'clx123abc',
  })
  @IsNotEmpty()
  @IsString()
  listingId: string;

  @ApiPropertyOptional({
    description: 'Ghi chú cho landlord',
    example: 'Tôi muốn xem phòng vào thứ 7 tuần này',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
