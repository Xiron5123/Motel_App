import {
  IsString,
  IsInt,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateRoommateDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(18)
  age: number;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  job: string;

  @IsNumber()
  budgetMin: number;

  @IsNumber()
  budgetMax: number;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  intro?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  habits?: string[];

  @IsOptional()
  @IsEnum(['STUDENT', 'WORKER', 'OTHER'])
  occupation?: 'STUDENT' | 'WORKER' | 'OTHER';
}
