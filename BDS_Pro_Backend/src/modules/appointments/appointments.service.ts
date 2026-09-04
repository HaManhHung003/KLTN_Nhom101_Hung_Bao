import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto, QueryAppointmentDto, UpdateAppointmentStatusDto } from './dto/appointment.dto';
import { paginate } from '@/common/dto/pagination.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,
  ) {}

  async create(buyerId: string, dto: CreateAppointmentDto) {
    const appointment = this.repo.create({
      ...dto,
      buyerId,
    });
    return this.repo.save(appointment);
  }

  async findMyAppointments(userId: string, dto: QueryAppointmentDto) {
    const qb = this.repo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.property', 'property')
      .leftJoinAndSelect('app.buyer', 'buyer')
      .leftJoinAndSelect('app.agent', 'agent')
      .where('(app.buyerId = :userId OR app.agentId = :userId)', { userId });

    if (dto.status) {
      qb.andWhere('app.status = :status', { status: dto.status });
    }

    qb.orderBy('app.createdAt', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [items, total] = await qb.getManyAndCount();
    return paginate(items, total, dto);
  }

  async findOne(id: string, userId: string) {
    const appointment = await this.repo.findOne({
      where: { id },
      relations: ['property', 'buyer', 'agent'],
    });

    if (!appointment) throw new NotFoundException('Không tìm thấy lịch hẹn');
    if (appointment.buyerId !== userId && appointment.agentId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập lịch hẹn này');
    }

    return appointment;
  }

  async updateStatus(id: string, userId: string, dto: UpdateAppointmentStatusDto) {
    const appointment = await this.findOne(id, userId);
    appointment.status = dto.status;
    return this.repo.save(appointment);
  }
}
