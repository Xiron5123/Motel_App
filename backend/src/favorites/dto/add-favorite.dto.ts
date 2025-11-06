import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddFavoriteDto {
  @ApiProperty({
    description: 'ID của listing cần lưu',
    example: 'clx123abc',
  })
  @IsNotEmpty()
  @IsString()
  listingId: string;
}
