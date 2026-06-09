import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path/win32';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // Chặn các field lạ không có trong DTO
      transform: true, // Tự động chuyển đổi kiểu dữ liệu dựa trên DTO (ví dụ: string -> number)
    }),
  );

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'));

  // Cấu hình thông tin Swagger
  const config = new DocumentBuilder()
    .setTitle('VNA Project API')
    .setDescription('Tài liệu API cho hệ thống VNA')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // Đường dẫn truy cập: /api-docs

  await app.listen(process.env.PORT || 3001, '0.0.0.0');
}
bootstrap();
