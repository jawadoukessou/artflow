import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { CustomersModule } from './customers/customers.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { CollectionsModule } from './collections/collections.module';
import { DisputesModule } from './disputes/disputes.module';
import { TasksModule } from './tasks/tasks.module';
import { CommunicationsModule } from './communications/communications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ErpModule } from './erp/erp.module';
import { RiskModule } from './risk/risk.module';
import { AiModule } from './ai/ai.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [{
        ttl: config.get<number>('THROTTLE_TTL', 60),
        limit: config.get<number>('THROTTLE_LIMIT', 100),
      }],
    }),

    // Events
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),

    // Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: { host: 'localhost', port: 6379 },
      }),
    }),

    // Core
    PrismaModule,

    // Features
    AuthModule,
    UsersModule,
    CompaniesModule,
    CustomersModule,
    InvoicesModule,
    PaymentsModule,
    CollectionsModule,
    DisputesModule,
    TasksModule,
    CommunicationsModule,
    AnalyticsModule,
    ErpModule,
    RiskModule,
    AiModule,
    WorkflowsModule,
    AdminModule,
  ],
})
export class AppModule {}
