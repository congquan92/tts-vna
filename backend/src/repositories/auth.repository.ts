import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Account } from '../entities/account.entity';
import { Otp } from '../entities/otp.entity';

@Injectable()
export class AuthRepository {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
        @InjectRepository(Otp)
        private readonly otpRepository: Repository<Otp>,
        private readonly dataSource: DataSource,
    ) { }

    async createFullUser(userData: Partial<User>, accountData: Partial<Account>): Promise<{ user: User, account: Account }> {
        return await this.dataSource.transaction(async (manager) => {
            const user = manager.create(User, userData);
            const savedUser = await manager.save(user);

            const account = manager.create(Account, { ...accountData, userId: savedUser.id });
            const savedAccount = await manager.save(account);

            return { user: savedUser, account: savedAccount };
        });
    }

    async findAccountByUsername(username: string): Promise<Account | null> {
        return await this.accountRepository.findOne({
            where: { username },
            relations: ['user'],
            select: ['id', 'username', 'password', 'role', 'userId']
        });
    }

    async findUserById(id: number): Promise<User | null> {
        return await this.userRepository.findOne({ where: { id } });
    }

    async findUserByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOneBy({ email });
    }

    async updateUser(user: User): Promise<User> {
        return await this.userRepository.save(user);
    }

    async findAccountByUserId(userId: number): Promise<Account | null> {
        return await this.accountRepository.findOne({
            where: { userId },
            select: ['id', 'username', 'password', 'role', 'userId']
        });
    }

    async updateAccount(account: Account): Promise<Account> {
        return await this.accountRepository.save(account);
    }

    async saveOtp(userId: number, otp: string, expiresAt: Date): Promise<Otp> {
        let otpRecord = await this.otpRepository.findOneBy({ userId });
        if (otpRecord) {
            otpRecord.otp = otp;
            otpRecord.expiresAt = expiresAt;
        } else {
            otpRecord = this.otpRepository.create({ userId, otp, expiresAt });
        }
        return await this.otpRepository.save(otpRecord);
    }

    async findOtp(userId: number): Promise<Otp | null> {
        return await this.otpRepository.findOneBy({ userId });
    }

    async deleteOtp(userId: number): Promise<void> {
        await this.otpRepository.delete({ userId });
    }

    async findOtpByEmail(email: string): Promise<Otp | null> {
        return await this.otpRepository.findOne({
            where: { user: { email } },
            relations: ['user']
        });
    }

    async updateUserEmail(userId: number, newEmail: string): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) throw new Error('User not found');

        user.email = newEmail;
        return await this.userRepository.save(user);
    }

    async saveOtpByEmail(email: string, otp: string, expiresAt: Date): Promise<Otp> {
        const user = await this.userRepository.findOneBy({ email });
        if (!user) throw new Error('User not found');

        let otpRecord = await this.otpRepository.findOneBy({ userId: user.id });

        if (otpRecord) {
            otpRecord.otp = otp;
            otpRecord.expiresAt = expiresAt;
        } else {
            // create new record linked to user
            otpRecord = this.otpRepository.create({ userId: user.id, otp, expiresAt });
        }

        return await this.otpRepository.save(otpRecord);
    }

    async deleteOtpByEmail(email: string): Promise<void> {
        const user = await this.userRepository.findOneBy({ email });
        if (!user) return;
        await this.otpRepository.delete({ userId: user.id });
    }
}