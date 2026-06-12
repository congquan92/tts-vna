import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Business } from "../entities/business.entity";
import { DataSource, Repository } from "typeorm";
import { Account } from "../entities/account.entity";
import { SearchBusinessDto } from "../dto/business/search-business.dto";

@Injectable()
export class BusinessRepository {
    constructor(
        @InjectRepository(Business)
        private readonly businessRepository: Repository<Business>,
        private readonly dataSource: DataSource,
    ) { }

    async createFullBusiness(
        businessData: Partial<Business>,
        accountData: Partial<Account>,
    ) {
        return this.dataSource.transaction(
            async (manager) => {
                const business = manager.create(
                    Business,
                    businessData,
                );

                const savedBusiness =
                    await manager.save(business);

                const account = manager.create(
                    Account,
                    {
                        ...accountData,
                        businessId: savedBusiness.id,
                        isActive: false,
                    },
                );

                const savedAccount =
                    await manager.save(account);

                return {
                    business: savedBusiness,
                    account: savedAccount,
                };
            },
        );
    }

    async getAll(page = 1, limit = 10) {
        const [businesses, total] =
            await this.businessRepository.findAndCount({
                relations: { typeOfBusiness: true, businessIndustry: true, },
                order: { id: 'DESC', },
                skip: (page - 1) * limit,
                take: limit,
            });

        const data = businesses.map((business) => ({
            id: business.id,
            businessName: business.businessName,
            taxCode: business.taxCode,
            typeOfBusiness:
                business.typeOfBusiness?.name ?? '',
            businessIndustry:
                business.businessIndustry?.name ?? '',
            ward:
                business.registeredWard,
            status:
                business.status ? 'Active' : 'Inactive',
        }));

        return {
            data, total, page, lastPage: Math.ceil(total / limit),
        }
    }

    async findById(id: number) {
        return await this.businessRepository.findOne({
            where: { id },
            relations: {
                typeOfBusiness: true,
                businessIndustry: true,
                accounts: {
                    role: true,   
                },
            },
        });
    }

    async findByTaxCode(taxCode: string) {
        return await this.businessRepository.findOne({
            where: { taxCode },
        });
    }

    async findByEmail(email: string) {
        return await this.businessRepository.findOne({
            where: { email },
        });
    }

    async deleteBusiness(id: number) {
        return await this.businessRepository.delete(id);
    }

    async save(business: Business) {
        return this.businessRepository.save(business);
    }

    async search(query: SearchBusinessDto) {
        try {
            const page = Number(query.page) > 0 ? Number(query.page) : 1;
            const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
            const skip = (page - 1) * limit;

            const qb = this.businessRepository
                .createQueryBuilder('business')
                .leftJoinAndSelect('business.typeOfBusiness', 'typeOfBusiness')
                .leftJoinAndSelect('business.businessIndustry', 'businessIndustry');

            if (query.businessName) {
                qb.andWhere('business.businessName ILIKE :businessName', {
                    businessName: `%${query.businessName}%`,
                });
            }

            if (query.taxCode) {
                qb.andWhere('business.taxCode ILIKE :taxCode', {
                    taxCode: `%${query.taxCode}%`,
                });
            }

            if (query.typeOfBusinessId) {
                qb.andWhere('business.typeOfBusinessId = :typeOfBusinessId', {
                    typeOfBusinessId: Number(query.typeOfBusinessId),
                });
            }

            if (query.businessIndustryId) {
                qb.andWhere('business.businessIndustryId = :businessIndustryId', {
                    businessIndustryId: Number(query.businessIndustryId),
                });
            }

            if (query.registeredWard) {
                qb.andWhere('business.registeredWard = :registeredWard', {
                    registeredWard: query.registeredWard,
                });
            }

            if (query.status !== undefined && query.status !== null) {
                const status =
                    typeof query.status === 'string'
                        ? query.status === 'true'
                        : query.status;

                qb.andWhere('business.status = :status', {
                    status,
                });
            }

            qb.skip(skip).take(limit);

            const [businesses, total] = await qb.getManyAndCount();

            const data = businesses.map((b) => ({
                id: b.id,
                businessName: b.businessName,
                taxCode: b.taxCode,
                typeOfBusiness: b.typeOfBusiness?.name ?? '',
                businessIndustry: b.businessIndustry?.name ?? '',
                registeredWard: b.registeredWard,
                status: b.status,
            }));

            return {
                data,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            console.error('BUSINESS SEARCH ERROR:', error);
            throw error;
        }
    }
}