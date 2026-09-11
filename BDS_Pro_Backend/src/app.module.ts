import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    // Global Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // Rate Limiting (Throttler)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    // Database (TypeORM MySQL)
    DatabaseModule,
    // Feature Modules
    AuthModule,
    UsersModule,
    PropertiesModule,
    AppointmentsModule,
    TransactionsModule,
    ChatModule,
    NotificationsModule,
    AdminModule,
    UploadModule,
  ],
})
export class AppModule {}
