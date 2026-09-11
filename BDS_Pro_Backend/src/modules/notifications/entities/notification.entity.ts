import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { NotificationType } from '@/common/enums';
import { User } from '@/modules/users/entities/user.entity';

/** Thông báo gửi tới một người dùng (kết quả duyệt tin, lịch hẹn, tin nhắn...). */
@Entity('notifications')
@Index(['userId', 'read'])
export class Notification extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: NotificationType, default: NotificationType.INFO })
  type: NotificationType;

  @Column({ default: false })
  read: boolean;

  /** Đường dẫn deep-link (tùy chọn) để client điều hướng khi bấm vào. */
  @Column({ type: 'varchar', length: 500, nullable: true })
  link: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
