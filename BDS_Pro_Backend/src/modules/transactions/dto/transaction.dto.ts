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

export class QueryDealDto extends PaginationDto {
  @ApiPropertyOptional({ enum: DealStatus })
  @IsEnum(DealStatus)
  @IsOptional()
  status?: DealStatus;
}
