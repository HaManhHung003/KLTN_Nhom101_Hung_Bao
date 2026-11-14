import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from './entities/deal.entity';
import { Transaction } from './entities/transaction.entity';
import { Property } from '@/modules/properties/entities/property.entity';
import {
  CreateDealDto,
  CreateDepositPaymentDto,
  CreateTransactionDto,
  EscrowActionDto,
  QueryDealDto,
  UpdateDealStatusDto,
} from './dto/transaction.dto';
import { paginate } from '@/common/dto/pagination.dto';
import { DealStatus, PaymentMethod, PaymentStatus } from '@/common/enums';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Deal)
    private readonly dealRepo: Repository<Deal>,
    @InjectRepository(Transaction)
    private readonly transRepo: Repository<Transaction>,
    @InjectRepository(Property)
    private readonly propRepo: Repository<Property>,
  ) {}

  /**
   * Tạo giao dịch đặt cọc giữ chỗ qua sàn BDS Pro (Escrow Payment)
   * Tự động sinh biên lai, ghi nhận Transaction và tạo Thương vụ Deal
   */
  async createDeposit(buyerId: string, dto: CreateDepositPaymentDto) {
    const property = await this.propRepo.findOne({
      where: { id: dto.propertyId },
      relations: ['media', 'owner'],
    });
    if (!property) {
      throw new NotFoundException('Không tìm thấy bất động sản để đặt cọc');
    }

    const agentId = dto.agentId || property.ownerId || buyerId;
    const receiptCode = `REC_${Date.now()}_${Math.floor(Math.random() * 900 + 100)}`;

    // 1. Tạo Transaction thanh toán ký quỹ
    const transaction = this.transRepo.create({
      propertyId: property.id,
      buyerId,
      agentId,
      buyerName: dto.buyerName || null,
      buyerPhone: dto.buyerPhone || null,
      amount: dto.amount,
      method: dto.method || PaymentMethod.BANK,
      status: PaymentStatus.COMPLETED, // Xác nhận thanh toán thành công vào tài khoản ký quỹ sàn
      receiptId: receiptCode,
      note: dto.note || `Đặt cọc giữ chỗ căn hộ: ${property.title}`,
    });
    const savedTransaction = await this.transRepo.save(transaction);

    // 2. Tạo hoặc cập nhật Thương vụ (Deal) gắn với BĐS này
    const existingDeal = await this.dealRepo.findOne({
      where: { propertyId: property.id, buyerId },
    });

    let savedDeal: Deal;
    if (existingDeal) {
      existingDeal.dealStatus = DealStatus.DEPOSIT_PAID;
      existingDeal.depositAmount = Number(existingDeal.depositAmount) + Number(dto.amount);
      savedDeal = await this.dealRepo.save(existingDeal);
    } else {
      const deal = this.dealRepo.create({
        propertyId: property.id,
        buyerId,
        agentId,
        transactionType: property.transactionType,
        dealStatus: DealStatus.DEPOSIT_PAID,
        price: property.price,
        depositAmount: dto.amount,
      });
      savedDeal = await this.dealRepo.save(deal);
    }

    return {
      success: true,
      message: 'Đặt cọc giữ chỗ thành công qua tài khoản ký quỹ sàn BDS Pro',
      receiptId: receiptCode,
      transaction: savedTransaction,
      deal: savedDeal,
      property: {
        id: property.id,
        title: property.title,
        price: property.price,
        address: property.address,
        image: property.media?.[0]?.url || null,
      },
    };
  }

  /**
   * Khởi tạo thông tin thanh toán & mã QR đặt cọc Ví điện tử MoMo
   */
  async createMomoPayment(buyerId: string, dto: CreateDepositPaymentDto) {
    const property = await this.propRepo.findOne({ where: { id: dto.propertyId } });
    if (!property) throw new NotFoundException('Không tìm thấy bất động sản');

    const receiverPhone = '0332536815';
    const receiverName = 'Cao Văn Bảo';
    const transferContent = `BDSCOC ${property.id.slice(-6).toUpperCase()}`;
    const momoQrData = `2|99|${receiverPhone}|${receiverName}||0|0|${dto.amount}|${transferContent}|transfer_myqr`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(momoQrData)}`;
    const deepLink = `momo://?action=transfer&phone=${receiverPhone}&amount=${dto.amount}&note=${encodeURIComponent(transferContent)}`;
    const orderId = `MOMO_${Date.now()}_${Math.floor(Math.random() * 900 + 100)}`;

    return {
      success: true,
      orderId,
      receiverPhone,
      receiverName: 'Cao Văn Bảo',
      amount: dto.amount,
      transferContent,
      qrCodeUrl,
      deepLink,
      property: {
        id: property.id,
        title: property.title,
        price: property.price,
      },
    };
  }

  // Deals
  async createDeal(buyerId: string, dto: CreateDealDto) {
    const deal = this.dealRepo.create({
      ...dto,
      buyerId,
    });
    return this.dealRepo.save(deal);
  }

  async findDeals(userId: string, dto: QueryDealDto, role?: string) {
    const qb = this.dealRepo
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.property', 'property')
      .leftJoinAndSelect('property.media', 'media')
      .leftJoinAndSelect('deal.buyer', 'buyer')
      .leftJoinAndSelect('deal.agent', 'agent');

    if (role !== 'admin') {
      qb.where('(deal.buyerId = :userId OR deal.agentId = :userId)', { userId });
    }

    if (dto.status) {
      qb.andWhere('deal.dealStatus = :status', { status: dto.status });
    }

    qb.orderBy('deal.createdAt', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [items, total] = await qb.getManyAndCount();
    return paginate(items, total, dto);
  }

  async updateDealStatus(id: string, userId: string, dto: UpdateDealStatusDto, role?: string) {
    const deal = await this.dealRepo.findOne({ where: { id } });
    if (!deal) throw new NotFoundException('Không tìm thấy thương vụ');
    if (role !== 'admin' && deal.buyerId !== userId && deal.agentId !== userId) {
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
      relations: ['property', 'property.media', 'buyer', 'agent'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllAdminTransactions() {
    return this.transRepo.find({
      relations: ['property', 'property.media', 'buyer', 'agent'],
      order: { createdAt: 'DESC' },
    });
  }

  async handleEscrowAction(transactionId: string, dto: EscrowActionDto) {
    const transaction = await this.transRepo.findOne({
      where: { id: transactionId },
      relations: ['property'],
    });
    if (!transaction) {
      throw new NotFoundException('Không tìm thấy giao dịch');
    }

    if (dto.action === 'payout') {
      transaction.status = PaymentStatus.COMPLETED;
      // Cập nhật deal liên quan nếu có
      await this.dealRepo.update(
        { propertyId: transaction.propertyId, buyerId: transaction.buyerId },
        { dealStatus: DealStatus.COMPLETED, completedAt: new Date() },
      );
    } else if (dto.action === 'refund') {
      transaction.status = PaymentStatus.REFUNDED;
      // Cập nhật deal thành đã hủy/hoàn cọc
      await this.dealRepo.update(
        { propertyId: transaction.propertyId, buyerId: transaction.buyerId },
        { dealStatus: DealStatus.CANCELLED },
      );
    }

    if (dto.reason) {
      transaction.note = `${transaction.note || ''} | Xử lý Escrow: ${dto.reason}`;
    }

    return this.transRepo.save(transaction);
  }
}
