import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser, Roles } from '@/common/decorators';
import { UserRole } from '@/common/enums';
import { UsersService } from './users.service';
import {
  AdminCreateUserDto,
  AdminUpdateUserDto,
  QueryUsersDto,
  UpdateProfileDto,
} from './dto/user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Hồ sơ của chính mình. */
  @Get('me')
  getMe(@CurrentUser() user: AuthUser) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  // ===== Quản trị người dùng (admin) =====
  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin tạo tài khoản mới (Môi giới hoặc Khách hàng)' })
  create(@Body() dto: AdminCreateUserDto) {
    return this.usersService.adminCreateUser(dto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin xem chi tiết hồ sơ một người dùng' })
  findOne(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  adminUpdate(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.usersService.adminUpdate(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
