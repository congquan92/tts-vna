import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TypeOfBusinessService } from '../services/typeOfBusiness.service';
import { CreateTypeOfBusinessDto } from '../dto/createTypeOfBusiness.dto';
import { UpdateTypeOfBusinessDto } from '../dto/updateTypeOfBusiness.dto';

@ApiTags('TypeOfBusiness')
@Controller('TypeOfBusiness')
export class TypeOfBusinessController {
  constructor(private readonly typeOfBusinessService: TypeOfBusinessService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Tạo loại hình kinh doanh mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 404, description: 'Type of business not found' })
  async create(@Body() createDto: CreateTypeOfBusinessDto) {
    return await this.typeOfBusinessService.create(createDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách loại hình kinh doanh' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách' })
  async findAll() {
    return await this.typeOfBusinessService.findAll();
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Tìm loại hình theo mã code' })
  async findByCode(@Param('code') code: string) {
    const item = await this.typeOfBusinessService.findByCode(code);
    if (!item) throw new NotFoundException('Loại hình không tồn tại');
    return item;
  }

  @Get('name')
  @ApiOperation({ summary: 'Tìm loại hình theo tên (tìm gần đúng)' })
  async findByName(@Query('name') name: string) {
    return await this.typeOfBusinessService.findByName(name || '');
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Tìm loại hình theo trạng thái' })
  async findByStatus(@Param('status') status: string) {
    return await this.typeOfBusinessService.findByStatus(status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin loại hình kinh doanh theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về chi tiết loại hình' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.typeOfBusinessService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật loại hình kinh doanh' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTypeOfBusinessDto,
  ) {
    return await this.typeOfBusinessService.update(id, updateDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa loại hình kinh doanh' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.typeOfBusinessService.remove(id);
  }
}
