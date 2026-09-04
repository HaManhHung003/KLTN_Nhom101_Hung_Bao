import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Envelope thống nhất cho MỌI response thành công:
 *   { success: true, data, meta?, timestamp }
 * Giúp client web & mobile xử lý response theo một chuẩn duy nhất.
 * Nếu service trả về object có khóa `data` + `meta` (dạng phân trang) thì tách ra.
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((payload) => {
        const isPaginated =
          payload &&
          typeof payload === 'object' &&
          'data' in payload &&
          'meta' in payload;

        return {
          success: true as const,
          data: isPaginated ? (payload as any).data : payload,
          ...(isPaginated ? { meta: (payload as any).meta } : {}),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
