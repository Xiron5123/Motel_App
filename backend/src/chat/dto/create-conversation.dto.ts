import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({ example: 'clxxx123', description: 'ID của user muốn chat' })
  @IsString()
  @IsNotEmpty()
  participantId: string;
}
