import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe Updated', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '0123456789', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ example: 'RENTER', enum: ['RENTER', 'LANDLORD', 'ADMIN'], required: false })
  @IsOptional()
  role?: 'RENTER' | 'LANDLORD' | 'ADMIN';

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isActive?: boolean;
}
