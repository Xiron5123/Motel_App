import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class BecomeLandlordDto {
  @ApiProperty({
    example: '0123456789',
    description: 'Phone number (required if not provided during registration)',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'Tôi muốn cho thuê phòng trọ tại Hà Nội',
    description: 'Reason for becoming a landlord',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
