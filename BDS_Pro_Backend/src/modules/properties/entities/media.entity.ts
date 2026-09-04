import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Property } from './property.entity';

/** Ảnh/video của tin đăng (chuẩn hoá theo ERD: Listing ── Media). */
@Entity('media')
export class Media extends BaseEntity {
  @Column({ length: 1000 })
  url: string;

  @Column({ type: 'varchar', length: 20, default: 'image' })
  type: 'image' | 'video';

  /** Thứ tự hiển thị trong gallery. */
  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'property_id' })
  propertyId: string;

  @ManyToOne(() => Property, (p) => p.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;
}
