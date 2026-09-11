import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateDealDto, CreateTransactionDto, QueryDealDto, UpdateDealStatusDto } from './dto/transaction.dto';
import { CurrentUser } from '@/common/decorators';

@ApiTags('Transactions & Deals')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Post('deals')
  @ApiOperation({ summary: 'Tạo thương vụ mới' })
  createDeal(@CurrentUser('id') buyerId: string, @Body() dto: CreateDealDto) {
    return this.service.createDeal(buyerId, dto);
  }

  @Get('deals')
  @ApiOperation({ summary: 'Danh sách thương vụ của tôi' })
  findDeals(@CurrentUser('id') userId: string, @Query() dto: QueryDealDto) {
    return this.service.findDeals(userId, dto);
  }

  @Patch('deals/:id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái thương vụ' })
  updateDealStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateDealStatusDto,
  ) {
    return this.service.updateDealStatus(id, userId, dto);
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
}
