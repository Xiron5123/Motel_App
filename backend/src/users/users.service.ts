import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BecomeLandlordDto } from './dto/become-landlord.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async becomeLandlord(userId: string, dto: BecomeLandlordDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already a landlord
    if (user.role === 'LANDLORD') {
      throw new BadRequestException('You are already a landlord');
    }

    // If phone is provided in DTO, update it
    // Otherwise, check if user already has phone
    if (!dto.phone && !user.phone) {
      throw new BadRequestException('Phone number is required to become a landlord');
    }

    // Upgrade to landlord
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        role: 'LANDLORD',
        phone: dto.phone || user.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return {
      message: 'Successfully upgraded to landlord',
      user: updatedUser,
    };
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check phone uniqueness if updating phone
    if (dto.phone && dto.phone !== user.phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: {
          phone: dto.phone,
          NOT: { id: userId },
        },
      });

      if (existingPhone) {
        throw new BadRequestException('Phone number already in use');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!passwordMatch) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }
}
