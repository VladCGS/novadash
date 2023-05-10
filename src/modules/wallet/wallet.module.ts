import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ExchangesModule } from '../exchanges/exchanges.module';
import { WalletController } from './controllers/wallet.controller';
import { WalletPayableService } from './services/wallet-payable.service';
import { WalletService } from './services/wallet.service';

@Module({
  providers: [WalletService, WalletPayableService, ExchangesModule],
  imports: [JwtModule],
  controllers: [WalletController],
  exports: [WalletService, WalletPayableService],
})
export class WalletModule {}
