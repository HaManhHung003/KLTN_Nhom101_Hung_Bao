import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Conversation } from './conversation.entity';

/** Tin nhắn trong một cuộc hội thoại. */
@Entity('messages')
@Index(['conversationId', 'createdAt'])
export class Message extends BaseEntity {
  @Column({ name: 'conversation_id' })
  conversationId: string;

  @Column({ name: 'sender_id' })
  senderId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'read_at', type: 'datetime', nullable: true })
  readAt: Date | null;

  @ManyToOne(() => Conversation, (c) => c.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;
}
