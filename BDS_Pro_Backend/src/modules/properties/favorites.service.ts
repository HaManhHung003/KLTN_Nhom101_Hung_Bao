import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { Property } from './entities/property.entity';
import { PropertyMapper } from './property.mapper';
import { PaginationDto, paginate } from '../../common/dto/pagination.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favRepo: Repository<Favorite>,
    @InjectRepository(Property)
    private readonly propRepo: Repository<Property>,
  ) {}

  async toggle(userId: string, propertyId: string) {
    const property = await this.propRepo.findOne({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Không tìm thấy tin đăng');

    const existing = await this.favRepo.findOne({
      where: { userId, propertyId },
    });
    if (existing) {
      await this.favRepo.remove(existing);
      return { favorited: false };
    }
    await this.favRepo.save(this.favRepo.create({ userId, propertyId }));
    return { favorited: true };
  }

  async list(userId: string, dto: PaginationDto) {
    const qb = this.favRepo
      .createQueryBuilder('fav')
      .leftJoinAndSelect('fav.property', 'property')
      .leftJoinAndSelect('property.media', 'media')
      .leftJoinAndSelect('property.agent', 'agent')
      .where('fav.userId = :userId', { userId })
      .orderBy('fav.createdAt', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [rows, total] = await qb.getManyAndCount();
    const items = rows
      .filter((r) => r.property)
      .map((r) => PropertyMapper.toDto(r.property, true));
    return paginate(items, total, dto);
  }

  async ids(userId: string): Promise<string[]> {
    const rows = await this.favRepo.find({
      where: { userId },
      select: ['propertyId'],
    });
    return rows.map((r) => r.propertyId);
  }
}
