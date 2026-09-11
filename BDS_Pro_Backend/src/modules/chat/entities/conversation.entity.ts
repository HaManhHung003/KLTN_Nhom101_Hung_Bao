import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Property } from '@/modules/properties/entities/property.entity';
import { Message } from './message.entity';

/**
 * Cuộc hội thoại 1-1 giữa hai người dùng, thường gắn với một tin BĐS.
 * userAId luôn <= userBId (đã sắp xếp) để tránh trùng lặp cặp hội thoại.
 */
@Entity('conversations')
@Index(['userAId', 'userBId', 'propertyId'], { unique: true })
export class Conversation extends BaseEntity {
  @Column({ name: 'user_a_id' })
  userAId: string;

  @Column({ name: 'user_b_id' })
  userBId: string;

  @Column({ name: 'property_id', type: 'varchar', nullable: true })
  propertyId: string | null;

  @Column({ name: 'last_message', type: 'varchar', length: 1000, nullable: true })
  lastMessage: string | null;

  @Column({ name: 'last_message_at', type: 'datetime', nullable: true })
  lastMessageAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_a_id' })
  userA: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_b_id' })
  userB: User;

  @ManyToOne(() => Property, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @OneToMany(() => Message, (m) => m.conversation)
  messages: Message[];
}
