import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { PoiCategory } from '@/common/enums';

/** Điểm tiện ích lân cận (trường học, bệnh viện, siêu thị) để hiển thị quanh BĐS. */
@Entity('points_of_interest')
@Index(['category'])
export class PointOfInterest extends BaseEntity {
  @Column({ length: 200 })
  name: string;

  @Column({ type: 'enum', enum: PoiCategory })
  category: PoiCategory;

  @Column({ type: 'double', default: 0 })
  latitude: number;

  @Column({ type: 'double', default: 0 })
  longitude: number;

  @Column({ type: 'float', nullable: true })
  rating: number;
}

export type Poi = PointOfInterest;
export const Poi = PointOfInterest;
