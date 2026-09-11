import { User } from './entities/user.entity';

/** Hình dạng user trả về client, khớp interface User ở frontend web. */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  verified: boolean;
  active: boolean;
  createdAt: string;
}

/** Loại bỏ passwordHash/refreshTokenHash trước khi trả về. */
export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    role: user.role,
    avatar: user.avatar ?? '',
    verified: user.verified,
    active: user.active,
    createdAt: user.createdAt?.toISOString?.() ?? String(user.createdAt),
  };
}
