import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Business } from './business.entity';

export enum BusinessFileType {
    BUSINESS_LICENSE = 'business_license',
    OTHER = 'other',
}

@Entity('business_files')
export class BusinessFile {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    businessId!: number;

    @ManyToOne(
        () => Business,
        (business) => business.files,
        {
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({ name: 'businessId' })
    business!: Business;

    // Tên file hiển thị
    @Column({
        length: 255,
    })
    fileName!: string;

    // Tên file lưu trên server
    @Column({
        length: 500,
    })
    storedFileName!: string;

    // Đường dẫn file
    @Column({
        length: 1000,
    })
    filePath!: string;

    // Loại file
    @Column({
        type: 'enum',
        enum: BusinessFileType,
    })
    fileType!: BusinessFileType;

    // Dung lượng
    @Column({
        nullable: true,
    })
    fileSize?: number;

    // Mime type
    @Column({
        nullable: true,
        length: 100,
    })
    mimeType?: string;

    @CreateDateColumn()
    createdAt!: Date;
}