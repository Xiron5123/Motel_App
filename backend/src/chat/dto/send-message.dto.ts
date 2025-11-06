import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'Xin chào, phòng này còn trống không?' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
