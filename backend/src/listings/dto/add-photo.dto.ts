import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class AddPhotoDto {
  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 1, required: false, description: 'Display order' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  order?: number;
}
