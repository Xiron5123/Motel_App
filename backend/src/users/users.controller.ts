import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { BecomeLandlordDto } from './dto/become-landlord.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin tài khoản' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  async getMe(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Cập nhật thông tin tài khoản' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async updateMe(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  @ApiResponse({ status: 200, description: 'Đổi mật khẩu thành công' })
  @ApiResponse({ status: 400, description: 'Mật khẩu hiện tại không đúng' })
  async changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.id, dto);
  }

  @Post('become-landlord')
  @ApiOperation({ summary: 'Nâng cấp tài khoản thành chủ trọ' })
  @ApiResponse({ status: 200, description: 'Nâng cấp thành công' })
  @ApiResponse({ status: 400, description: 'Đã là chủ trọ hoặc thiếu thông tin' })
  async becomeLandlord(@CurrentUser() user: any, @Body() dto: BecomeLandlordDto) {
    return this.usersService.becomeLandlord(user.id, dto);
  }
}
