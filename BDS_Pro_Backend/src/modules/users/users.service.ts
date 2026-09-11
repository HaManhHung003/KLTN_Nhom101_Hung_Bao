import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@/common/enums';
import { buildPagination } from '@/common/dto/pagination.dto';
import { User } from './entities/user.entity';
import {
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

  /** Hồ sơ user hiện tại (public). */
  async getProfile(userId: string) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return toPublicUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
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
    await this.repo.update({ id }, dto);
    return this.getProfile(id);
  }

  async remove(id: string) {
    const res = await this.repo.delete({ id });
    if (!res.affected) throw new NotFoundException('Không tìm thấy người dùng');
    return { deleted: true };
  }

  async countByRole(role: UserRole) {
    return this.repo.count({ where: { role } });
  }

  async count() {
    return this.repo.count();
  }
}
