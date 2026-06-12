import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  NotFoundException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BusinessIndustryService } from '../services/businessIndustry.service';
import { CreateBusinessIndustryDto } from '../dto/businessIndustry/createBusinessIndustry.dto';
import { UpdateBusinessIndustryDto } from '../dto/businessIndustry/updateBusinessIndustry.dto';
import { SearchBusinessIndustryDto } from '../dto/businessIndustry/searchBusinessIndustry.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('businessIndustries')
export class BusinessIndustryController {
  constructor(private readonly service: BusinessIndustryService) { }

  @Post()
  async create(@Body() dto: CreateBusinessIndustryDto) {
    return this.service.create(dto);
  }

  @Patch(':idOrCode')
  async update(
    @Param('idOrCode') idOrCode: string,
    @Body() dto: UpdateBusinessIndustryDto,
  ) {
    return this.service.update(idOrCode, dto);
  }

  @Get('level/not-4')
  async findNotLevel4() {
    return this.service.findByLevelNot(4);
  }

  @Get('level/4')
  async findLevel4() {
    return this.service.findByLevel(4);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get('search')
  async search(@Query() query: SearchBusinessIndustryDto) {
    return this.service.searchBusinessIndustries(query);
  }


  @Get(':idOrCode')
  async findOne(@Param('idOrCode') idOrCode: string) {
    const res = await this.service.findOne(idOrCode);
    if (!res) throw new NotFoundException('BusinessIndustry not found');
    return res;
  }
}
