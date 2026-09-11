import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { UserRole } from '@/common/enums';
import { Property } from '@/modules/properties/entities/property.entity';
import { Favorite } from '@/modules/properties/entities/favorite.entity';
import { Appointment } from '@/modules/appointments/entities/appointment.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ length: 150 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 191 })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  /** Băm bằng bcrypt, luôn bị loại khỏi response qua ClassSerializer/mapper. */
  @Column({ name: 'password_hash', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.BUYER })
  role: UserRole;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string | null;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: true, nullable: true })
  active: boolean;

  /** Refresh token đã băm, phục vụ xoay vòng token / logout. */
  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 255, nullable: true, select: false })
  refreshTokenHash: string | null;

  @OneToMany(() => Property, (p) => p.owner)
  properties: Property[];

  @OneToMany(() => Favorite, (f) => f.user)
  favorites: Favorite[];

  @OneToMany(() => Appointment, (a) => a.buyer)
  appointments: Appointment[];
}
