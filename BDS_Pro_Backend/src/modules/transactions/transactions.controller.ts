import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import {
  CreateDealDto,
  CreateDepositPaymentDto,
  CreateTransactionDto,
  EscrowActionDto,
  QueryDealDto,
  UpdateDealStatusDto,
} from './dto/transaction.dto';
import { CurrentUser, Roles } from '@/common/decorators';
import { UserRole } from '@/common/enums';

@ApiTags('Transactions & Deals')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Post('deposit')
  @ApiOperation({ summary: 'Đặt cọc giữ chỗ BĐS trực tuyến (Escrow Payment)' })
  createDeposit(
    @CurrentUser('id') buyerId: string,
    @Body() dto: CreateDepositPaymentDto,
  ) {
    return this.service.createDeposit(buyerId, dto);
  }

  @Post('momo/create')
  @ApiOperation({ summary: 'Khởi tạo thông tin thanh toán & mã QR qua Ví MoMo' })
  createMomoPayment(
    @CurrentUser('id') buyerId: string,
    @Body() dto: CreateDepositPaymentDto,
  ) {
    return this.service.createMomoPayment(buyerId, dto);
  }

  @Post('deals')
  @ApiOperation({ summary: 'Tạo thương vụ mới' })
  createDeal(@CurrentUser('id') buyerId: string, @Body() dto: CreateDealDto) {
    return this.service.createDeal(buyerId, dto);
  }

  @Get('deals')
  @ApiOperation({ summary: 'Danh sách thương vụ của tôi' })
  findDeals(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Query() dto: QueryDealDto,
  ) {
    return this.service.findDeals(userId, dto, role);
  }

  @Patch('deals/:id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái thương vụ' })
  updateDealStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdateDealStatusDto,
  ) {
    return this.service.updateDealStatus(id, userId, dto, role);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Tạo giao dịch thanh toán (đặt cọc / phí)' })
  createPayment(@CurrentUser('id') buyerId: string, @Body() dto: CreateTransactionDto) {
    return this.service.createTransaction(buyerId, dto);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Lịch sử giao dịch thanh toán của tôi' })
  findPayments(@CurrentUser('id') userId: string) {
    return this.service.findTransactions(userId);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Giám sát toàn bộ giao dịch đặt cọc & thanh toán sàn' })
  findAllAdminTransactions() {
    return this.service.findAllAdminTransactions();
  }

  @Patch('admin/:id/escrow-action')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Xử lý ký quỹ Escrow (giải ngân cho môi giới hoặc hoàn cọc)' })
  handleEscrowAction(
    @Param('id') id: string,
    @Body() dto: EscrowActionDto,
  ) {
    return this.service.handleEscrowAction(id, dto);
  }
}
