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
import { AuthController } from './controllers/auth.controller';
import { AuthRepository } from './repositories/auth.repository';
import { TypeOfBusinessRepository } from './repositories/typeOfBusiness.repository';
import { AuthService } from './services/auth.service';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { SeedService } from './database/seed';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { TypeOfBusinessController } from './controllers/typeOfBusiness.controller';
import { TypeOfBusinessService } from './services/typeOfBusiness.service';
import { Account } from './entities/account.entity.js';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { BusinessIndustry } from './entities/BusinessIndustry.entity';
import { Business } from './entities/business.entity';
import { BusinessFile } from './entities/business-file.entity';
import { BusinessIndustryController } from './controllers/businessIndustry.controller';
import { BusinessController } from './controllers/business.controller';
import { BusinessIndustryService } from './services/businessIndustry.service';
import { BusinessIndustryRepository } from './repositories/businessIndustry.repository';
import { BusinessService } from './services/business.service';
import { BusinessRepository } from './repositories/business.repository';
import { Role } from './entities/role.entity';
import { RoleRepository } from './repositories/role.repository';
import { AccountRepository } from './repositories/account.repository';
import { BusinessFileRepository } from './repositories/businessFile.repository';
import { BusinessFileController } from './controllers/businessFile.controller';
import { BusinessFileService } from './services/businessFile.service';
import { Report } from './entities/report.entity';
import { CompanyInfo } from './entities/company-info.entity';
import { LaborAccidentReport } from './entities/labor-accident-report.entity';
import { LaborAccidentSupportReport } from './entities/labor-accident-support-report.entity';
import { AccidentDetail } from './entities/accident-detail.entity';
import { ReportController } from './controllers/report.controller';
import { ReportService } from './services/report.service';
import { ReportRepository } from './repositories/report.repository';
import { ReportFile } from './entities/report-file.entity';
import { ReportFileRepository } from './repositories/reportFile.repository';
import { ReportFileController } from './controllers/reportFile.controller';
import { ReportFileService } from './services/reportFile.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    CloudinaryModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
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
    TypeOrmModule.forFeature([User, Account, Otp, TypeOfBusiness, BusinessIndustry, Business, BusinessFile, Role, RolePermission, Permission, Report, CompanyInfo, LaborAccidentReport, LaborAccidentSupportReport, AccidentDetail, ReportFile]),
  ],
  controllers: [AuthController, UserController, TypeOfBusinessController, BusinessIndustryController, BusinessController, BusinessFileController, ReportController, ReportFileController],
  providers: [AuthService, AuthRepository, UserService, UserRepository, TypeOfBusinessService, TypeOfBusinessRepository, BusinessIndustryService, BusinessIndustryRepository, BusinessService, BusinessRepository, BusinessFileService, BusinessFileRepository, RoleRepository, AccountRepository, JwtStrategy, SeedService, ReportService, ReportRepository, ReportFileService, ReportFileRepository],
})
export class AppModule { }