import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { DealStatus, TransactionType } from '@/common/enums';
import { Property } from '@/modules/properties/entities/property.entity';
import { User } from '@/modules/users/entities/user.entity';

/** Thương vụ BĐS đã thuê/mua/bán, theo dõi trạng thái từ cọc đến hoàn tất. */
@Entity('deals')
@Index(['buyerId'])
@Index(['agentId'])
export class Deal extends BaseEntity {
  @Column({ name: 'property_id' })
  propertyId: string;

  @Column({ name: 'transaction_type', type: 'enum', enum: TransactionType })
  transactionType: TransactionType;

  @Column({ name: 'deal_status', type: 'enum', enum: DealStatus, default: DealStatus.DEPOSIT_PAID })
  dealStatus: DealStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  price: number;

  @Column({ name: 'deposit_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  depositAmount: number;

  @Column({ name: 'buyer_id' })
  buyerId: string;

  @Column({ name: 'agent_id' })
  agentId: string;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date | null;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agent_id' })
  agent: User;
}
