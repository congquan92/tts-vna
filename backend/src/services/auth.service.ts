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

    const userId = account.userId;
    if (userId === undefined) {
      throw new InternalServerErrorException('Tài khoản không hợp lệ');
    }

    const payload = {
      sub: userId,
      username: account.username,
      role: account.roleId,
      orgType: account.user.orgType,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.authRepository.updateRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  }

  async logout(userId: number) {
    await this.authRepository.updateRefreshToken(
      userId,
      null as any,
    );

    return {
      message: 'Đăng xuất thành công',
    };
  }

  async refresh(userId: number, refreshToken: string) {
    const account = await this.authRepository.findAccountByUserId(userId);

    if (!account || !account.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    // Xác thực refresh token trong DB
    if (!account || account.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn');
    }

    const payload = { sub: account.userId, username: account.username, role: account.role };
    const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    return { accessToken: newAccessToken };
  }

  async getProfile(userId: number) {
    const user = await this.authRepository.findUserById(userId);
    const account = await this.authRepository.findAccountByUserId(userId);

    if (!user || !account) throw new NotFoundException('Người dùng không tồn tại');

    // Loại bỏ password, giữ lại refreshToken và role
    const { password, ...accountData } = account;

    return {
      ...user,
      account: accountData
    };
  }

  async updateProfile(userId: number, updateDto: UpdateProfileDto) {
    const user = await this.authRepository.findUserById(userId);
    const account = await this.authRepository.findAccountByUserId(userId);

    if (!user || !account) {
      throw new NotFoundException('Người dùng hoặc tài khoản không tồn tại');
    }

    if (updateDto.email && updateDto.email !== user.email) {
      const emailExists = await this.authRepository.findUserByEmail(updateDto.email);
      if (emailExists) {
        throw new ConflictException('Email đã được sử dụng bởi người khác');
      }
    }

    const updateData = { ...updateDto };

    if (updateData.dob) {
      let dobDate: Date;

      // Nếu là định dạng DD/MM/YYYY
      if (typeof updateData.dob === 'string' && updateData.dob.includes('/')) {
        const [day, month, year] = updateData.dob.split('/').map(Number);
        dobDate = new Date(year, month - 1, day);
      }
      // Nếu là định dạng YYYY-MM-DD (ISO)
      else {
        dobDate = new Date(updateData.dob);
      }

      if (isNaN(dobDate.getTime())) {
        throw new BadRequestException('Ngày sinh không hợp lệ');
      }
      if (dobDate > new Date()) {
        throw new BadRequestException('Ngày sinh không thể là ngày trong tương lai');
      }

      updateData.dob = dobDate as any;
    }

    const { roleId, ...userFields } = updateDto as any;

    Object.assign(user, userFields);
    await this.authRepository.updateUser(user);

    if (roleId) {
      account.roleId = roleId;
      await this.authRepository.updateAccount(account);
    }

    const updatedAccount = await this.authRepository.findAccountByUserId(userId);

    const { password, ...safeUser } = user as any;

    const { password: accPassword, ...safeAccount } = updatedAccount as any;

    return {
      message: 'Cập nhật thông tin thành công',
      data: {
        ...safeUser,
        account: safeAccount,
      },
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    if (dto.newPass !== dto.confirmPass) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    }
    const account = await this.authRepository.findAccountByUserId(userId);
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
    const user = await this.authRepository.findUserByEmail(forgotDto.email);
    if (!user)
      throw new NotFoundException('Email không tồn tại trong hệ thống');

    const account = await this.authRepository.findAccountByUserId(user.id);
    if (!account) throw new NotFoundException('Tài khoản không tồn tại');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000);

    await this.authRepository.saveOtp(user.id, otp, expiresAt);

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Mã xác thực khôi phục mật khẩu',
        template: 'otp-email',
        context: {
          fullName: user.fullName,
          username: account.username,
          otp: otp,
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
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const otpRecord = await this.authRepository.findOtp(user.id);
    if (
      !otpRecord ||
      otpRecord.otp !== otp ||
      otpRecord.expiresAt < new Date()
    ) {
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    return { message: 'Mã OTP hợp lệ' };
  }

  async verifyOtpAndReset(forgotDto: ForgotPasswordDto) {
    const { email, otp, newPassword, confirmNewPassword } = forgotDto;

    if (!otp) {
      return { message: 'OTP đã được gửi' };
    }

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    }

    const user = await this.authRepository.findUserByEmail(email);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const otpRecord = await this.authRepository.findOtp(user.id);
    if (
      !otpRecord ||
      otpRecord.otp !== otp ||
      otpRecord.expiresAt < new Date()
    ) {
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    const account = await this.authRepository.findAccountByUserId(user.id);
    if (!account) throw new NotFoundException('Không tìm thấy tài khoản');

    account.password = await bcrypt.hash(newPassword!, 10);

    await this.authRepository.updateAccount(account);
    await this.authRepository.deleteOtp(user.id);

    return { message: 'Đặt lại mật khẩu thành công' };
  }

  async requestOtpToCurrentEmail(userId: number) {
    try {
      const user = await this.authRepository.findUserById(userId);
      if (!user) throw new NotFoundException('Người dùng không tồn tại');

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60000);

      await this.authRepository.saveOtp(userId, otp, expiresAt);

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Xác thực thay đổi email',
        template: 'change-email-otp',
        context: { otp },
        attachments: [
          {
            filename: 'logo-VNA.png',
            path: path.join(process.cwd(), 'dist/src/assets/logo-VNA.png'),
            cid: 'vna-logo',
          },
        ],
      });
      return { message: 'Mã OTP đã được gửi tới email hiện tại của bạn' };
    } catch (error) {
      console.error('Lỗi gửi email thay đổi email:', error);
      throw new InternalServerErrorException('Không thể gửi email xác thực');
    }
  }

  async verifyAndChangeEmail(userId: number, dto: ChangeEmailDto) {
    const { newEmail, otp } = dto;

    const otpRecord = await this.authRepository.findOtp(userId);
    if (
      !otpRecord ||
      otpRecord.otp !== otp ||
      otpRecord.expiresAt < new Date()
    ) {
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    const emailExists = await this.authRepository.findUserByEmail(newEmail);
    if (emailExists) {
      throw new ConflictException('Email mới đã được sử dụng bởi người khác');
    }

    await this.authRepository.updateUserEmail(userId, newEmail);
    await this.authRepository.deleteOtp(userId);

    return { message: 'Đổi email thành công' };
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
