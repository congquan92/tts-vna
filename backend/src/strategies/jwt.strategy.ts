import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Lấy token từ Header 
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || '', // Phải khớp với key trong AppModule
    });
  }

  // Hàm này tự động chạy sau khi token được giải mã thành công
  async validate(payload: any) {
    return {
      id: payload.sub,
      username: payload.username,
      roleId: payload.roleId,
      orgType: payload.orgType,
      userId: payload.userId ?? null,
      businessId: payload.businessId ?? null,
      accountType: payload.accountType, // USER | BUSINESS
      displayName: payload.displayName,
    };
  }
}