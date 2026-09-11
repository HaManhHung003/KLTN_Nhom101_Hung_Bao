import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Query phân trang dùng chung cho mọi endpoint danh sách.
 * Tối ưu cho cả web (bảng/lưới) lẫn mobile (infinite scroll).
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, description: 'Trang hiện tại (bắt đầu từ 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 12, maximum: 100, description: 'Số bản ghi mỗi trang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 12;

  @ApiPropertyOptional({ description: 'Từ khoá tìm kiếm tự do' })
  @IsOptional()
  @IsString()
  q?: string;

  get skip(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 12);
  }
}

export class PaginationDto extends PaginationQueryDto {}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function buildPagination<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export function paginate<T>(
  data: T[],
  total: number,
  dtoOrPage: { page?: number; limit?: number } | number,
  limitParam?: number,
): PaginatedResult<T> {
  let page = 1;
  let limit = 12;
  if (typeof dtoOrPage === 'number') {
    page = dtoOrPage;
    limit = limitParam ?? 12;
  } else if (dtoOrPage) {
    page = dtoOrPage.page ?? 1;
    limit = dtoOrPage.limit ?? 12;
  }
  return buildPagination(data, total, page, limit);
}

