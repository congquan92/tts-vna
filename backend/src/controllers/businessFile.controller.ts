import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  Get,
  Delete,
  Body,
} from '@nestjs/common';
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
@Controller('business-files')
export class BusinessFileController {
  constructor(private readonly businessFileService: BusinessFileService) {}

  // UPLOAD
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
    @Param('businessId') businessId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('fileType') fileType: BusinessFileType,
  ) {
    return this.businessFileService.uploadBusinessFile(businessId, file, fileType);
  }

  // GET LIST
  @Get(':businessId')
  async getFiles(@Param('businessId') businessId: number) {
    return this.businessFileService.getBusinessFiles(businessId);
  }

  // DELETE FILE
  @Delete(':fileId')
  async deleteFile(@Param('fileId') fileId: number) {
    return this.businessFileService.deleteBusinessFile(fileId);
  }
}