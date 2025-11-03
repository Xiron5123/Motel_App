import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user exists
    const orConditions: any[] = [{ email: dto.email }];
    if (dto.phone) {
      orConditions.push({ phone: dto.phone });
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: orConditions,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or phone already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user with default RENTER role
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        role: 'RENTER', // Default role
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      });

      // Check if refresh token exists in DB
      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          token,
          userId: payload.sub,
          expiresAt: { gte: new Date() },
        },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(
        payload.sub,
        payload.email,
        payload.role,
      );

      // Delete old refresh token
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, token: string) {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token,
      },
    });

    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN'),
      }),
    ]);

    // Store refresh token
    const expiresInDays = 7; // 7 days
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }
}
