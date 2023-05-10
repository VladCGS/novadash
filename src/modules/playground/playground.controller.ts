import { Roles } from '@app/common/decorators';
import { AppRoles } from '@app/common/types';
import { Controller, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MainClient } from 'binance';
import { Web3InfuraProviderDelegator } from '@app/common/modules/web3-infura-provider-evm/services/web3-infura-provider.delegator';
import { BinanceWithdrawalService } from '../payable-cex-binance/services/binance-withdtawal.service';
import { DelegatorEvmService } from '@app/common/modules/delegator/services/delegator-evm.service';
import { CoinPriceService } from '@app/common/modules/coin-price/coin-price.service';
import { Web3DirectDataDelegator } from '@app/common/modules/web3-direct-data/services/web3-direct-data.delegator';

@Controller('playground')
@ApiTags('playground')
@ApiBearerAuth('JWT')
@Roles(AppRoles.ADMIN)
export class PlaygroundController {
  private readonly logger = new Logger(PlaygroundController.name);
  private binanceClient: MainClient;

  constructor(
    private binanceWithdrawalService: BinanceWithdrawalService,
    private delegatorEvmService: DelegatorEvmService,
    private web3InfuraProviderDelegator: Web3InfuraProviderDelegator,
    private coinPriceService: CoinPriceService,
    private web3DirectDataDelegator: Web3DirectDataDelegator,
  ) {
    this.binanceClient = new MainClient({
      api_key:
        'dc38RUtnJ6xplYBpgWFfuDyGesGKXr7EOWK7KaCPcr1rpkxvk5glWRyQNqtWBSzC',
      api_secret:
        'wdwVFVrVTl9AaRLYIuzBbJEsHG0ewvxRbYbZNh3UerRqDr6tz7OK575yhVuBphh9',
    });
  }
}
