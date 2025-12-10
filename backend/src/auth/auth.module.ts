import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from './guards/roles.guard';
import { EmailService } from '../common/email.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // Temporarily disabled - uncomment after adding OAuth credentials to .env
    // GoogleStrategy,
    // FacebookStrategy,
    PrismaService,
    RolesGuard,
    EmailService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
