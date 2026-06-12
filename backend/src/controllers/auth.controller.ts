import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/auth/register.dto';
import { LoginDto } from '../dto/auth/login.dto';
import { ChangePasswordDto } from '../dto/auth/change-password.dto';
import { ForgotPasswordDto } from '../dto/auth/forgot-password.dto';
import { UpdateProfileDto } from '../dto/auth/update-profile.dto';
import { ChangeEmailDto } from '../dto/auth/change-email.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import type { Multer } from 'multer';
import { JwtService } from '@nestjs/jwt';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Authentication & Profile')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly jwtService: JwtService,
  ) { }

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc email đã tồn tại',
  })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập để nhận Token' })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công, trả về Access Token',
  })
  @ApiResponse({ status: 401, description: 'Sai tài khoản hoặc mật khẩu' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Làm mới Access Token bằng Refresh Token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken);
    const userId = payload.sub;

    return await this.authService.refresh(userId, refreshToken);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Gửi yêu cầu khôi phục mật khẩu' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', example: 'admin@gmail.com' } },
    },
  })
  @ApiResponse({ status: 200, description: 'OTP đã được gửi thành công' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.requestPasswordReset(forgotPasswordDto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Xác thực OTP' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string' }, otp: { type: 'string' } },
    },
  })
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    return await this.authService.verifyOtp(body.email, body.otp);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Xác thực OTP và đặt lại mật khẩu mới' })
  @ApiResponse({ status: 200, description: 'Đặt lại mật khẩu thành công' })
  @ApiResponse({ status: 400, description: 'OTP sai hoặc đã hết hạn' })
  async resetPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.verifyOtpAndReset(forgotPasswordDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Lấy thông tin cá nhân của user' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin profile' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  async getProfile(@Req() req: any) {
    return await this.authService.getProfile(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async updateProfile(@Req() req: any, @Body() updateDto: UpdateProfileDto) {
    return await this.authService.updateProfile(req.user.id, updateDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiOperation({ summary: 'Đổi mật khẩu tài khoản' })
  @ApiResponse({ status: 200, description: 'Đổi mật khẩu thành công' })
  @ApiResponse({ status: 401, description: 'Mật khẩu cũ không chính xác' })
  async changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(
      req.user.id,
      changePasswordDto,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('request-change-email')
  @ApiOperation({ summary: 'Gửi OTP tới email hiện tại để xác thực' })
  async requestOtp(@Req() req: any) {
    return await this.authService.requestOtpToCurrentEmail(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('verify-and-change-email')
  @ApiOperation({ summary: 'Xác thực OTP và hoàn tất đổi email' })
  async verifyAndChangeEmail(@Req() req: any, @Body() dto: ChangeEmailDto) {
    return await this.authService.verifyAndChangeEmail(req.user.id, dto);
  }

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật ảnh đại diện' })
  async uploadAvatar(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn ảnh');
    }

    return this.authService.updateUserAvatar(req.user.id, file);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Đăng xuất',
    description: 'Xóa Refresh Token của người dùng hiện tại',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Đăng xuất thành công',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    return this.authService.logout(req.user.id);
  }
}
