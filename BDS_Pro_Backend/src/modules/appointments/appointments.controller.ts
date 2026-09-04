import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, QueryAppointmentDto, UpdateAppointmentStatusDto } from './dto/appointment.dto';
import { CurrentUser } from '@/common/decorators';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo lịch hẹn xem BĐS' })
  create(@CurrentUser('id') buyerId: string, @Body() dto: CreateAppointmentDto) {
    return this.service.create(buyerId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách lịch hẹn của tôi' })
  findMine(@CurrentUser('id') userId: string, @Query() dto: QueryAppointmentDto) {
    return this.service.findMyAppointments(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết lịch hẹn' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.findOne(id, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái lịch hẹn' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.service.updateStatus(id, userId, dto);
  }
}
