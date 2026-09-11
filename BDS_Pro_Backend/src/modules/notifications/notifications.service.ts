import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto, QueryNotificationDto } from './dto/notification.dto';
import { paginate } from '@/common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto) {
    const notif = this.repo.create(dto);
    return this.repo.save(notif);
  }

  async findMyNotifications(userId: string, dto: QueryNotificationDto) {
    const qb = this.repo
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .orderBy('n.createdAt', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [items, total] = await qb.getManyAndCount();
    const unreadCount = await this.repo.count({ where: { userId, read: false } });

    return {
      ...paginate(items, total, dto),
      unreadCount,
    };
  }

  async markAsRead(id: string, userId: string) {
    const notif = await this.repo.findOne({ where: { id, userId } });
    if (!notif) throw new NotFoundException('Không tìm thấy thông báo');
    notif.read = true;
    return this.repo.save(notif);
  }

  async markAllAsRead(userId: string) {
    await this.repo.update({ userId, read: false }, { read: true });
    return { success: true };
  }
}
