import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus } from '@/common/enums';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class CreateReportDto {
  @ApiProperty({ description: 'ID tin đăng vi phạm' })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ description: 'Lý do báo cáo' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ModerateReportDto {
  @ApiProperty({ enum: ReportStatus })
  @IsEnum(ReportStatus)
  @IsNotEmpty()
  status: ReportStatus;
}

export class QueryLogDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Hành động cần lọc (ví dụ: auth.login, listing.approve)' })
  @IsString()
  @IsOptional()
  action?: string;
}
