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
  constructor(private listingsService: ListingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all listings with filters' })
  @ApiResponse({ status: 200, description: 'Listings retrieved' })
  findAll(@Query() query: QueryListingDto) {
    return this.listingsService.findAll(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my listings (landlord only)' })
  getMyListings(@CurrentUser() user: any, @Query() query: QueryListingDto) {
    return this.listingsService.getMyListings(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get listing by ID' })
  @ApiResponse({ status: 200, description: 'Listing found' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create listing (landlord only)' })
  @ApiResponse({ status: 201, description: 'Listing created' })
  @ApiResponse({ status: 403, description: 'Only landlords can create listings' })
  create(@CurrentUser() user: any, @Body() dto: CreateListingDto) {
    return this.listingsService.create(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update listing (landlord only)' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateListingDto) {
    return this.listingsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete listing (landlord only)' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.listingsService.remove(id, user.id);
  }

  @Post(':id/photos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add photo to listing' })
  addPhoto(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: AddPhotoDto) {
    return this.listingsService.addPhoto(id, user.id, dto);
  }

  @Delete('photos/:photoId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete photo from listing' })
  removePhoto(@Param('photoId') photoId: string, @CurrentUser() user: any) {
    return this.listingsService.removePhoto(photoId, user.id);
  }
}
