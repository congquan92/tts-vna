import { Module } from '@nestjs/common';
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
})
export class AppModule {}
