import { DataPlatformCoinModule } from '@app/common/modules/data-platform-coin/data.platform-coin.module';
import { DataTransactionModule } from '@app/common/modules/data-transaction/data.transaction.module';
import { UserTriggerModule } from '@app/common/modules/user-trigger/user-trigger.module';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WalletModule } from '../wallet/wallet.module';
import { TransactionController } from './controllers/transaction.controller';
import { TransactionAssetSetService } from './services/transaction-asset-set.service';
import { TransactionEventsSetService } from './services/transaction-events-set.service';
import { TransactionService } from './services/transaction.service';
import { RmqModule } from '@app/common/modules/rmq/rmq.module';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { RmqService } from '@app/common/modules/rmq/rmq.service';
import { RmqTransportModule } from '@app/common/modules/rmq-transport/rmq-transport.module';

@Module({
  imports: [
    UserTriggerModule,
    DataTransactionModule,
    DataPlatformCoinModule,
    RmqTransportModule,
    RmqModule.register({
      name: RMQ_SERVICES_NAMES.MS_TRANSACTION,
    }),
    forwardRef(() => WalletModule),
    forwardRef(() => JwtModule),
  ],
  controllers: [TransactionController],
  providers: [
    RmqService,
    TransactionService,
    TransactionEventsSetService,
    TransactionAssetSetService,
  ],
})
export class TransactionModule {}
