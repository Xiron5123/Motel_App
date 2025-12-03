import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { EmailService } from '../common/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) { }

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

    if (!user.isActive) {
      throw new ForbiddenException('Account is locked');
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
      console.error('RefreshToken Error:', error);
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

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'If this email is registered, a reset link has been sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 3600000),
      },
    });

    try {
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }

    return { message: 'If this email is registered, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetTokens = await this.prisma.passwordResetToken.findMany({
      where: { expiresAt: { gte: new Date() } },
      include: { user: true },
    });

    let validToken: typeof resetTokens[0] | null = null;
    for (const rt of resetTokens) {
      const isValid = await bcrypt.compare(token, rt.token);
      if (isValid) {
        validToken = rt;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: validToken.userId },
      data: { password: hashedPassword },
    });

    await this.prisma.passwordResetToken.delete({ where: { id: validToken.id } });
    await this.prisma.refreshToken.deleteMany({ where: { userId: validToken.userId } });

    return { message: 'Password reset successfully' };
  }

  async sendOTP(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);

    await this.prisma.emailVerificationOTP.deleteMany({ where: { email } });
    await this.prisma.emailVerificationOTP.create({
      data: {
        email,
        otp: hashedOTP,
        expiresAt: new Date(Date.now() + 300000),
      },
    });

    try {
      await this.emailService.sendOTPEmail(email, otp);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw error;
    }

    return { message: 'OTP sent to email' };
  }

  async verifyOTP(email: string, otp: string) {
    const otpRecords = await this.prisma.emailVerificationOTP.findMany({
      where: {
        email,
        expiresAt: { gte: new Date() },
        verified: false,
      },
    });

    if (otpRecords.length === 0) {
      throw new UnauthorizedException('No valid OTP found for this email');
    }

    let validOTP: typeof otpRecords[0] | null = null;
    for (const record of otpRecords) {
      const isValid = await bcrypt.compare(otp, record.otp);
      if (isValid) {
        validOTP = record;
        break;
      }
    }

    if (!validOTP) {
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.prisma.emailVerificationOTP.update({
      where: { id: validOTP.id },
      data: { verified: true },
    });

    return { message: 'OTP verified successfully', verified: true };
  }

  async socialLogin(profile: { email: string; name: string; avatar?: string; provider: string }) {
    // Find user by email
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      // Create new user with random password (won't be used for social login)
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          password: hashedPassword,
          avatar: profile.avatar,
          role: 'RENTER',
        },
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
      user.role,
    );

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
}
