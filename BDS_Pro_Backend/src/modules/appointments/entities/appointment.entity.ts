import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { AppointmentStatus, TourType } from '@/common/enums';
import { User } from '@/modules/users/entities/user.entity';
import { Property } from '@/modules/properties/entities/property.entity';

/** Lịch hẹn xem BĐS giữa khách (buyer) và môi giới (agent). */
@Entity('appointments')
@Index(['agentId', 'status'])
@Index(['buyerId', 'status'])
export class Appointment extends BaseEntity {
  @Column({ name: 'property_id' })
  propertyId: string;

  @Column({ name: 'buyer_id' })
  buyerId: string;

  @Column({ name: 'agent_id' })
  agentId: string;

  /** Ngày hẹn (YYYY-MM-DD). */
  @Column({ name: 'appointment_date', type: 'date' })
  date: string;

  /** Giờ hẹn (HH:mm). */
  @Column({ name: 'appointment_time', type: 'varchar', length: 10 })
  time: string;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.PENDING })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ name: 'tour_type', type: 'enum', enum: TourType, default: TourType.IN_PERSON })
  tourType: TourType;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => User, (u) => u.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agent_id' })
  agent: User;
}
