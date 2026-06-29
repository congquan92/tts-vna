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
import { CareerDirectoryService } from '../services/CareerDirectory.service';
import { CreateCareerDirectoryDto } from '../dto/careerDirectory/createCareerDirectory.dto';
import { UpdateCareerDirectoryDto } from '../dto/careerDirectory/updateCareertory.dto';
import { SearchCareerDirectoryDto } from '../dto/careerDirectory/searchCareerDirectory.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('careerDirectories')
export class CareerDirectoryController {
  constructor(private readonly service: CareerDirectoryService) {}

  // ================= CREATE =================
//@ApiBearerAuth()
//   @UseGuards(JwtAuthGuard, PermissionsGuard)
//   @RequirePermissions(Permission.CAREER_CREATE)
  @Post()
  async create(@Body() dto: CreateCareerDirectoryDto) {
    return this.service.create(dto);
  }

  // ================= UPDATE =================
//   @ApiBearerAuth()
//   @UseGuards(JwtAuthGuard, PermissionsGuard)
//   @RequirePermissions(Permission.CAREER_UPDATE)
  @Patch(':idOrCode')
  async update(
    @Param('idOrCode') idOrCode: string,
    @Body() dto: UpdateCareerDirectoryDto,
  ) {
    return this.service.update(idOrCode, dto);
  }

  // ================= FILTER =================
  @Get('level/not-4')
  async findNotLevel4() {
    return this.service.findByLevelNot(4);
  }

  @Get('level/4')
  async findLevel4() {
    return this.service.findByLevel(4);
  }

  // ================= GET ALL =================
  @Get()
  async findAll() {
    return this.service.findAll();
  }

  // ================= SEARCH =================
  @Get('search')
  async search(@Query() query: SearchCareerDirectoryDto) {
    return this.service.searchCareerDirectories(query);
  }

  // ================= GET ONE =================
  @Get(':idOrCode')
  async findOne(@Param('idOrCode') idOrCode: string) {
    const res = await this.service.findOne(idOrCode);

    if (!res) {
      throw new NotFoundException('Không tìm thấy nghề');
    }

    return res;
  }

  // ================= DELETE =================
//   @ApiBearerAuth()
//   @UseGuards(JwtAuthGuard, PermissionsGuard)
//   @RequirePermissions(Permission.CAREER_DELETE)
  @Delete(':idOrCode')
  async remove(@Param('idOrCode') idOrCode: string) {
    return this.service.remove(idOrCode);
  }
}