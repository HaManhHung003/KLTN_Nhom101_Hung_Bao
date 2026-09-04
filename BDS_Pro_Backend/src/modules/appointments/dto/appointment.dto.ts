import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus, TourType } from '@/common/enums';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'ID tin đăng' })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ description: 'ID môi giới' })
  @IsString()
  @IsNotEmpty()
  agentId: string;

  @ApiProperty({ example: '2026-09-01', description: 'Ngày hẹn' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '09:30', description: 'Giờ hẹn' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiPropertyOptional({ description: 'Ghi chú cho môi giới' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({ enum: TourType, default: TourType.IN_PERSON })
  @IsEnum(TourType)
  @IsOptional()
  tourType?: TourType;
}

export class UpdateAppointmentStatusDto {
  @ApiProperty({ enum: AppointmentStatus })
  @IsEnum(AppointmentStatus)
  @IsNotEmpty()
  status: AppointmentStatus;
}

export class QueryAppointmentDto extends PaginationDto {
  @ApiPropertyOptional({ enum: AppointmentStatus })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;
}
