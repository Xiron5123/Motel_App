import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  IsEnum,
} from 'class-validator';
import { ListingStatus } from '@prisma/client';

export class CreateListingDto {
  @ApiProperty({ example: 'Phòng trọ cao cấp gần ĐH Bách Khoa' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Phòng mới xây, đầy đủ nội thất, gần trường học, siêu thị',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 3000000, description: 'Giá thuê/tháng (VNĐ)' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 2000000, description: 'Tiền cọc (VNĐ)', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  deposit?: number;

  @ApiProperty({ example: 25, description: 'Diện tích (m²)' })
  @IsNumber()
  @Min(0)
  area: number;

  @ApiProperty({ example: '123 Đại Cồ Việt, Hai Bà Trưng, Hà Nội' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Hà Nội' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Hai Bà Trưng' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 'Phường Bách Khoa', required: false })
  @IsString()
  @IsOptional()
  ward?: string;

  @ApiProperty({ example: 21.0031177, required: false })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiProperty({ example: 105.8201408, required: false })
  @IsNumber()
  @IsOptional()
  lng?: number;

  @ApiProperty({
    example: ['wifi', 'parking', 'kitchen', 'washing_machine', 'air_conditioner'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  amenities: string[];

  @ApiProperty({
    enum: ListingStatus,
    example: ListingStatus.AVAILABLE,
    required: false,
  })
  @IsEnum(ListingStatus)
  @IsOptional()
  status?: ListingStatus;
}
