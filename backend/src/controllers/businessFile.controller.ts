import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  Get,
  Delete,
  ParseIntPipe,
  Body,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/enums/permission.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { BusinessFileService } from '../services/businessFile.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
} from '@nestjs/swagger';
import { BusinessFileType } from '../entities/business-file.entity';

@ApiTags('Business Files')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('business-files')
export class BusinessFileController {
  constructor(private readonly businessFileService: BusinessFileService) {}

  // UPLOAD
  @RequirePermissions(Permission.BUSINESS_UPLOAD_FILE)
  @Post(':businessId/upload')
  @ApiOperation({ summary: 'Upload file doanh nghiệp' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/business',
        filename: (req, file, cb) => {
          const unique =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        fileType: { type: 'string', enum: Object.values(BusinessFileType) },
      },
    },
  })
  async upload(
    @Param('businessId', ParseIntPipe) businessId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('fileType') fileType: BusinessFileType,
  ) {
    return this.businessFileService.uploadBusinessFile(businessId, file, fileType);
  }

  // GET LIST
  @RequirePermissions(Permission.BUSINESS_VIEW)
  @Get(':businessId')
  async getFiles(@Param('businessId', ParseIntPipe) businessId: number) {
    return this.businessFileService.getBusinessFiles(businessId);
  }

  // DELETE FILE
  @RequirePermissions(Permission.BUSINESS_DELETE)
  @Delete(':fileId')
  async deleteFile(@Param('fileId', ParseIntPipe) fileId: number) {
    return this.businessFileService.deleteBusinessFile(fileId);
  }
}