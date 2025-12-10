import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { RoommatesService } from './roommates.service';
import { CreateRoommateDto } from './dto/create-roommate.dto';
import { UpdateRoommateDto } from './dto/update-roommate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
  ApiOperation,
} from '@nestjs/swagger';
import { Gender } from '@prisma/client';

@ApiTags('Roommates')
@Controller('roommates')
export class RoommatesController {
  constructor(private readonly roommatesService: RoommatesService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo hoặc cập nhật hồ sơ tìm ở ghép' })
  create(@Req() req, @Body() createRoommateDto: CreateRoommateDto) {
    // Using upsert to handle both create and update in one endpoint for simplicity in frontend
    return this.roommatesService.upsert(req.user.id, createRoommateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Tìm kiếm người ở ghép' })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'gender', enum: Gender, required: false })
  @ApiQuery({ name: 'minBudget', required: false, type: Number })
  @ApiQuery({ name: 'maxBudget', required: false, type: Number })
  @ApiQuery({
    name: 'occupation',
    enum: ['STUDENT', 'WORKER', 'OTHER'],
    required: false,
  })
  findAll(
    @Query('location') location?: string,
    @Query('gender') gender?: Gender | 'ALL',
    @Query('minBudget') minBudget?: number,
    @Query('maxBudget') maxBudget?: number,
    @Query('occupation') occupation?: 'STUDENT' | 'WORKER' | 'OTHER' | 'ALL',
  ) {
    const where: any = {};

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (gender && gender !== 'ALL') {
      where.gender = gender;
    }

    if (minBudget) {
      where.budgetMin = { gte: Number(minBudget) };
    }

    if (maxBudget) {
      where.budgetMax = { lte: Number(maxBudget) };
    }

    if (occupation && occupation !== 'ALL') {
      where.occupation = occupation;
    }

    return this.roommatesService.findAll({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy hồ sơ tìm ở ghép của tôi' })
  findMyProfile(@Req() req) {
    return this.roommatesService.findMyProfile(req.user.id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Xem hồ sơ ở ghép theo User ID' })
  findByUserId(@Param('userId') userId: string) {
    return this.roommatesService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết hồ sơ ở ghép' })
  findOne(@Param('id') id: string) {
    return this.roommatesService.findOne(id);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xóa hồ sơ tìm ở ghép' })
  remove(@Req() req) {
    return this.roommatesService.remove(req.user.id);
  }
}
