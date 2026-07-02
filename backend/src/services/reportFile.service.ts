import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReportRepository } from '../repositories/report.repository';
import { ReportFileRepository } from '../repositories/reportFile.repository';
import { ReportFileType } from '../entities/report-file.entity';
import * as fs from 'fs';
import * as path from 'path';
import { extname } from 'path';

@Injectable()
export class ReportFileService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly reportFileRepository: ReportFileRepository,
  ) {}

  private toFileResponse(file: {
    id: number;
    reportId: number;
    fileName: string;
    storedFileName: string;
    filePath: string;
    fileType: ReportFileType;
    fileSize?: number;
    mimeType?: string;
    createdAt: Date;
  }) {
    return {
      id: file.id,
      reportId: file.reportId,
      fileName: file.fileName,
      storedFileName: file.storedFileName,
      filePath: file.filePath,
      fileUrl: file.filePath,
      fileType: file.fileType,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      createdAt: file.createdAt,
    };
  }

  async uploadReportFile(
    reportId: number,
    file: Express.Multer.File,
    fileType: ReportFileType = ReportFileType.ATTACHMENT,
  ) {
    const report = await this.reportRepository.findById(reportId);

    if (!report) {
      throw new NotFoundException('Báo cáo không tồn tại');
    }

    const businessId = report.companyInfo?.businessId;

    if (!businessId) {
      throw new BadRequestException(
        'Báo cáo chưa có thông tin công ty (businessId). Vui lòng tạo companyInfo trước khi upload file.',
      );
    }

    if (!file) {
      throw new BadRequestException('Vui lòng chọn file để upload');
    }

    const allowedMimeTypes = [
      'application/pdf',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ cho phép PDF. Vui lòng chọn file hợp lệ');
    }

    const uploadDir = path.join(
      process.cwd(),
      'uploads',
      'report',
      String(businessId),
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storedFileName =
      Date.now() + '-' + Math.round(Math.random() * 1e9) + extname(file.originalname);

    const fullPath = path.join(uploadDir, storedFileName);

    fs.writeFileSync(fullPath, file.buffer);

    const saved = await this.reportFileRepository.save({
      reportId,
      fileName: file.originalname,
      storedFileName,
      filePath: `/uploads/report/${businessId}/${storedFileName}`,
      fileSize: file.size,
      mimeType: file.mimetype,
      fileType,
    });

    return {
      message: 'Upload file báo cáo thành công',
      data: this.toFileResponse(saved),
    };
  }

  async getReportFiles(reportId: number) {
    const report = await this.reportRepository.findById(reportId);

    if (!report) {
      throw new NotFoundException('Báo cáo không tồn tại');
    }

    const files = await this.reportFileRepository.findByReportId(reportId);

    return {
      data: files.map((file) => this.toFileResponse(file)),
    };
  }

  async deleteReportFile(fileId: number) {
    const file = await this.reportFileRepository.findById(fileId);

    if (!file) {
      throw new NotFoundException('File không tồn tại');
    }

    const relativePath = file.filePath.replace(/^\//, '');
    const fullPath = path.join(process.cwd(), relativePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await this.reportFileRepository.delete(fileId);

    return { message: 'Xóa file thành công' };
  }
}
