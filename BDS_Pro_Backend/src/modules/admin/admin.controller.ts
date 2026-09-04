import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateReportDto, ModerateReportDto, QueryLogDto } from './dto/admin.dto';
import { CurrentUser, Public, Roles } from '@/common/decorators';
import { UserRole } from '@/common/enums';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Admin & Moderation')
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @ApiBearerAuth()
  @Post('reports')
  @ApiOperation({ summary: 'Gửi báo cáo vi phạm tin đăng' })
  createReport(@CurrentUser('id') reporterId: string, @Body() dto: CreateReportDto) {
    return this.service.createReport(reporterId, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get('reports')
  @ApiOperation({ summary: 'Danh sách báo cáo vi phạm (Admin)' })
  findReports(@Query() dto: PaginationDto) {
    return this.service.findReports(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch('reports/:id')
  @ApiOperation({ summary: 'Xử lý báo cáo vi phạm (Admin)' })
  moderateReport(@Param('id') id: string, @Body() dto: ModerateReportDto) {
    return this.service.moderateReport(id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get('logs')
  @ApiOperation({ summary: 'Xem nhật ký hệ thống (Audit Logs)' })
  findLogs(@Query() dto: QueryLogDto) {
    return this.service.findLogs(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get('dashboard/metrics')
  @ApiOperation({ summary: 'Thống kê tổng quan Admin Dashboard' })
  getMetrics() {
    return this.service.getDashboardMetrics();
  }
}
