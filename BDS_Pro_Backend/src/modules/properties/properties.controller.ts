import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { FavoritesService } from './favorites.service';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  SearchPropertyDto,
  ModeratePropertyDto,
  NearbyQueryDto,
} from './dto/property.dto';
import { Public, Roles, CurrentUser } from '../../common/decorators';
import { UserRole, PropertyStatus } from '../../common/enums';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poi } from './entities/poi.entity';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly service: PropertiesService,
    private readonly favoritesService: FavoritesService,
    @InjectRepository(Poi)
    private readonly poiRepo: Repository<Poi>,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Danh sách / tìm kiếm tin đăng (public)' })
  search(@Query() dto: SearchPropertyDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.findAll(dto, userId);
  }

  @Public()
  @Get('map')
  @ApiOperation({ summary: 'Tìm kiếm theo bản đồ / bán kính' })
  searchMap(@Query() dto: NearbyQueryDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.nearby(dto, userId);
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Tin nổi bật cho trang chủ' })
  featured(@Query('limit') limit?: string) {
    const lim = limit ? parseInt(limit, 10) : 8;
    return this.service.findAll({ limit: lim, sort: 'popular' } as any);
  }

  @ApiBearerAuth()
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @Get('mine')
  @ApiOperation({ summary: 'Tin đăng của môi giới hiện tại' })
  mine(@CurrentUser('id') userId: string, @Query() dto: SearchPropertyDto) {
    return this.service.findMine(userId, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get('pending')
  @ApiOperation({ summary: 'Tin chờ kiểm duyệt (admin)' })
  pending(@Query() dto: SearchPropertyDto) {
    return this.service.findAll(
      Object.assign(new SearchPropertyDto(), dto, { status: PropertyStatus.PENDING }),
      undefined,
      false,
    );
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết tin đăng' })
  findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.view(id, userId);
  }

  @Public()
  @Get(':id/pois')
  @ApiOperation({ summary: 'Danh sách tiện ích lân cận (POI) của một tin đăng' })
  async pois(@Param('id') id: string) {
    const property = await this.service.getEntity(id);
    // Lấy POI trong bán kính 3km quanh BĐS
    const radius = 3000;
    const rows = await this.poiRepo
      .createQueryBuilder('poi')
      .addSelect(
        'ST_Distance_Sphere(POINT(poi.longitude, poi.latitude), POINT(:lng, :lat))',
        'distance',
      )
      .where(
        'ST_Distance_Sphere(POINT(poi.longitude, poi.latitude), POINT(:lng, :lat)) <= :radius',
      )
      .setParameters({
        lng: Number(property.longitude),
        lat: Number(property.latitude),
        radius,
      })
      .orderBy('distance', 'ASC')
      .limit(20)
      .getRawAndEntities();

    return rows.entities.map((poi, i) => ({
      id: poi.id,
      name: poi.name,
      category: poi.category,
      rating: poi.rating,
      latitude: Number(poi.latitude),
      longitude: Number(poi.longitude),
      distance: Math.round(Number(rows.raw[i].distance)),
    }));
  }

  @ApiBearerAuth()
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Tạo tin đăng mới (wizard)' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreatePropertyDto) {
    return this.service.create(userId, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật tin đăng' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.service.update(id, user.id, user.role, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @Post(':id/submit')
  @ApiOperation({ summary: 'Gửi tin đi kiểm duyệt' })
  submit(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.submit(id, user.id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post(':id/moderate')
  @ApiOperation({ summary: 'Duyệt / từ chối tin (admin)' })
  moderate(
    @Param('id') id: string,
    @CurrentUser('id') _adminId: string,
    @Body() dto: ModeratePropertyDto,
  ) {
    return this.service.setStatus(id, dto.status, dto.reason);
  }

  @ApiBearerAuth()
  @Post(':id/favorite')
  @ApiOperation({ summary: 'Bật/tắt yêu thích tin đăng' })
  toggleFavorite(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.favoritesService.toggle(userId, id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tin đăng' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user.id, user.role);
  }
}
