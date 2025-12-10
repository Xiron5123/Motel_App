import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS
  app.enableCors({
    origin: '*', // Allow all origins for debugging
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: 400,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('🏠 Motel Rental API')
    .setDescription(
      'API cho ứng dụng cho thuê trọ\n\n' +
      '**Features:**\n' +
      '- Authentication với JWT + Refresh Token\n' +
      '- Role-based access (RENTER/LANDLORD)\n' +
      '- Listings với search & filter\n' +
      '- Favorites & Bookings\n' +
      '- Realtime chat với Socket.IO\n' +
      '- Notifications\n\n' +
      '**Rate Limiting:** 100 requests/minute\n' +
      '**Environment:** ' +
      (process.env.NODE_ENV || 'development'),
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập JWT token (lấy từ /auth/login)',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Endpoints đăng ký, đăng nhập, refresh token')
    .addTag('Users', 'Quản lý thông tin người dùng')
    .addTag('Listings', 'Quản lý tin đăng phòng trọ')
    .addTag('Favorites', 'Danh sách yêu thích')
    .addTag('Bookings', 'Quản lý yêu cầu đặt phòng')
    .addTag('Chat', 'Nhắn tin realtime')
    .addTag('Notifications', 'Thông báo')
    .addTag('Roommates', 'Tìm người ở ghép')
    .addTag('Upload', 'Tải lên tập tin')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Motel API Docs',
    customfavIcon: '🏠',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  logger.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
