import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { PaymentMethod, PaymentStatus } from '@/common/enums';
import { Property } from '@/modules/properties/entities/property.entity';
import { User } from '@/modules/users/entities/user.entity';

/** Giao dịch thanh toán (đặt cọc / phí dịch vụ) qua cổng thanh toán. */
@Entity('transactions')
@Index(['status'])
export class Transaction extends BaseEntity {
  @Column({ name: 'property_id' })
  propertyId: string;

  @Column({ name: 'buyer_id' })
  buyerId: string;

  @Column({ name: 'agent_id', type: 'varchar', nullable: true })
  agentId: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.VNPAY })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ name: 'receipt_id', type: 'varchar', length: 100, nullable: true })
  receiptId: string | null;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;
}
