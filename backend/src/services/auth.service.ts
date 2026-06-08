import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { AuthRepository } from '../repositories/auth.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import path from 'path';
import { ChangeEmailDto } from '../dto/change-email.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) { }

  async register(registerDto: RegisterDto) {
    const { username, password, fullName, email, role } = registerDto;
    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email đã được đăng ký, vui lòng sử dụng email khác.');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      return await this.authRepository.createFullUser(
        { fullName, email },
        { username, password: hashedPassword, role }
      );
    } catch (error) {
      console.error("Lỗi khi lưu user vào database:", error);
      throw new InternalServerErrorException('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const account = await this.authRepository.findAccountByUsername(username);

    if (!account || !(await bcrypt.compare(password, account.password))) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng. Xin vui lòng thử lại');
    }

    const payload = { sub: account.userId, username: account.username, role: account.role };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async getProfile(userId: number) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    return user;
  }

  async updateProfile(userId: number, updateDto: UpdateProfileDto) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    Object.assign(user, updateDto);
    return await this.authRepository.updateUser(user);
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
    account.password = await bcrypt.hash(dto.newPass, 10);
    await this.authRepository.updateAccount(account);
    return {
      message: 'Đổi mật khẩu thành công'
    };
  }

  async requestPasswordReset(forgotDto: ForgotPasswordDto) {
    const user = await this.authRepository.findUserByEmail(forgotDto.email);
    if (!user) throw new NotFoundException('Email không tồn tại trong hệ thống');

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
        attachments: [{
          filename: 'logo-VNA.png',
          path: path.join(process.cwd(), 'dist/src/assets/logo-VNA.png'), // Đường dẫn tuyệt đối tới file
          cid: 'vna-logo' // ID này phải trùng với src trong HTML
        }],
      });
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      throw new InternalServerErrorException('Không thể gửi email xác thực, vui lòng kiểm tra lại cấu hình hệ thống');
    }

    return { message: 'Mã OTP đã được gửi đến email của bạn' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const otpRecord = await this.authRepository.findOtp(user.id);
    if (!otpRecord || otpRecord.otp !== otp || otpRecord.expiresAt < new Date()) {
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
    if (!otpRecord || otpRecord.otp !== otp || otpRecord.expiresAt < new Date()) {
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
      attachments: [{
        filename: 'logo-VNA.png',
        path: path.join(process.cwd(), 'dist/src/assets/logo-VNA.png'),
        cid: 'vna-logo'
      }],
    });
    return { message: 'Mã OTP đã được gửi tới email hiện tại của bạn' };
  } catch(error) {
    console.error('Lỗi gửi email thay đổi email:', error);
    throw new InternalServerErrorException('Không thể gửi email xác thực');
  }

  async verifyAndChangeEmail(userId: number, dto: ChangeEmailDto) {
    const { newEmail, otp } = dto;

    const otpRecord = await this.authRepository.findOtp(userId);
    if (!otpRecord || otpRecord.otp !== otp || otpRecord.expiresAt < new Date()) {
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
}