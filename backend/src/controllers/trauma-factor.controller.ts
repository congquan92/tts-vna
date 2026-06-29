import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TraumaFactorService } from '../services/trauma-factor.service';
import { CreateTraumaFactorDto } from '../dto/traumaFactor/create-trauma-factor.dto';
import { UpdateTraumaFactorDto } from '../dto/traumaFactor/update-trauma-factor.dto';

@Controller('trauma-factors')
export class TraumaFactorController {
  constructor(private readonly service: TraumaFactorService) {}

  // CREATE
  @Post()
  create(@Body() dto: CreateTraumaFactorDto) {
    return this.service.create(dto);
  }

  // UPDATE
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTraumaFactorDto,
  ) {
    return this.service.update(Number(id), dto);
  }

  // DELETE
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(Number(id));
  }

  // GET ALL
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // SEARCH
  @Get('search')
  search(
    @Query('code') code?: string,
    @Query('name') name?: string,
    @Query('status') status?: string,
  ) {
    return this.service.search({ code, name, status });
  }
}