import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { Favorite } from './entities/favorite.entity';
import { Media } from './entities/media.entity';
import { Poi } from './entities/poi.entity';
import { PropertiesService } from './properties.service';
import { FavoritesService } from './favorites.service';
import { PropertiesController } from './properties.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Property, Favorite, Media, Poi])],
  controllers: [PropertiesController],
  providers: [PropertiesService, FavoritesService],
  exports: [PropertiesService, FavoritesService],
})
export class PropertiesModule {}
