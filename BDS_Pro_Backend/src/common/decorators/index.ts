import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { UserRole } from '../enums';

/** Đánh dấu endpoint không cần đăng nhập (bỏ qua JwtAuthGuard toàn cục). */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Giới hạn endpoint theo vai trò. Dùng cùng RolesGuard. */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/** Payload người dùng đã xác thực, gắn vào request bởi JwtStrategy. */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

/** Lấy nhanh user hiện tại trong controller: @CurrentUser() user: AuthUser */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUser;
    return data ? user?.[data] : user;
  },
);
