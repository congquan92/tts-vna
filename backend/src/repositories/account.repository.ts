import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Account } from "../entities/account.entity";

@Injectable()
export class AccountRepository {
    constructor(
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
    ) { }

    async findById(id: number) {
        return this.accountRepository.findOne({
            where: { id },
            relations: {
                user: true,
                role: true,
                business: true,
            },
        });
    }

    async findAccountByUsername(username: string) {
        return await this.accountRepository.findOne({
            where: { username },
            relations: {
                role: true,
                user: true,
                business: true,
            },
        });
    }

    async updateAccountPassword(accountId: number, data: Partial<Account>) {
        const account = await this.accountRepository.findOne({
            where: { id: accountId },
        });

        if (!account) {
            throw new BadRequestException('Không tìm thấy tài khoản');
        }

        Object.assign(account, data);

        return this.accountRepository.save(account);
    }

    async save(account: Account) {
        return await this.accountRepository.save(account);
    }
}