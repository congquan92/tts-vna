import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  NotFoundException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/enums/permission.enum';
import { BusinessIndustryService } from '../services/businessIndustry.service';
import { CreateBusinessIndustryDto } from '../dto/businessIndustry/createBusinessIndustry.dto';
import { UpdateBusinessIndustryDto } from '../dto/businessIndustry/updateBusinessIndustry.dto';
import { SearchBusinessIndustryDto } from '../dto/businessIndustry/searchBusinessIndustry.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('businessIndustries')
export class BusinessIndustryController {
  constructor(private readonly service: BusinessIndustryService) { }

  @RequirePermissions(Permission.BUSINESS_CREATE)
  @Post()
  async create(@Body() dto: CreateBusinessIndustryDto) {
    return this.service.create(dto);
  }

  @RequirePermissions(Permission.BUSINESS_UPDATE)
  @Patch(':idOrCode')
  async update(
    @Param('idOrCode') idOrCode: string,
    @Body() dto: UpdateBusinessIndustryDto,
  ) {
    return this.service.update(idOrCode, dto);
  }

  @RequirePermissions(Permission.BUSINESS_VIEW)
  @Get('level/not-4')
  async findNotLevel4() {
    return this.service.findByLevelNot(4);
  }

  @RequirePermissions(Permission.BUSINESS_VIEW)
  @Get('level/4')
  async findLevel4() {
    return this.service.findByLevel(4);
  }

  @RequirePermissions(Permission.BUSINESS_VIEW)
  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @RequirePermissions(Permission.BUSINESS_VIEW)
  @Get('search')
  async search(@Query() query: SearchBusinessIndustryDto) {
    return this.service.searchBusinessIndustries(query);
  }

  @RequirePermissions(Permission.BUSINESS_VIEW)
  @Get(':idOrCode')
  async findOne(@Param('idOrCode') idOrCode: string) {
    const res = await this.service.findOne(idOrCode);
    if (!res) throw new NotFoundException('BusinessIndustry not found');
    return res;
  }

  @RequirePermissions(Permission.BUSINESS_DELETE)
  @Delete(':idOrCode')
  async remove(@Param('idOrCode') idOrCode: string) {
    return this.service.remove(idOrCode);
  }
}
