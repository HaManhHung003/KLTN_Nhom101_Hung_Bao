import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { Report } from './entities/report.entity';
import { CreateReportDto, ModerateReportDto, QueryLogDto } from './dto/admin.dto';
import { paginate, PaginationDto } from '@/common/dto/pagination.dto';
import { Property } from '../properties/entities/property.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly logRepo: Repository<ActivityLog>,
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Reports
  async createReport(reporterId: string, dto: CreateReportDto) {
    const report = this.reportRepo.create({
      ...dto,
      reporterId,
    });
    return this.reportRepo.save(report);
  }

  async findReports(dto: PaginationDto) {
    const qb = this.reportRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.reporter', 'reporter')
      .leftJoinAndSelect('r.property', 'property')
      .orderBy('r.createdAt', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [items, total] = await qb.getManyAndCount();
    return paginate(items, total, dto);
  }

  async moderateReport(id: string, dto: ModerateReportDto) {
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Không tìm thấy báo cáo');
    report.status = dto.status;
    return this.reportRepo.save(report);
  }

  // Logs
  async logActivity(actorId: string, actorName: string, action: string, detail?: string, ip?: string) {
    const log = this.logRepo.create({ actorId, actorName, action, detail, ip });
    return this.logRepo.save(log);
  }

  async findLogs(dto: QueryLogDto) {
    const qb = this.logRepo.createQueryBuilder('l');
    if (dto.action) {
      qb.andWhere('l.action = :action', { action: dto.action });
    }
    qb.orderBy('l.createdAt', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [items, total] = await qb.getManyAndCount();
    return paginate(items, total, dto);
  }

  // Dashboard Stats
  async getDashboardMetrics() {
    const [totalUsers, totalProperties, pendingProperties, totalReports] = await Promise.all([
      this.userRepo.count(),
      this.propertyRepo.count(),
      this.propertyRepo.count({ where: { status: 'pending' as any } }),
      this.reportRepo.count(),
    ]);

    return {
      totalUsers,
      totalProperties,
      pendingProperties,
      totalReports,
    };
  }
}
