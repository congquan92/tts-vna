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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { ReportFileService } from '../services/reportFile.service';
import { ReportFileType } from '../entities/report-file.entity';

@ApiTags('Report Files')
@Controller('report-files')
export class ReportFileController {
  constructor(private readonly reportFileService: ReportFileService) {}

  @Post(':reportId/upload')
  @ApiOperation({ summary: 'Upload file đính kèm báo cáo' })
  @ApiParam({ name: 'reportId', example: 1 })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        fileType: { type: 'string', enum: Object.values(ReportFileType) },
      },
    },
  })
  async upload(
    @Param('reportId', ParseIntPipe) reportId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('fileType') fileType: ReportFileType,
  ) {
    return this.reportFileService.uploadReportFile(reportId, file, fileType);
  }

  @Get(':reportId')
  @ApiOperation({ summary: 'Lấy danh sách file của báo cáo' })
  @ApiParam({ name: 'reportId', example: 1 })
  async getFiles(@Param('reportId', ParseIntPipe) reportId: number) {
    return this.reportFileService.getReportFiles(reportId);
  }

  @Delete(':fileId')
  @ApiOperation({ summary: 'Xóa file báo cáo' })
  @ApiParam({ name: 'fileId', example: 1 })
  async deleteFile(@Param('fileId', ParseIntPipe) fileId: number) {
    return this.reportFileService.deleteReportFile(fileId);
  }
}
