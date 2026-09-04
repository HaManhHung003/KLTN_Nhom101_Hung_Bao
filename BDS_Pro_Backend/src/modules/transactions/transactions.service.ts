import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from './entities/deal.entity';
import { Transaction } from './entities/transaction.entity';
import { CreateDealDto, CreateTransactionDto, QueryDealDto, UpdateDealStatusDto } from './dto/transaction.dto';
import { paginate } from '@/common/dto/pagination.dto';
import { DealStatus, PaymentStatus } from '@/common/enums';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Deal)
    private readonly dealRepo: Repository<Deal>,
    @InjectRepository(Transaction)
    private readonly transRepo: Repository<Transaction>,
  ) {}

  // Deals
  async createDeal(buyerId: string, dto: CreateDealDto) {
    const deal = this.dealRepo.create({
      ...dto,
      buyerId,
    });
    return this.dealRepo.save(deal);
  }

  async findDeals(userId: string, dto: QueryDealDto) {
    const qb = this.dealRepo
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.property', 'property')
      .leftJoinAndSelect('deal.buyer', 'buyer')
      .leftJoinAndSelect('deal.agent', 'agent')
      .where('(deal.buyerId = :userId OR deal.agentId = :userId)', { userId });

    if (dto.status) {
      qb.andWhere('deal.dealStatus = :status', { status: dto.status });
    }

    qb.orderBy('deal.createdAt', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [items, total] = await qb.getManyAndCount();
    return paginate(items, total, dto);
  }

  async updateDealStatus(id: string, userId: string, dto: UpdateDealStatusDto) {
    const deal = await this.dealRepo.findOne({ where: { id } });
    if (!deal) throw new NotFoundException('Không tìm thấy thương vụ');
    if (deal.buyerId !== userId && deal.agentId !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật');
    }

    deal.dealStatus = dto.dealStatus;
    if (dto.dealStatus === DealStatus.COMPLETED) {
      deal.completedAt = new Date();
    }
    return this.dealRepo.save(deal);
  }

  // Transactions / Payments
  async createTransaction(buyerId: string, dto: CreateTransactionDto) {
    const transaction = this.transRepo.create({
      ...dto,
      buyerId,
      status: PaymentStatus.PENDING,
      receiptId: `REC_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    });
    return this.transRepo.save(transaction);
  }

  async findTransactions(userId: string) {
    return this.transRepo.find({
      where: [{ buyerId: userId }, { agentId: userId }],
      relations: ['property'],
      order: { createdAt: 'DESC' },
    });
  }
}
