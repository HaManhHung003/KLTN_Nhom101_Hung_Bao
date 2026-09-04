import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Property } from './property.entity';

/** Tin BĐS được người dùng lưu (yêu thích). Mỗi cặp user-property là duy nhất. */
@Entity('favorites')
@Index(['userId', 'propertyId'], { unique: true })
export class Favorite extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'property_id' })
  propertyId: string;

  @ManyToOne(() => User, (u) => u.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Property, (p) => p.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;
}
