import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { TypeOfBusiness } from './typeOfBusiness.entity';
import { BusinessFile } from './business-file.entity';
import { BusinessIndustry } from './BusinessIndustry.entity';
import { Account } from './account.entity';

export enum BusinessStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

@Entity('businesses')
export class Business {
    @PrimaryGeneratedColumn()
    id!: number;

    // Mã số thuế
    @Column({
        unique: true,
        length: 20,
    })
    taxCode!: string;

    // Tên doanh nghiệp
    @Column({
        length: 255,
    })
    businessName!: string;

    // Tên tiếng nước ngoài
    @Column({
        nullable: true,
        length: 255,
    })
    foreignName?: string;

    // Loại hình kinh doanh
    @Column()
    typeOfBusinessId!: number;

    @ManyToOne(() => TypeOfBusiness)
    @JoinColumn({ name: 'typeOfBusinessId' })
    typeOfBusiness!: TypeOfBusiness;

    // Ngành nghề kinh doanh chính
    @Column()
    businessIndustryId!: number;

    @ManyToOne(() => BusinessIndustry)
    @JoinColumn({
        name: 'businessIndustryId',
    })
    businessIndustry!: BusinessIndustry;

    // Ngày cấp GPKD
    @Column({
        type: 'date',
        nullable: true,
    })
    businessLicenseDate?: Date;

    // Tỉnh / Thành phố ĐKKD
    @Column({
        length: 255,
    })
    registeredProvince!: string;

    // Phường / Xã ĐKKD
    @Column({
        length: 255,
    })
    registeredWard!: string;

    // Địa chỉ đăng ký kinh doanh
    @Column({
        length: 500,
    })
    registeredAddress!: string;

    // Email
    @Column({
        length: 255,
    })
    email!: string;

    // SĐT cơ quan
    @Column({
        nullable: true,
        length: 20,
    })
    officePhone?: string;

    // Tỉnh / TP hoạt động
    @Column({
        nullable: true,
        length: 255,
    })
    operatingProvince?: string;

    // Phường / Xã hoạt động
    @Column({
        nullable: true,
        length: 255,
    })
    operatingWard?: string;

    // Địa điểm kinh doanh
    @Column({
        nullable: true,
        length: 500,
    })
    businessLocation?: string;

    // Người đứng đầu doanh nghiệp
    @Column({
        nullable: true,
        length: 255,
    })
    legalRepresentative?: string;

    // SĐT người đứng đầu
    @Column({
        nullable: true,
        length: 20,
    })
    representativePhone?: string;

    @Column({
        type: 'enum',
        enum: BusinessStatus,
        default: BusinessStatus.ACTIVE,
    })
    status!: BusinessStatus;

    @OneToMany(
        () => BusinessFile,
        (file) => file.business,
        {
            cascade: true,
        },
    )
    files!: BusinessFile[];

    @OneToMany(() => Account, (account) => account.business)
    accounts!: Account[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}