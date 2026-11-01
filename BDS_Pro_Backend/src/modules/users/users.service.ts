import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@/common/enums';
import { buildPagination } from '@/common/dto/pagination.dto';
import { User } from './entities/user.entity';
import {
  AdminCreateUserDto,
  AdminUpdateUserDto,
  QueryUsersDto,
  UpdateProfileDto,
} from './dto/user.dto';
import { toPublicUser } from './user.mapper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  /** Lấy entity thô (nội bộ), tuỳ chọn kèm cột nhạy cảm cho auth. */
  async findRaw(
    where: Partial<Pick<User, 'id' | 'email'>>,
    withSecret = false,
  ): Promise<User | null> {
    const qb = this.repo.createQueryBuilder('u');
    if (where.id) qb.where('u.id = :id', { id: where.id });
    if (where.email) qb.where('u.email = :email', { email: where.email });
    if (withSecret) {
      qb.addSelect(['u.passwordHash', 'u.refreshTokenHash']);
    }
    return qb.getOne();
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.repo.findOne({ where: { phone } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async setRefreshTokenHash(userId: string, hash: string | null) {
    try {
      await this.repo.update({ id: userId }, { refreshTokenHash: hash });
    } catch {
      // Ignored if column does not exist in external SQL schema
    }
  }

  async updatePassword(userId: string, passwordHash: string) {
    await this.repo.update({ id: userId }, { passwordHash });
  }

  /** Lưu mã OTP và thời điểm hết hạn vào bảng users. */
  async setOtp(userId: string, otp: string, expiry: Date) {
    await this.repo.update({ id: userId }, { otpCode: otp, otpExpiry: expiry });
  }

  /** Tìm entity user kèm cột OTP (dùng nội bộ trong auth). */
  async findRawWithOtp(
    where: Partial<Pick<User, 'id' | 'email'>>,
  ): Promise<User | null> {
    const qb = this.repo.createQueryBuilder('u');
    if (where.id) qb.where('u.id = :id', { id: where.id });
    if (where.email) qb.where('u.email = :email', { email: where.email });
    qb.addSelect(['u.passwordHash', 'u.refreshTokenHash', 'u.otpCode', 'u.otpExpiry']);
    return qb.getOne();
  }

  /** Kích hoạt tài khoản sau khi xác thực OTP thành công. */
  async activateUser(userId: string, data: Partial<User>) {
    await this.repo.update({ id: userId }, data);
  }

  /** Hồ sơ user hiện tại (public). */
  async getProfile(userId: string) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return toPublicUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.phone) {
      const existingPhone = await this.findByPhone(dto.phone);
      if (existingPhone && existingPhone.id !== userId) {
        throw new ConflictException('Số điện thoại này đã được sử dụng bởi tài khoản khác.');
      }
    }
    await this.repo.update({ id: userId }, dto);
    return this.getProfile(userId);
  }

  // ===== Admin =====
  async findAll(query: QueryUsersDto) {
    const qb = this.repo.createQueryBuilder('u').orderBy('u.createdAt', 'DESC');
    if (query.role) qb.andWhere('u.role = :role', { role: query.role });
    if (query.q) {
      qb.andWhere('(u.name LIKE :q OR u.email LIKE :q OR u.phone LIKE :q)', {
        q: `%${query.q}%`,
      });
    }
    qb.skip(query.skip).take(query.limit);
    const [rows, total] = await qb.getManyAndCount();
    return buildPagination(
      rows.map(toPublicUser),
      total,
      query.page,
      query.limit,
    );
  }

  async adminUpdate(id: string, dto: AdminUpdateUserDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    if (dto.phone && dto.phone !== user.phone) {
      const existingPhone = await this.findByPhone(dto.phone);
      if (existingPhone && existingPhone.id !== id) {
        throw new ConflictException('Số điện thoại này đã được sử dụng bởi tài khoản khác.');
      }
    }
    await this.repo.update({ id }, dto);
    return this.getProfile(id);
  }

  async remove(id: string) {
    const res = await this.repo.delete({ id });
    if (!res.affected) throw new NotFoundException('Không tìm thấy người dùng');
    return { deleted: true };
  }

  /** Admin tạo mới tài khoản (môi giới hoặc khách hàng). */
  async adminCreateUser(dto: AdminCreateUserDto) {
    const existing = await this.findRaw({ email: dto.email });
    if (existing) {
      throw new ConflictException('Email này đã tồn tại trong hệ thống.');
    }
    if (dto.phone) {
      const existingPhone = await this.findByPhone(dto.phone);
      if (existingPhone) {
        throw new ConflictException('Số điện thoại này đã tồn tại trong hệ thống.');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone || null,
      passwordHash,
      role: dto.role || UserRole.AGENT,
      verified: true,
      active: true,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(dto.name)}`,
    });

    const saved = await this.repo.save(user);
    return toPublicUser(saved);
  }

  async countByRole(role: UserRole) {
    return this.repo.count({ where: { role } });
  }

  async count() {
    return this.repo.count();
  }
}
