import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AddFavoriteDto } from './dto/add-favorite.dto';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: 'Lưu listing vào danh sách yêu thích' })
  addFavorite(@GetUser('id') userId: string, @Body() dto: AddFavoriteDto) {
    return this.favoritesService.addFavorite(userId, dto.listingId);
  }

  @Delete(':listingId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa listing khỏi danh sách yêu thích' })
  removeFavorite(
    @GetUser('id') userId: string,
    @Param('listingId') listingId: string,
  ) {
    return this.favoritesService.removeFavorite(userId, listingId);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách listings đã lưu' })
  getFavorites(@GetUser('id') userId: string) {
    return this.favoritesService.getFavorites(userId);
  }

  @Get('check/:listingId')
  @ApiOperation({ summary: 'Kiểm tra đã lưu listing chưa' })
  async checkFavorited(
    @GetUser('id') userId: string,
    @Param('listingId') listingId: string,
  ) {
    const isFavorited = await this.favoritesService.isFavorited(
      userId,
      listingId,
    );
    return { isFavorited };
  }
}
