import { Module } from '@nestjs/common';
import { KrakenDepositService } from './services/kraken-deposit.service';
import { KrakenWithdrawController } from './controllers/kraken-withdraw.controller';
import { PureCexKrakenModule } from '@app/common/modules/pure-cex-kraken/pure-cex-kraken.module';
import { KrakenDepositController } from './controllers/kraken-deposit.controller';

@Module({
  imports: [PureCexKrakenModule],
  providers: [KrakenDepositService],
  controllers: [KrakenWithdrawController, KrakenDepositController],
})
export class PayableCexKrakenModule {}
