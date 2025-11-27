import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';
import { AddPhotoDto } from './dto/add-photo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  constructor(private listingsService: ListingsService) { }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách phòng trọ với bộ lọc' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  findAll(@Query() query: QueryListingDto) {
    return this.listingsService.findAll(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách phòng của tôi (chủ trọ)' })
  getMyListings(@CurrentUser() user: any, @Query() query: QueryListingDto) {
    return this.listingsService.getMyListings(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết phòng trọ' })
  @ApiResponse({ status: 200, description: 'Tìm thấy phòng trọ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phòng trọ' })
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LANDLORD, Role.RENTER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo tin đăng phòng trọ (chủ trọ/người thuê)' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 403, description: 'Lỗi phân quyền' })
  create(@CurrentUser() user: any, @Body() dto: CreateListingDto) {
    return this.listingsService.create(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật tin đăng (chủ trọ)' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateListingDto) {
    return this.listingsService.update(id, user.id, dto);
  }

  @Patch(':id/toggle-hidden')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ẩn/Hiện tin đăng (chủ trọ)' })
  toggleHidden(@Param('id') id: string, @CurrentUser() user: any) {
    return this.listingsService.toggleHidden(id, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa tin đăng (chủ trọ)' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.listingsService.remove(id, user.id);
  }

  @Post(':id/photos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thêm ảnh vào tin đăng' })
  addPhoto(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: AddPhotoDto) {
    return this.listingsService.addPhoto(id, user.id, dto);
  }

  @Delete('photos/:photoId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa ảnh khỏi tin đăng' })
  removePhoto(@Param('photoId') photoId: string, @CurrentUser() user: any) {
    return this.listingsService.removePhoto(photoId, user.id);
  }
}
