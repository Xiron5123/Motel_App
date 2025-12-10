import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    example: 'Xin chào, phòng này còn trống không?',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    example: 'clxxxx',
    description: 'Listing ID to attach to message',
    required: false,
  })
  @IsString()
  @IsOptional()
  listingId?: string;
}
