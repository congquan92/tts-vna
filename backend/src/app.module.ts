import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService],
=======
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres', // nếu chạy docker thì đổi thành 'postgres'
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'VNADatabase',
      autoLoadEntities: true,
      synchronize: true, // dành cho dev
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
>>>>>>> 67e9636ab0f325b20456b544dde3c8ca822fe6ca
})
export class AppModule {}
