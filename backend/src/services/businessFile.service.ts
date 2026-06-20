import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { BusinessRepository } from '../repositories/business.repository';
import { BusinessFileRepository } from '../repositories/businessFile.repository';
import { BusinessFileType } from '../entities/business-file.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BusinessFileService {
    constructor(
        private readonly businessRepository: BusinessRepository,
        private readonly businessFileRepository: BusinessFileRepository,
    ) { }

    // UPLOAD FILE
    async uploadBusinessFile(
        businessId: number,
        file: Express.Multer.File,
        fileType: BusinessFileType = BusinessFileType.OTHER,
    ) {
        const business = await this.businessRepository.findById(businessId);

        if (!business) {
            throw new NotFoundException('Doanh nghiệp không tồn tại');
        }

        const allowedMimeTypes = [
            'application/pdf',
            // 'application/msword',
            // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/webp',
            // 'application/vnd.ms-excel',
            // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Chỉ cho phép PDF, hình ảnh');
        }

        return this.businessFileRepository.save({
            businessId,
            fileName: file.originalname,
            storedFileName: file.filename,
            filePath: `/uploads/business/${file.filename}`,
            fileSize: file.size,
            mimeType: file.mimetype,
            fileType,
        });
    }

    // GET FILE LIST
    async getBusinessFiles(businessId: number) {
        return this.businessFileRepository.findByBusinessId(businessId);
    }

    // DELETE FILE
    async deleteBusinessFile(fileId: number) {
        const file = await this.businessFileRepository.findById(fileId);

        if (!file) {
            throw new NotFoundException('File không tồn tại');
        }

        // xóa file vật lý
        const fullPath = path.join(
            process.cwd(),
            'uploads/business',
            file.storedFileName,
        );

        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }

        await this.businessFileRepository.delete(fileId);

        return { message: 'Xóa file thành công' };
    }
}