import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import {
  LegalStatus,
  ListingStatus,
  PropertyType,
  TransactionType,
} from '@/common/enums';
import { User } from '@/modules/users/entities/user.entity';
import { Media } from './media.entity';
import { Favorite } from './favorite.entity';

@Entity('properties')
@Index(['status', 'transactionType'])
@Index(['city', 'district'])
@Index(['type'])
export class Property extends BaseEntity {
  @Column({ length: 255 })
  title: string;

  @Column({ type: 'enum', enum: PropertyType })
  type: PropertyType;

  @Column({ name: 'transaction_type', type: 'enum', enum: TransactionType })
  transactionType: TransactionType;

  /** Giá bán, hoặc giá thuê/tháng (VND). */
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  price: number;

  /** Diện tích m². */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  area: number;

  @Column({ name: 'legal_status', type: 'enum', enum: LegalStatus, default: LegalStatus.CHO_SO })
  legalStatus: LegalStatus;

  @Column({ length: 500 })
  address: string;

  @Column({ length: 120 })
  district: string;

  @Column({ length: 120 })
  city: string;

  @Column({ type: 'double', default: 0 })
  latitude: number;

  @Column({ type: 'double', default: 0 })
  longitude: number;

  /** Danh sách tiện ích, lưu JSON. */
  @Column({ type: 'json', nullable: true })
  amenities: string[];

  @Column({ type: 'enum', enum: ListingStatus, default: ListingStatus.PENDING })
  status: ListingStatus;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'favorite_count', default: 0 })
  favoriteCount: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  bedrooms: number;

  @Column({ nullable: true })
  bathrooms: number;

  /** Điểm chất lượng/tin cậy do AI/hệ thống chấm (0-100). */
  @Column({ name: 'ai_score', type: 'int', nullable: true })
  aiScore: number;

  /** Lý do từ chối khi kiểm duyệt (nếu status = rejected). */
  @Column({ name: 'reject_reason', type: 'varchar', length: 500, nullable: true })
  rejectReason: string | null;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, (u) => u.properties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Media, (m) => m.property, { cascade: true })
  media: Media[];

  @OneToMany(() => Favorite, (f) => f.property)
  favorites: Favorite[];
}
