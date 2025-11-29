import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({ example: 'clxxx123', description: 'ID của user muốn chat' })
  @IsString()
  @IsNotEmpty()
  participantId: string;

  @ApiProperty({ example: 'clyyy456', description: 'ID của listing (optional)', required: false })
  @IsString()
  @IsOptional()
  listingId?: string;
}
