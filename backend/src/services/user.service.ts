import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';

import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/user/user.dto';
import { SearchUserDto } from '../dto/user/search-user.dto';
import { AccountRepository } from '../repositories/account.repository';
import { RoleRepository } from '../repositories/role.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  // Thêm mới người dùng
  async createUser(dto: CreateUserDto) {
    const existedUsername = await this.accountRepository.findAccountByUsername(
      dto.username,
    );

    if (existedUsername) {
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    }

    const existedEmail = await this.userRepository.findByEmail(dto.email);

    if (existedEmail) {
      throw new ConflictException('Email đã tồn tại');
    }

    const role = await this.roleRepository.findRoleById(dto.roleId);

    if (!role) {
      throw new NotFoundException('Vai trò không tồn tại');
    }

    const orgType = role.orgType;

    const password = dto.password || '12345678';

    const hashedPassword = await bcrypt.hash(password, 10);

    const { username, roleId, dob, password: _, ...userData } = dto;

    const userPayload = {
      ...userData,
      ...(dob && {
        dob: new Date(dob),
      }),
      orgType: orgType,
    };

    return await this.userRepository.createFullUser(userPayload, {
      username,
      password: hashedPassword,
      roleId,
    });
  }

  // Lấy danh sách người dùng
  async getAllUsers(page = 1, limit = 10) {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

    return this.userRepository.getAll(safePage, safeLimit);
  }

  // Lấy chi tiết người dùng
  async getUserDetailById(id: number) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return {
      ...user,
      accounts: user.accounts.map((acc) => ({
        ...acc,
        role: acc.role,
      })),
    };
  }

  // Tìm kiếm người dùng
  async searchUsers(query: SearchUserDto) {
    return this.userRepository.search(query);
  }

  // Cập nhật thông tin người dùng
  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const account = user.accounts?.[0];

    // 1. Cập nhật thông tin Account nếu có
    if (account) {
      let accountUpdated = false;

      if (dto.username && dto.username !== account.username) {
        const existedUsername =
          await this.accountRepository.findAccountByUsername(dto.username);
        if (existedUsername && existedUsername.id !== account.id) {
          throw new ConflictException('Tên đăng nhập đã tồn tại');
        }
        account.username = dto.username;
        accountUpdated = true;
      }

      if (dto.roleId && dto.roleId !== account.roleId) {
        const role = await this.roleRepository.findRoleById(dto.roleId);
        if (!role) {
          throw new NotFoundException('Vai trò không tồn tại');
        }
        account.roleId = dto.roleId;
        accountUpdated = true;
      }

      if (dto.password) {
        account.password = await bcrypt.hash(dto.password, 10);
        accountUpdated = true;
      }

      if (accountUpdated) {
        await this.accountRepository.save(account);
      }
    }

    // 2. Kiểm tra email nếu thay đổi
    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.userRepository.findByEmail(dto.email);

      if (emailExists && emailExists.id !== id) {
        throw new ConflictException('Email đã tồn tại');
      }
    }

    // 3. Chuẩn bị payload cho User entity, loại bỏ các trường của Account
    const { username, roleId, password, ...userProperties } = dto;

    const updatePayload: Partial<User> = {
      ...userProperties,
      dob: dto.dob ? new Date(dto.dob) : undefined,
      orgType: dto.orgType as 'SO' | 'DOANH_NGHIEP' | undefined,
    };

    // Xóa các undefined properties để tránh lỗi TypeORM nếu cần
    Object.keys(updatePayload).forEach((key) => {
      if ((updatePayload as any)[key] === undefined) {
        delete (updatePayload as any)[key];
      }
    });

    return await this.userRepository.update(id, updatePayload);
  }

  // Xóa người dùng
  async deleteUser(id: number) {
    const result = await this.userRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return {
      message: 'Xóa thành công',
    };
  }

  // Import danh sách người dùng
  async importFromExcel(file: Express.Multer.File) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const errors: any[] = [];
    const success: any[] = [];

    for (let index = 0; index < data.length; index++) {
      const row: any = data[index];

      try {
        // ================= MAP CỘT =================
        const fullName = String(row['Họ tên'] || '').trim();
        const username = String(row['Tài khoản'] || '').trim();
        const email = String(row['Email'] || '').trim();
        const roleValue = row['Vai trò'];
        const position = String(row['Chức danh'] || '').trim();
        const isActive = true;

        const rowErrors: string[] = [];

        // ================= VALIDATE =================
        if (!fullName) rowErrors.push('Họ tên không được để trống');
        if (!username) rowErrors.push('Tài khoản không được để trống');
        if (!email) {
          rowErrors.push('Email không được để trống');
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            rowErrors.push('Email không hợp lệ');
          }
        }

        // ================= XỬ LÝ VAI TRÒ =================
        let role: Role | null = null;
        if (!roleValue) {
          rowErrors.push('Vai trò không được để trống');
        } else {
          // Thử tìm theo ID nếu là số
          const roleId = Number(roleValue);
          if (!isNaN(roleId)) {
            role = await this.roleRepository.findRoleById(roleId);
          }

          // Nếu không tìm thấy theo ID, thử tìm theo tên
          if (!role) {
            role = await this.roleRepository.findRoleByName(
              String(roleValue).trim(),
            );
          }

          // Thử tìm theo tên (Case-insensitive) nếu vẫn chưa thấy
          if (!role) {
            try {
              const roles = await (
                this.roleRepository as any
              ).roleRepository.find();
              role = roles.find(
                (r: any) =>
                  r.name.toLowerCase() ===
                  String(roleValue).trim().toLowerCase(),
              );
            } catch (e) {
              console.error('Error in case-insensitive role search:', e);
            }
          }

          if (!role) {
            rowErrors.push(
              `Vai trò "${roleValue}" không tồn tại trong hệ thống`,
            );
          }
        }

        // ================= CHECK DB =================
        const existedUsername =
          await this.accountRepository.findAccountByUsername(username);
        if (existedUsername) rowErrors.push('Tài khoản đã tồn tại');

        const existedEmail = await this.userRepository.findByEmail(email);
        if (existedEmail) rowErrors.push('Email đã tồn tại');

        // ================= IF ERROR =================
        if (rowErrors.length > 0) {
          errors.push({
            row: index + 2,
            data: row,
            errors: rowErrors,
          });
          continue;
        }

        // Satisfy TypeScript: role cannot be null here because if it were, rowErrors.length would be > 0
        if (!role) continue;

        // ================= CREATE USER =================
        const hashedPassword = await bcrypt.hash('12345678', 10);

        if (!role.orgType) {
          throw new Error(`Vai trò ${role.name} không có thông tin orgType`);
        }

        await this.userRepository.createFullUser(
          {
            fullName,
            email,
            position,
            isActive,
            orgType: role.orgType,
          },
          {
            username,
            password: hashedPassword,
            roleId: role.id,
          },
        );

        success.push(username);
      } catch (err) {
        console.error('IMPORT ERROR ROW:', index + 2, err);

        errors.push({
          row: index + 2,
          data: row,
          errors: [`Lỗi hệ thống: ${err.message || 'Không rõ nguyên nhân'}`, `Chi tiết: ${err.detail || ''}`.trim()],
        });
      }
    }

    return {
      message: 'Import hoàn tất',
      total: data.length,
      success: success.length,
      failed: errors.length,
      errors,
    };
  }

  // Export danh sách người dùng
  async exportUsers() {
    const users = await this.userRepository.findAllForExport();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Users');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Họ tên', key: 'fullName', width: 25 },
      { header: 'Tài khoản', key: 'username', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Vai trò', key: 'role', width: 20 },
      { header: 'Chức danh', key: 'position', width: 20 },
      { header: 'Trạng thái', key: 'status', width: 15 },
    ];

    users.forEach((user) => {
      const acc = user.accounts?.[0];

      sheet.addRow({
        id: user.id,
        fullName: user.fullName,
        username: acc?.username ?? '',
        email: user.email,
        role: acc?.role?.name ?? '',
        position: user.position ?? '',
        status: user.isActive ? 'Active' : 'Inactive',
      });
    });

    return await workbook.xlsx.writeBuffer();
  }

  // Khởi tạo mật khẩu người dùng
  async setPassword(userId: number, password: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new BadRequestException('Không tìm thấy người dùng');
    }

    if (!user.accounts || user.accounts.length === 0) {
      throw new BadRequestException('Người dùng chưa có tài khoản');
    }

    const account = user.accounts[0];

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.accountRepository.updateAccountPassword(account.id, {
      password: hashedPassword,
      isPasswordSet: true,
    });

    return {
      message: 'Đặt lại mật khẩu thành công',
    };
  }

  // Bật/Tắt trạng thái
  async toggleUserStatus(userId: number) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new BadRequestException('Không tìm thấy user');
    }

    const newStatus = !user.isActive;

    // update user
    user.isActive = newStatus;
    const updated = await this.userRepository.save(user);

    // update account
    if (updated.accounts?.length) {
      const account = updated.accounts[0];

      account.isActive = newStatus;
      await this.accountRepository.save(account);
    }

    return {
      message: 'Cập nhật trạng thái thành công',
      data: {
        id: updated.id,
        isActive: updated.isActive,
      },
    };
  }
}
