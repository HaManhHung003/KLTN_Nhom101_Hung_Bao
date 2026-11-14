import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DealStatus, PaymentMethod, PaymentStatus, TransactionType } from '@/common/enums';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class CreateDealDto {
  @ApiProperty({ description: 'ID tin đăng' })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ description: 'ID môi giới' })
  @IsString()
  @IsNotEmpty()
  agentId: string;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  transactionType: TransactionType;

  @ApiProperty({ example: 2500000000, description: 'Giá chốt giao dịch' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 50000000, description: 'Số tiền đặt cọc' })
  @IsNumber()
  @Min(0)
  depositAmount: number;
}

export class UpdateDealStatusDto {
  @ApiProperty({ enum: DealStatus })
  @IsEnum(DealStatus)
  @IsNotEmpty()
  dealStatus: DealStatus;
}

export class CreateTransactionDto {
  @ApiProperty({ description: 'ID tin đăng' })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiPropertyOptional({ description: 'ID môi giới' })
  @IsString()
  @IsOptional()
  agentId?: string;

  @ApiProperty({ example: 50000000 })
  @IsNumber()
  @Min(1000)
  amount: number;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.VNPAY })
  @IsEnum(PaymentMethod)
  @IsOptional()
  method?: PaymentMethod;
}

export class CreateDepositPaymentDto {
  @ApiProperty({ description: 'ID tin đăng BĐS' })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiPropertyOptional({ description: 'ID môi giới / chủ nhà' })
  @IsString()
  @IsOptional()
  agentId?: string;

  @ApiProperty({ example: 50000000, description: 'Số tiền đặt cọc giữ chỗ (VNĐ)' })
  @IsNumber()
  @Min(1000)
  amount: number;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.BANK })
  @IsEnum(PaymentMethod)
  @IsOptional()
  method?: PaymentMethod;

  @ApiPropertyOptional({ description: 'Họ tên người đặt cọc' })
  @IsString()
  @IsOptional()
  buyerName?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại người đặt cọc' })
  @IsString()
  @IsOptional()
  buyerPhone?: string;

  @ApiPropertyOptional({ description: 'Ghi chú / Thỏa thuận cọc' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class EscrowActionDto {
  @ApiProperty({ enum: ['payout', 'refund'], description: 'Hành động: payout (giải ngân cho môi giới) hoặc refund (hoàn cọc cho khách)' })
  @IsString()
  @IsNotEmpty()
  action: 'payout' | 'refund';

  @ApiPropertyOptional({ description: 'Lý do xử lý' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class QueryDealDto extends PaginationDto {
  @ApiPropertyOptional({ enum: DealStatus })
  @IsEnum(DealStatus)
  @IsOptional()
  status?: DealStatus;
}
