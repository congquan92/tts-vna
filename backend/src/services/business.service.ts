import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BusinessRepository } from "../repositories/business.repository";
import { BusinessStatus } from "../entities/business.entity";
import { CreateBusinessDto, UpdateBusinessDto } from "../dto/business/business.dto";
import { TypeOfBusinessRepository } from "../repositories/typeOfBusiness.repository";
import { BusinessIndustryRepository } from "../repositories/businessIndustry.repository";
import * as bcrypt from 'bcrypt';
import { AccountRepository } from "../repositories/account.repository";
import { RoleRepository } from "../repositories/role.repository";
import { SearchBusinessDto } from "../dto/business/search-business.dto";
import { BusinessFileRepository } from "../repositories/businessFile.repository";

@Injectable()
export class BusinessService {
    constructor(
        private readonly businessRepository: BusinessRepository,
        private readonly typeOfBusinessRepository: TypeOfBusinessRepository,
        private readonly businessIndustryRepository: BusinessIndustryRepository,
        private readonly accountRepository: AccountRepository,
        private readonly roleRepository: RoleRepository,
        private readonly businessFileRepository: BusinessFileRepository,
    ) { }

    // Lấy danh sách doanh nghiệp 
    async getAllBusinesses(page = 1, limit = 10) {
        const safePage = Math.max(Number(page) || 1, 1);
        const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

        return this.businessRepository.getAll(safePage, safeLimit);
    }

    // Lấy chi tiết doanh nghiệp
    async getBusinessDetailById(id: number) {
        const business = await this.businessRepository.findById(id);

        if (!business) {
            throw new NotFoundException('Không tìm thấy doanh nghiệp');
        }

        return {
            ...business,
            typeOfBusiness: {
                id: business.typeOfBusiness.id,
                name: business.typeOfBusiness.name,
            },
            businessIndustry: {
                id: business.businessIndustry.id,
                name: business.businessIndustry.name,
            }
        };
    }

    // Xóa doanh nghiệp
    async deleteBusiness(id: number) {
        const business = await this.businessRepository.deleteBusiness(id);

        if (!business.affected) {
            throw new NotFoundException('Không tìm thấy doanh nghiệp');
        }

        return business;
    }

    // Bật/Tắt trạng thái
    async toggleBusinessStatus(id: number) {
        const business = await this.businessRepository.findById(id);

        if (!business) {
            throw new BadRequestException('Không tìm thấy doanh nghiệp');
        }

        const newStatus =
            business.status === BusinessStatus.ACTIVE
                ? BusinessStatus.INACTIVE
                : BusinessStatus.ACTIVE;

        business.status = newStatus;
        const updated = await this.businessRepository.save(business);

        if (updated.accounts?.length) {
            for (const account of updated.accounts) {
                account.isActive = newStatus === BusinessStatus.ACTIVE;
                await this.accountRepository.save(account);
            }
        }

        return {
            message: 'Cập nhật trạng thái thành công',
            data: {
                id: updated.id,
                isActive: newStatus === BusinessStatus.ACTIVE,
            },
        };
    }

    // Thêm mới doanh nghiệp
    async createBusiness(dto: CreateBusinessDto) {
        const existedTaxCode =
            await this.businessRepository.findByTaxCode(dto.taxCode);

        if (existedTaxCode) {
            throw new BadRequestException('Mã số thuế đã tồn tại');
        }

        const existedEmail =
            await this.businessRepository.findByEmail(dto.email);

        if (existedEmail) {
            throw new BadRequestException('Email đã tồn tại');
        }

        const typeOfBusiness =
            await this.typeOfBusinessRepository.findOneById(
                dto.typeOfBusinessId,
            );

        if (!typeOfBusiness) {
            throw new BadRequestException(
                'Loại hình kinh doanh không tồn tại',
            );
        }

        const businessIndustry =
            await this.businessIndustryRepository.findById(
                dto.businessIndustryId,
            );

        if (!businessIndustry) {
            throw new BadRequestException(
                'Ngành nghề kinh doanh không tồn tại',
            );
        }

        if (businessIndustry.level !== 4) {
            throw new BadRequestException(
                'Chỉ được chọn ngành nghề kinh doanh cấp 4',
            );
        }

        // const role = await this.roleRepository.findRoleById(
        //     dto.roleId,
        // );

        // if (!role) {
        //     throw new BadRequestException('Vai trò không tồn tại');
        // }

        // if (role.orgType !== 'DOANH_NGHIEP') {
        //     throw new BadRequestException(
        //         'Vai trò không thuộc doanh nghiệp',
        //     );
        // }

        const defaultRole = await this.roleRepository.findRoleByName('CEO_DN');

        if (!defaultRole) {
            throw new BadRequestException('Chưa có role mặc định cho doanh nghiệp');
        }

        const existedUsername =
            await this.accountRepository.findAccountByUsername(
                dto.taxCode,
            );

        if (existedUsername) {
            throw new BadRequestException(
                'Mã số thuế đã được sử dụng làm tài khoản',
            );
        }

        // Password mặc định
        const rawPassword = '12345678';
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const {
            typeOfBusinessId,
            businessIndustryId,
            ...businessData
        } = dto;

        // Transaction create business + account
        const result =
            await this.businessRepository.createFullBusiness(
                {
                    ...businessData,
                    typeOfBusinessId,
                    businessIndustryId,
                    status: BusinessStatus.ACTIVE,
                },
                {
                    username: dto.taxCode,
                    password: hashedPassword,
                    displayPassword: rawPassword,
                    roleId: defaultRole.id,
                    isActive: true,
                },
            );

        return {
            message: 'Thêm doanh nghiệp thành công',
            data: {
                business: {
                    id: result.business.id,
                    ...businessData,
                    typeOfBusinessId,
                    businessIndustryId,
                    status: result.business.status,
                    createdAt: result.business.createdAt,
                },
                account: {
                    id: result.account.id,
                    username: result.account.username,
                    password: rawPassword,
                    role: result.account.roleId,
                    isActive: true,
                },
            },
        };
    }

    // // Thêm mới doanh nghiệp (CHỈ PREVIEW - KHÔNG LƯU DB)
    // async createBusiness(dto: CreateBusinessDto) {
    //     const existedTaxCode =
    //         await this.businessRepository.findByTaxCode(dto.taxCode);

    //     if (existedTaxCode) {
    //         throw new BadRequestException('Mã số thuế đã tồn tại');
    //     }

    //     const existedEmail =
    //         await this.businessRepository.findByEmail(dto.email);

    //     if (existedEmail) {
    //         throw new BadRequestException('Email đã tồn tại');
    //     }

    //     const typeOfBusiness =
    //         await this.typeOfBusinessRepository.findOneById(
    //             dto.typeOfBusinessId,
    //         );

    //     if (!typeOfBusiness) {
    //         throw new BadRequestException('Loại hình kinh doanh không tồn tại');
    //     }

    //     const businessIndustry =
    //         await this.businessIndustryRepository.findById(
    //             dto.businessIndustryId,
    //         );

    //     if (!businessIndustry) {
    //         throw new BadRequestException('Ngành nghề kinh doanh không tồn tại');
    //     }

    //     const defaultRole =
    //         await this.roleRepository.findRoleByName('CEO_DN');

    //     if (!defaultRole) {
    //         throw new BadRequestException('Chưa có role mặc định cho doanh nghiệp');
    //     }

    //     const existedUsername =
    //         await this.accountRepository.findAccountByUsername(dto.taxCode);

    //     if (existedUsername) {
    //         throw new BadRequestException(
    //             'Mã số thuế đã được sử dụng làm tài khoản',
    //         );
    //     }

    //     // password demo để hiển thị popup
    //     const rawPassword = '12345678';

    //     return {
    //         message: 'Kiểm tra dữ liệu thành công, chờ xác nhận',
    //         data: {
    //             business: dto,
    //             account: {
    //                 username: dto.taxCode,
    //                 password: rawPassword,
    //                 roleId: defaultRole.id,
    //             },
    //         },
    //     };
    // }

    // Cập nhật thông tin doanh nghiệp
    async updateBusiness(
        id: number,
        dto: UpdateBusinessDto,
    ) {
        const business =
            await this.businessRepository.findById(id);

        if (!business) {
            throw new NotFoundException(
                'Không tìm thấy doanh nghiệp',
            );
        }

        if (dto.taxCode && dto.taxCode !== business.taxCode) {
            throw new BadRequestException(
                'Không được phép thay đổi mã số thuế',
            );
        }

        if (
            dto.email &&
            dto.email !== business.email
        ) {
            const existedEmail =
                await this.businessRepository.findByEmail(
                    dto.email,
                );

            if (existedEmail) {
                throw new BadRequestException(
                    'Email đã tồn tại',
                );
            }
        }

        if (dto.typeOfBusinessId) {
            const typeOfBusiness =
                await this.typeOfBusinessRepository.findOneById(
                    dto.typeOfBusinessId,
                );

            if (!typeOfBusiness) {
                throw new BadRequestException(
                    'Loại hình kinh doanh không tồn tại',
                );
            }

            business.typeOfBusiness = typeOfBusiness;
        }

        if (dto.businessIndustryId) {
            const businessIndustry =
                await this.businessIndustryRepository.findById(
                    dto.businessIndustryId,
                );

            if (!businessIndustry) {
                throw new BadRequestException(
                    'Ngành nghề kinh doanh không tồn tại',
                );
            }

            if (businessIndustry.level !== 4) {
                throw new BadRequestException(
                    'Chỉ được chọn ngành nghề kinh doanh cấp 4',
                );
            }

            business.businessIndustry = businessIndustry;
        }

        const { taxCode, typeOfBusinessId, businessIndustryId, ...safeDto } = dto;

        Object.assign(business, safeDto);

        const updated =
            await this.businessRepository.save(
                business,
            );

        return {
            message: 'Cập nhật doanh nghiệp thành công',
            data: {
                id: updated.id,
                ...safeDto,
                taxCode: updated.taxCode,
                status: updated.status,
                updatedAt: updated.updatedAt,
            },
        };
    }

    // Cập nhật thông tin doanh nghiệp tạm thời
    // async updateBusiness(id: number, dto: UpdateBusinessDto) {
    //     const business =
    //         await this.businessRepository.findById(id);

    //     if (!business) {
    //         throw new NotFoundException(
    //             'Không tìm thấy doanh nghiệp',
    //         );
    //     }

    //     if (dto.taxCode && dto.taxCode !== business.taxCode) {
    //         throw new BadRequestException(
    //             'Không được phép thay đổi mã số thuế',
    //         );
    //     }

    //     if (dto.email && dto.email !== business.email) {
    //         const existedEmail =
    //             await this.businessRepository.findByEmail(dto.email);

    //         if (existedEmail) {
    //             throw new BadRequestException(
    //                 'Email đã tồn tại',
    //             );
    //         }
    //     }

    //     if (dto.typeOfBusinessId) {
    //         const typeOfBusiness =
    //             await this.typeOfBusinessRepository.findOneById(
    //                 dto.typeOfBusinessId,
    //             );

    //         if (!typeOfBusiness) {
    //             throw new BadRequestException(
    //                 'Loại hình kinh doanh không tồn tại',
    //             );
    //         }

    //         business.typeOfBusiness = typeOfBusiness;
    //     }

    //     if (dto.businessIndustryId) {
    //         const businessIndustry =
    //             await this.businessIndustryRepository.findById(
    //                 dto.businessIndustryId,
    //             );

    //         if (!businessIndustry) {
    //             throw new BadRequestException(
    //                 'Ngành nghề kinh doanh không tồn tại',
    //             );
    //         }

    //         business.businessIndustry = businessIndustry;
    //     }

    //     const { taxCode, typeOfBusinessId, businessIndustryId, ...safeDto } = dto;

    //     Object.assign(business, safeDto);

    //     return {
    //         message: 'Cập nhật tạm thời (chưa xác nhận)',
    //         data: {
    //             ...business,
    //         },
    //     };
    // }

    // Xác nhận thông tin sau khi thêm mới/sửa
    async confirmBusiness(id: number) {
        const business =
            await this.businessRepository.findById(id);

        if (!business) {
            throw new NotFoundException(
                'Không tìm thấy doanh nghiệp',
            );
        }

        business.status = BusinessStatus.ACTIVE;

        const updated =
            await this.businessRepository.save(business);

        // active account luôn
        if (updated.accounts?.length) {
            const account = updated.accounts[0];
            account.isActive = true;

            await this.accountRepository.save(account);
        }

        return {
            message: 'Xác nhận doanh nghiệp thành công',
            data: {
                business: {
                    ...updated,
                },
                account: {
                    ...updated.accounts?.[0],
                },
            },
        };
    }

    // // Xác nhận => MỚI LƯU DATABASE
    // async confirmBusiness(id: number) {
    //     const business =
    //         await this.businessRepository.findById(id);

    //     if (!business) {
    //         throw new NotFoundException(
    //             'Không tìm thấy doanh nghiệp',
    //         );
    //     }

    //     if (business.status === BusinessStatus.ACTIVE) {
    //         throw new BadRequestException(
    //             'Doanh nghiệp đã được xác nhận',
    //         );
    //     }

    //     business.status = BusinessStatus.ACTIVE;

    //     const updated =
    //         await this.businessRepository.save(business);

    //     return {
    //         message: 'Xác nhận doanh nghiệp thành công',
    //         data: {
    //             ...updated,
    //             typeOfBusiness: updated.typeOfBusiness,
    //             businessIndustry: updated.businessIndustry,
    //             accounts: updated.accounts,
    //         },
    //     };
    // }

    // Khởi tạo mật khẩu doanh nghiệp
    async setPassword(businessId: number, password: string) {
        const business = await this.businessRepository.findById(businessId);

        if (!business) {
            throw new BadRequestException('Không tìm thấy doanh nghiệp');
        }

        if (!business.accounts || business.accounts.length === 0) {
            throw new BadRequestException('Doanh nghiệp chưa có tài khoản');
        }

        const account = business.accounts[0];

        const hashedPassword = await bcrypt.hash(password, 10);

        await this.accountRepository.updateAccountPassword(account.id, {
            password: hashedPassword,
            displayPassword: password,
            isPasswordSet: true,
        });

        return {
            message: 'Đặt lại mật khẩu thành công',
        };
    }

    // Tìm kiếm doanh nghiệp
    async search(query: SearchBusinessDto) {
        return this.businessRepository.search(query);
    }
}