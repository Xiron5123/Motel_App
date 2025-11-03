import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { BecomeLandlordDto } from './dto/become-landlord.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getMe(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateMe(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post('become-landlord')
  @ApiOperation({ summary: 'Upgrade to landlord account' })
  @ApiResponse({ status: 200, description: 'Successfully upgraded to landlord' })
  @ApiResponse({ status: 400, description: 'Already a landlord or missing required info' })
  async becomeLandlord(@CurrentUser() user: any, @Body() dto: BecomeLandlordDto) {
    return this.usersService.becomeLandlord(user.id, dto);
  }
}
