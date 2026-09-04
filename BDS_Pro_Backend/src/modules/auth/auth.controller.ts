import { Body, Controller, Get, Post, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser, Public } from '@/common/decorators';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshDto,
  RegisterDto,
} from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Đăng nhập bằng email + mật khẩu' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cấp lại access token từ refresh token' })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Yêu cầu đặt lại mật khẩu' })
  forgot(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Thông tin phiên đăng nhập hiện tại' })
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  @ApiBearerAuth()
  @Post('change-password')
  @HttpCode(200)
  changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, dto);
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(200)
  logout(@CurrentUser() user: AuthUser) {
    return this.authService.logout(user.id);
  }
}
