import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'path';

import { JwtStrategy } from './strategies/jwt.strategy';
import configuration from './configurations/app.config';
import { User } from './entities/user.entity';
import { Otp } from './entities/otp.entity';
import { TypeOfBusiness } from './entities/typeOfBusiness.entity';
import { BusinessIndustry } from './entities/BusinessIndustry.entity';
import { AuthController } from './controllers/auth.controller';
import { TypeOfBusinessController } from './controllers/typeOfBusiness.controller';
import { BusinessIndustryController } from './controllers/businessIndustry.controller';
import { AuthRepository } from './repositories/auth.repository';
import { TypeOfBusinessRepository } from './repositories/typeOfBusiness.repository';
import { BusinessIndustryRepository } from './repositories/businessIndustry.repository';
import { AuthService } from './services/auth.service';
import { TypeOfBusinessService } from './services/typeOfBusiness.service';
import { BusinessIndustryService } from './services/businessIndustry.service';
import { Account } from './entities/account.entity.js';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    CloudinaryModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: configService.get('MAIL_PORT'),
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASS'),
          },
        },
        template: {
          dir: join(process.cwd(), 'dist/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Account, Otp, TypeOfBusiness, BusinessIndustry]),
  ],
  controllers: [AuthController, TypeOfBusinessController, BusinessIndustryController],
  providers: [AuthService, AuthRepository, TypeOfBusinessService, TypeOfBusinessRepository, BusinessIndustryService, BusinessIndustryRepository, JwtStrategy],
})
export class AppModule { }