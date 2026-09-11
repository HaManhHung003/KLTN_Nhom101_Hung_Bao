import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { ReportStatus } from '@/common/enums';
import { Property } from '@/modules/properties/entities/property.entity';
import { User } from '@/modules/users/entities/user.entity';

/** Báo cáo/tố cáo một tin đăng vi phạm, do người dùng gửi, admin xử lý. */
@Entity('reports')
@Index(['status'])
export class Report extends BaseEntity {
  @Column({ name: 'reporter_id', type: 'varchar', nullable: true })
  reporterId: string | null;

  @Column({ name: 'property_id' })
  propertyId: string;

  @Column({ length: 500 })
  reason: string;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;
}
