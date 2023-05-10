import { AaveV3EvmModule } from '@app/common/modules/aave-v3-evm/aave-v3-evm.module';
import { Module } from '@nestjs/common';
import { AaveV3BorrowingTransactionController } from './controller/aave-v3-borrowing-transaction.controller';
import { AaveV3LendingTransactionController } from './controller/aave-v3-lending-transaction.controller';
import { AaveV3WithdrawTransactionController } from './controller/aave-v3-withdraw-transaction.controller';
import { AaveV3BorrowingTransactionService } from './service/aave-v3-borrowing-transaction.service';
import { AaveV3LendingTransactionService } from './service/aave-v3-lending-transaction.service';
import { AaveV3WithdrawTransactionService } from './service/aave-v3-withdraw-transaction.service';

@Module({
  imports: [AaveV3EvmModule],
  providers: [
    AaveV3LendingTransactionService,
    AaveV3WithdrawTransactionService,
    AaveV3BorrowingTransactionService,
  ],
  controllers: [
    AaveV3LendingTransactionController,
    AaveV3WithdrawTransactionController,
    AaveV3BorrowingTransactionController,
  ],
})
export class AaveV3ReservesModule {}
