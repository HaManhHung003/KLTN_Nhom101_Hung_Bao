import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '@/common/enums';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

/** Người dùng tự cập nhật hồ sơ. */
export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  avatar?: string;
}

/** Admin cập nhật user (khoá/mở, đổi vai trò, xác minh). */
export class AdminUpdateUserDto extends UpdateProfileDto {
  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

/** Bộ lọc danh sách user cho admin. */
export class QueryUsersDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

/** Admin tạo tài khoản (môi giới hoặc khách hàng). */
export class AdminCreateUserDto {
  @ApiProperty({ example: 'Nguyễn Văn Môi Giới' })
  @IsNotEmpty({ message: 'Vui lòng nhập họ và tên' })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 'broker@bdspro.vn' })
  @IsNotEmpty({ message: 'Vui lòng nhập email' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  password: string;

  @ApiPropertyOptional({ example: '0912345678' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.AGENT })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
