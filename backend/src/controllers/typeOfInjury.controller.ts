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
import { TypeOfInjuryService } from '../services/typeOfInjury.service';
import { CreateTypeOfInjuryDto } from '../dto/type-of-injury/createTypeOfInjury.dto';
import { UpdateTypeOfInjuryDto } from '../dto/type-of-injury/updateTypeOfInjury.dto';
import { SearchTypeOfInjuryDto } from '../dto/type-of-injury/searchTypeOfInjury.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('typeOfInjuries')
export class TypeOfInjuryController {
  constructor(private readonly service: TypeOfInjuryService) {}

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @RequirePermissions(Permission.TYPE_OF_INJURY_CREATE)
  @Post()
  async create(@Body() dto: CreateTypeOfInjuryDto) {
    return this.service.create(dto);
  }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @RequirePermissions(Permission.TYPE_OF_INJURY_UPDATE)
  @Patch(':idOrCode')
  async update(
    @Param('idOrCode') idOrCode: string,
    @Body() dto: UpdateTypeOfInjuryDto,
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
  async search(@Query() query: SearchTypeOfInjuryDto) {
    return this.service.searchTypeOfInjuries(query);
  }

  @Get(':idOrCode')
  async findOne(@Param('idOrCode') idOrCode: string) {
    const res = await this.service.findOne(idOrCode);
    if (!res) throw new NotFoundException('TypeOfInjury not found');
    return res;
  }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @RequirePermissions(Permission.TYPE_OF_INJURY_DELETE)
  @Delete(':idOrCode')
  async remove(@Param('idOrCode') idOrCode: string) {
    return this.service.remove(idOrCode);
  }
}
