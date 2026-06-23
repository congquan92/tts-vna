import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { AuthRepository } from '../repositories/auth.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { RegisterDto } from '../dto/auth/register.dto';
import { LoginDto } from '../dto/auth/login.dto';
import { UpdateProfileDto } from '../dto/auth/update-profile.dto';
import { ChangePasswordDto } from '../dto/auth/change-password.dto';
import { ForgotPasswordDto } from '../dto/auth/forgot-password.dto';
import path from 'path';
import { ChangeEmailDto } from '../dto/auth/change-email.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async register(registerDto: RegisterDto) {
    const { username, password, fullName, email, roleId, orgType } = registerDto;

    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictException(
        'Email đã được đăng ký, vui lòng sử dụng email khác.',
      );
    }

    const existingAccount = await this.authRepository.findAccountByUsername(username);
    if (existingAccount) {
      throw new ConflictException(
        'Tên đăng nhập đã tồn tại, vui lòng sử dụng tên khác.',
      );
    }

    const roleExists = await this.authRepository.findRoleById(roleId);
    if (!roleExists) {
      throw new BadRequestException('Vai trò (Role) không tồn tại trong hệ thống');
    }

    if (roleExists.orgType !== orgType) {
      throw new BadRequestException(`Vai trò này không thuộc tổ chức ${orgType}`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      return await this.authRepository.createFullUser(
        { fullName, email, orgType },
        { username, password: hashedPassword, roleId },
      );
    } catch (error) {
      console.error('Lỗi khi lưu user vào database:', error);
      throw new InternalServerErrorException(
        'Có lỗi xảy ra, vui lòng thử lại sau.',
      );
    }
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const account = await this.authRepository.findAccountByUsername(username);

    if (!account || !(await bcrypt.compare(password, account.password))) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng. Xin vui lòng thử lại');
    }

    if (!account.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const accountType = account.userId ? 'USER' : 'BUSINESS';

    const profileId = account.userId ?? account.businessId;

    const payload = {
      sub: account.id,
      username: account.username,
      roleId: account.roleId,
      orgType: account.role?.orgType,

      accountType,
      userId: account.userId ?? null,
      businessId: account.businessId ?? null,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.authRepository.updateRefreshToken(account.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      account: {
        id: account.id,
        username: account.username,
        accountType,
      },
    };
  }

  async logout(accountId: number) {
    await this.authRepository.updateRefreshToken(accountId, null as any);

    return { message: 'Đăng xuất thành công' };
  }

  async refresh(accountId: number, refreshToken: string) {
    const account = await this.authRepository.findAccountById(accountId);

    if (!account || !account.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    if (account.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    const accountType = account.userId ? 'USER' : 'BUSINESS';

    const payload = {
      sub: account.id,
      username: account.username,
      roleId: account.roleId,
      orgType: account.role?.orgType,
      accountType,
      userId: account.userId,
      businessId: account.businessId,
    };

    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    return { accessToken: newAccessToken };
  }

  async getProfile(accountId: number) {
    const account = await this.authRepository.findAccountById(accountId);

    if (!account) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    let profile: any = null;

    // lấy profile đúng loại
    if (account.userId) {
      profile = await this.authRepository.findUserById(account.userId);
    } else if (account.businessId) {
      profile = await this.authRepository.findBusinessById(account.businessId);
    }

    if (!profile) {
      throw new NotFoundException('Không tìm thấy thông tin profile');
    }

    const accountInfo = {
      accountId: account.id,
      username: account.username,
      roleId: account.roleId,
      isActive: account.isActive,
      accountType: account.userId ? 'USER' : 'BUSINESS',
    };

    const roleInfo = {
      id: account.role?.id,
      name: account.role?.name,
      orgType: account.role?.orgType,
    };

    const permissions = account.roleId
      ? await this.authRepository.findPermissionsByRole(account.roleId)
      : [];

    const profileInfo = {
      profileId: profile.id,
      fullName: profile.fullName ?? profile.businessName,
      email: profile.email,
      avatarUrl: profile.avatarUrl ?? null,

      gender: profile.gender ?? null,
      dob: profile.dob ?? null,
      address: profile.address ?? null,
      position: profile.position ?? null,

      province: profile.province ?? null,
      ward: profile.ward ?? null,
    };

    return {
      ...accountInfo,
      role: roleInfo.name,
      orgType: roleInfo.orgType,
      permissions,

      account: {
        ...accountInfo,
        role: roleInfo,
      },

      profile: profileInfo,

      ...profileInfo,
    };
  }

  async updateProfile(accountId: number, updateDto: UpdateProfileDto) {
    const account = await this.authRepository.findAccountById(accountId);

    if (!account) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    const user = account.userId
      ? await this.authRepository.findUserById(account.userId)
      : null;

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    if (updateDto.email && updateDto.email !== user.email) {
      const emailExists = await this.authRepository.findUserByEmail(updateDto.email);
      if (emailExists) {
        throw new ConflictException('Email đã được sử dụng bởi người khác');
      }
    }

    if (updateDto.dob) {
      let dobDate: Date;

      if (typeof updateDto.dob === 'string' && updateDto.dob.includes('/')) {
        const [d, m, y] = updateDto.dob.split('/').map(Number);
        dobDate = new Date(y, m - 1, d);
      } else {
        dobDate = new Date(updateDto.dob);
      }

      if (isNaN(dobDate.getTime())) {
        throw new BadRequestException('Ngày sinh không hợp lệ');
      }

      if (dobDate > new Date()) {
        throw new BadRequestException('Ngày sinh không thể trong tương lai');
      }

      updateDto.dob = dobDate as any;
    }

    const { roleId, ...userFields } = updateDto as any;

    Object.assign(user, userFields);
    await this.authRepository.updateUser(user);

    if (roleId) {
      account.roleId = roleId;
      await this.authRepository.updateAccount(account);
    }

    const { password, ...safeAccount } = account;

    return {
      message: 'Cập nhật thông tin thành công',
      data: {
        ...user,
        account: safeAccount,
      },
    };
  }

  async changePassword(accountId: number, dto: ChangePasswordDto) {
    if (dto.newPass !== dto.confirmPass) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    }
    const account = await this.authRepository.findAccountById(accountId);
    if (!account) {
      throw new NotFoundException('Không tìm thấy tài khoản để đổi mật khẩu');
    }
    const isMatch = await bcrypt.compare(dto.oldPass, account.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu cũ không chính xác');
    }
    const isSamePassword = await bcrypt.compare(dto.newPass, account.password,);
    if (isSamePassword) { throw new BadRequestException('Mật khẩu mới không được trùng với mật khẩu hiện tại',); }
    account.password = await bcrypt.hash(dto.newPass, 10,);
    await this.authRepository.updateAccount(account);
    return {
      message: 'Đổi mật khẩu thành công',
    };
  }

  async requestPasswordReset(forgotDto: ForgotPasswordDto) {
    const account = await this.authRepository.findAccountByEmail(forgotDto.email);

    if (!account) {
      throw new NotFoundException('Email không tồn tại trong hệ thống');
    }

    const isBusiness = !!account.businessId;
    const isUser = !!account.userId;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000);

    await this.authRepository.saveOtp(account.id, otp, expiresAt);

    let email = '';
    let name = '';

    if (isBusiness) {
      const business = await this.authRepository.findBusinessById(account.businessId!);
      if (!business) {
        throw new NotFoundException('Không tìm thấy thông tin doanh nghiệp');
      }
      email = business.email;
      name = business.businessName;
    } else if (isUser) {
      const user = await this.authRepository.findUserById(account.userId!);
      if (!user) {
        throw new NotFoundException('Không tìm thấy thông tin người dùng');
      }
      email = user.email;
      name = user.fullName;
    } else {
      throw new NotFoundException('Không tìm thấy loại tài khoản hợp lệ');
    }

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Mã xác thực khôi phục mật khẩu',
        template: 'otp-email',
        context: {
          fullName: name,
          username: account.username,
          otp,
        },
        attachments: [
          {
            filename: 'logo-VNA.png',
            path: path.join(process.cwd(), 'dist/src/assets/logo-VNA.png'), // Đường dẫn tuyệt đối tới file
            cid: 'vna-logo', // ID này phải trùng với src trong HTML
          },
        ],
      });
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      throw new InternalServerErrorException(
        'Không thể gửi email xác thực, vui lòng kiểm tra lại cấu hình hệ thống',
      );
    }

    return { message: 'Mã OTP đã được gửi đến email của bạn' };
  }

  async verifyOtp(email: string, otp: string) {
    const account = await this.authRepository.findAccountByEmail(email);

    if (!account) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    const otpRecord = await this.authRepository.findOtp(account.id);

    if (
      !otpRecord ||
      otpRecord.otp !== otp ||
      otpRecord.expiresAt < new Date()
    ) {
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    return {
      message: 'Mã OTP hợp lệ',
      accountId: account.id,
    };
  }

  async verifyOtpAndReset(forgotDto: ForgotPasswordDto) {
    const { email, otp, newPassword, confirmNewPassword } = forgotDto;

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    }

    const account = await this.authRepository.findAccountByEmail(email);

    if (!account) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    const otpRecord = await this.authRepository.findOtp(account.id);

    if (!otpRecord || otpRecord.otp !== otp || otpRecord.expiresAt < new Date()) {
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    account.password = await bcrypt.hash(newPassword as string, 10);
    account.displayPassword = newPassword as string;

    await this.authRepository.updateAccount(account);

    await this.authRepository.deleteOtp(account.id);

    return {
      message: 'Đặt lại mật khẩu thành công',
    };
  }

  async requestOtpToCurrentEmail(accountId: number) {
    const account = await this.authRepository.findAccountById(accountId);

    if (!account) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000);

    await this.authRepository.saveOtp(account.id, otp, expiresAt);

    let email = '';
    let name = '';

    if (account.userId) {
      const user = await this.authRepository.findUserById(account.userId);
      if (user) {
        email = user.email;
        name = user.fullName;
      }
    }

    if (account.businessId) {
      const business = await this.authRepository.findBusinessById(account.businessId);
      if (business) {
        email = business.email;
        name = business.businessName;
      }
    }

    await this.mailerService.sendMail({
      to: email,
      subject: 'Xác thực thay đổi email',
      template: 'change-email-otp',
      context: {
        otp,
        fullName: name,
        username: account.username,
      },
      attachments: [
        {
          filename: 'logo-VNA.png',
          path: path.join(process.cwd(), 'dist/src/assets/logo-VNA.png'),
          cid: 'vna-logo',
        },
      ],
    });

    return { message: 'Mã OTP đã được gửi tới email hiện tại của bạn' };
  }

  async verifyAndChangeEmail(accountId: number, dto: ChangeEmailDto) {
    const { newEmail, otp } = dto;

    // 1. Lấy account
    const account = await this.authRepository.findAccountById(accountId);

    if (!account) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    const otpRecord = await this.authRepository.findOtp(account.id);

    if (
      !otpRecord ||
      otpRecord.otp !== otp ||
      otpRecord.expiresAt < new Date()
    ) {
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn, vui lòng kiểm tra lại');
    }

    // CASE 2: email không hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      throw new BadRequestException('Email không hợp lệ, vui lòng kiểm tra lại dữ liệu');
    }

    // lấy email hiện tại
    let currentEmail = '';

    if (account.userId) {
      const user = await this.authRepository.findUserById(account.userId);
      if (user) currentEmail = user.email;
    }

    if (account.businessId) {
      const business = await this.authRepository.findBusinessById(account.businessId);
      if (business) currentEmail = business.email;
    }

    // CASE 3: email mới trùng email hiện tại
    if (newEmail === currentEmail) {
      throw new BadRequestException('Email mới không được trùng email hiện tại, vui lòng kiểm tra lại dữ liệu');
    }

    // CASE 4: email đã tồn tại trong hệ thống
    const emailExists =
      await this.authRepository.findAccountByEmail(newEmail);

    if (emailExists) {
      throw new ConflictException('Email mới đã tồn tại trên hệ thống, vui lòng kiểm tra lại dữ liệu');
    }

    // update email
    if (account.userId) {
      await this.authRepository.updateUserEmail(account.userId, newEmail);
    }

    if (account.businessId) {
      await this.authRepository.updateBusinessEmail(account.businessId, newEmail);
    }

    await this.authRepository.deleteOtp(account.id);

    return {
      message: 'Đổi email thành công',
    };
  }

  async updateUserAvatar(
    userId: number,
    file: Express.Multer.File,
  ) {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Chỉ hỗ trợ JPG, JPEG, PNG',
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException(
        'Kích thước ảnh tối đa là 5MB',
      );
    }

    const result = await this.cloudinaryService.uploadFile(file);

    await this.authRepository.updateAvatar(
      userId,
      result.secure_url,
      result.public_id,
    );

    return {
      message: 'Cập nhật ảnh đại diện thành công',
      avatarUrl: result.secure_url,
    };
  }
}
