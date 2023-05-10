import { CompoundV2EvmModule } from '@app/common/modules/compound-v2-evm/compound-v2-evm.module';
import { Module } from '@nestjs/common';
import { CompoundV2LendingTransactionController } from './controller/compound-v2-lending-transaction.controller';
import { CompoundV2WithdrawTransactionController } from './controller/compound-v2-withdraw-transaction.controller';
import { CompoundV2LendingTransactionService } from './service/compound-v2-lending-transaction.service';
import { CompoundV2WithdrawTransactionService } from './service/compound-v2-withdraw-transaction.service';

@Module({
  imports: [CompoundV2EvmModule],
  controllers: [
    CompoundV2LendingTransactionController,
    CompoundV2WithdrawTransactionController,
  ],
  providers: [
    CompoundV2LendingTransactionService,
    CompoundV2WithdrawTransactionService,
  ],
})
export class CompoundV2ReservesModule {}
