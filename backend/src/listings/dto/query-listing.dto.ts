import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsArray, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ListingStatus } from '@prisma/client';

export class QueryListingDto {
  @ApiProperty({ required: false, example: 'phòng trọ' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ required: false, example: 'Hà Nội' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false, example: 'Cầu Giấy' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({ required: false, example: 1000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @ApiProperty({ required: false, example: 5000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMax?: number;

  @ApiProperty({ required: false, example: ['wifi', 'parking'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiProperty({ required: false, example: 21.0031177 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @ApiProperty({ required: false, example: 105.8201408 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @ApiProperty({ required: false, example: 5, description: 'Radius in kilometers' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  radius?: number;

  @ApiProperty({ enum: ListingStatus, required: false })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @ApiProperty({ required: false, example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    required: false,
    example: 'price_asc',
    enum: ['price_asc', 'price_desc', 'distance', 'created_desc', 'created_asc'],
    description: 'Sort order'
  })
  @IsOptional()
  @IsString()
  sortBy?: 'price_asc' | 'price_desc' | 'distance' | 'created_desc' | 'created_asc';
}
