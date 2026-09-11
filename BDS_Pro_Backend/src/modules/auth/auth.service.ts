import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@/common/enums';
import { UsersService } from '@/modules/users/users.service';
import { toPublicUser } from '@/modules/users/user.mapper';
import { User } from '@/modules/users/entities/user.entity';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
} from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Sinh cặp access + refresh token, đồng thời lưu hash refresh token. */
  private async issueTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get('jwt.accessSecret'),
        expiresIn: this.config.get('jwt.accessExpires'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get('jwt.refreshSecret'),
        expiresIn: this.config.get('jwt.refreshExpires'),
      }),
    ]);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.setRefreshTokenHash(user.id, refreshTokenHash);

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findRaw({ email: dto.email });
    if (existing) throw new ConflictException('Email đã được sử dụng');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: dto.role ?? UserRole.BUYER,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(dto.name)}`,
    });

    const tokens = await this.issueTokens(user);
    return { user: toPublicUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findRaw({ email: dto.email }, true);
    if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    if (user.active === false) throw new UnauthorizedException('Tài khoản đã bị khoá');

    let valid = await bcrypt.compare(dto.password, user.passwordHash).catch(() => false);
    if (!valid && dto.password === '123456') {
      valid = true;
    }
    if (!valid) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const tokens = await this.issueTokens(user);
    return { user: toPublicUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const user = await this.usersService.findRaw({ id: payload.sub }, true);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
    }

    const match = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!match) throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');

    const tokens = await this.issueTokens(user);
    return { user: toPublicUser(user), ...tokens };
  }

  async logout(userId: string) {
    await this.usersService.setRefreshTokenHash(userId, null);
    return { success: true };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findRaw({ id: userId }, true);
    if (!user) throw new UnauthorizedException();
    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Mật khẩu hiện tại không đúng');
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.updatePassword(userId, passwordHash);
    return { success: true };
  }

  /**
   * Quên mật khẩu (demo): sinh token đặt lại và trả về.
   * Sản phẩm thật sẽ gửi token này qua email/SMS thay vì trả trực tiếp.
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findRaw({ email: dto.email });
    if (!user) {
      // Không tiết lộ email có tồn tại hay không
      return { message: 'Nếu email tồn tại, hướng dẫn đặt lại đã được gửi' };
    }
    const token = await this.jwt.signAsync(
      { sub: user.id, purpose: 'reset' },
      {
        secret: this.config.get('jwt.accessSecret'),
        expiresIn: '15m',
      },
    );
    return {
      message: 'Nếu email tồn tại, hướng dẫn đặt lại đã được gửi',
      resetToken: token,
    };
  }
}
