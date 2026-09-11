import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ListingStatus, UserRole } from '@/common/enums';
import { buildPagination } from '@/common/dto/pagination.dto';
import { Property } from './entities/property.entity';
import { Media } from './entities/media.entity';
import { Favorite } from './entities/favorite.entity';
import {
  CreatePropertyDto,
  NearbyQueryDto,
  QueryPropertiesDto,
  UpdatePropertyDto,
} from './dto/property.dto';
import { toPublicProperty } from './property.mapper';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly repo: Repository<Property>,
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    @InjectRepository(Favorite)
    private readonly favRepo: Repository<Favorite>,
  ) {}

  /** Tập id tin mà user đã lưu, dùng để gắn cờ isFavorited. */
  private async favoritedIds(userId: string | undefined, propertyIds: string[]) {
    if (!userId || propertyIds.length === 0) return new Set<string>();
    const favs = await this.favRepo.find({
      where: { userId, propertyId: In(propertyIds) },
    });
    return new Set(favs.map((f) => f.propertyId));
  }

  async create(ownerId: string, dto: CreatePropertyDto) {
    const { images, asDraft, ...rest } = dto;
    const property = this.repo.create({
      ...rest,
      ownerId,
      status: asDraft ? ListingStatus.DRAFT : ListingStatus.PENDING,
      // Điểm AI giả lập dựa trên độ đầy đủ thông tin (0-100)
      aiScore: this.computeAiScore(dto),
    });
    const saved = await this.repo.save(property);

    if (images?.length) {
      await this.mediaRepo.save(
        images.map((url, i) =>
          this.mediaRepo.create({ url, propertyId: saved.id, sortOrder: i }),
        ),
      );
    }
    return this.findOne(saved.id);
  }

  private computeAiScore(dto: Partial<CreatePropertyDto>): number {
    let score = 50;
    if (dto.images?.length) score += Math.min(20, dto.images.length * 4);
    if (dto.description && dto.description.length > 120) score += 10;
    if (dto.amenities?.length) score += Math.min(10, dto.amenities.length * 2);
    if (dto.bedrooms && dto.bathrooms) score += 5;
    if (dto.latitude && dto.longitude) score += 5;
    return Math.min(100, score);
  }

  private applyFilters(qb: any, query: QueryPropertiesDto) {
    if (query.type) qb.andWhere('p.type = :type', { type: query.type });
    if (query.transactionType)
      qb.andWhere('p.transactionType = :tt', { tt: query.transactionType });
    if (query.status) qb.andWhere('p.status = :status', { status: query.status });
    if (query.city) qb.andWhere('p.city LIKE :city', { city: `%${query.city}%` });
    if (query.district)
      qb.andWhere('p.district LIKE :district', { district: `%${query.district}%` });
    if (query.minPrice != null)
      qb.andWhere('p.price >= :minPrice', { minPrice: query.minPrice });
    if (query.maxPrice != null)
      qb.andWhere('p.price <= :maxPrice', { maxPrice: query.maxPrice });
    if (query.minArea != null)
      qb.andWhere('p.area >= :minArea', { minArea: query.minArea });
    if (query.maxArea != null)
      qb.andWhere('p.area <= :maxArea', { maxArea: query.maxArea });
    if (query.bedrooms != null)
      qb.andWhere('p.bedrooms >= :bedrooms', { bedrooms: query.bedrooms });
    if (query.q)
      qb.andWhere('(p.title LIKE :q OR p.address LIKE :q OR p.description LIKE :q)', {
        q: `%${query.q}%`,
      });

    switch (query.sort) {
      case 'price_asc':
        qb.orderBy('p.price', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('p.price', 'DESC');
        break;
      case 'area_desc':
        qb.orderBy('p.area', 'DESC');
        break;
      case 'popular':
        qb.orderBy('p.viewCount', 'DESC');
        break;
      default:
        qb.orderBy('p.createdAt', 'DESC');
    }
  }

  /** Danh sách công khai (chỉ tin active), có lọc + phân trang. */
  async findAll(query: QueryPropertiesDto, userId?: string, publicOnly = true) {
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.owner', 'owner')
      .leftJoinAndSelect('p.media', 'media');

    if (publicOnly && !query.status) {
      qb.andWhere('p.status = :active', { active: ListingStatus.ACTIVE });
    }
    this.applyFilters(qb, query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    qb.skip((page - 1) * limit).take(limit);

    const [rows, total] = await qb.getManyAndCount();
    const favSet = await this.favoritedIds(
      userId,
      rows.map((r) => r.id),
    );
    return buildPagination(
      rows.map((r) => toPublicProperty(r, { isFavorited: favSet.has(r.id) })),
      total,
      page,
      limit,
    );
  }

  /** Tin của môi giới đang đăng nhập (mọi trạng thái). */
  async findMine(ownerId: string, query: QueryPropertiesDto) {
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.owner', 'owner')
      .leftJoinAndSelect('p.media', 'media')
      .where('p.owner_id = :ownerId', { ownerId });
    this.applyFilters(qb, query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    qb.skip((page - 1) * limit).take(limit);
    const [rows, total] = await qb.getManyAndCount();
    return buildPagination(
      rows.map((r) => toPublicProperty(r)),
      total,
      page,
      limit,
    );
  }

  async getEntity(id: string) {
    const property = await this.repo.findOne({
      where: { id },
      relations: ['owner', 'media'],
    });
    if (!property) throw new NotFoundException('Không tìm thấy tin đăng');
    return property;
  }

  async findOne(id: string, userId?: string) {
    const property = await this.getEntity(id);
    const favSet = await this.favoritedIds(userId, [id]);
    return toPublicProperty(property, { isFavorited: favSet.has(id) });
  }

  /** Xem chi tiết + tăng lượt xem. */
  async view(id: string, userId?: string) {
    await this.repo.increment({ id }, 'viewCount', 1);
    return this.findOne(id, userId);
  }

  async update(id: string, userId: string, role: UserRole, dto: UpdatePropertyDto) {
    const property = await this.getEntity(id);
    if (property.ownerId !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền sửa tin này');
    }
    const { images, asDraft, ...rest } = dto;
    Object.assign(property, rest);
    if (asDraft !== undefined && property.status === ListingStatus.DRAFT) {
      property.status = asDraft ? ListingStatus.DRAFT : ListingStatus.PENDING;
    }
    await this.repo.save(property);

    if (images) {
      await this.mediaRepo.delete({ propertyId: id });
      if (images.length) {
        await this.mediaRepo.save(
          images.map((url, i) =>
            this.mediaRepo.create({ url, propertyId: id, sortOrder: i }),
          ),
        );
      }
    }
    return this.findOne(id);
  }

  async remove(id: string, userId: string, role: UserRole) {
    const property = await this.getEntity(id);
    if (property.ownerId !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền xoá tin này');
    }
    await this.repo.delete({ id });
    return { deleted: true };
  }

  /** Gửi tin nháp đi duyệt. */
  async submit(id: string, userId: string) {
    const property = await this.getEntity(id);
    if (property.ownerId !== userId) throw new ForbiddenException();
    property.status = ListingStatus.PENDING;
    await this.repo.save(property);
    return this.findOne(id);
  }

  // ===== Kiểm duyệt (admin) =====
  async setStatus(id: string, status: ListingStatus, reason?: string) {
    const property = await this.getEntity(id);
    property.status = status;
    property.rejectReason = status === ListingStatus.REJECTED ? reason ?? '' : null;
    await this.repo.save(property);
    return this.findOne(id);
  }

  /**
   * Tìm kiếm theo bán kính dùng hàm không gian MySQL ST_Distance_Sphere.
   * Trả về tin active trong bán kính, kèm khoảng cách (m).
   */
  async nearby(query: NearbyQueryDto, userId?: string) {
    const radiusMeters = (query.radius ?? 5) * 1000;
    const rows = await this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.owner', 'owner')
      .leftJoinAndSelect('p.media', 'media')
      .addSelect(
        'ST_Distance_Sphere(POINT(p.longitude, p.latitude), POINT(:lng, :lat))',
        'distance',
      )
      .where('p.status = :active', { active: ListingStatus.ACTIVE })
      .andWhere(
        'ST_Distance_Sphere(POINT(p.longitude, p.latitude), POINT(:lng, :lat)) <= :radius',
      )
      .setParameters({ lng: query.lng, lat: query.lat, radius: radiusMeters })
      .orderBy('distance', 'ASC')
      .limit(query.limit ?? 50)
      .getMany();

    const favSet = await this.favoritedIds(userId, rows.map((r) => r.id));
    return rows.map((r) => toPublicProperty(r, { isFavorited: favSet.has(r.id) }));
  }
}
