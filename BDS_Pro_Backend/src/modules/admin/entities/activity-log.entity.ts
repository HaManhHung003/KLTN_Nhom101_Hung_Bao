import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

/** Nhật ký hoạt động hệ thống, phục vụ trang Audit Log của admin. */
@Entity('activity_logs')
@Index(['createdAt'])
export class ActivityLog extends BaseEntity {
  @Column({ name: 'actor_id', type: 'varchar', nullable: true })
  actorId: string | null;

  @Column({ name: 'actor_name', type: 'varchar', length: 150, nullable: true })
  actorName: string | null;

  /** Ví dụ: listing.approve, user.ban, auth.login */
  @Column({ length: 100 })
  action: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  detail: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip: string | null;
}
