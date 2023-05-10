import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Web3InfuraProviderDelegator } from '@app/common/modules/web3-infura-provider-evm/services/web3-infura-provider.delegator';
import { BinanceWithdrawalService } from '../payable-cex-binance/services/binance-withdtawal.service';
import { DelegatorEvmService } from '@app/common/modules/delegator/services/delegator-evm.service';
import { CoinPriceService } from '@app/common/modules/coin-price/coin-price.service';
import { Web3DirectDataDelegator } from '@app/common/modules/web3-direct-data/services/web3-direct-data.delegator';
import { Kraken } from 'node-kraken-api';

@Controller('playground/kraken')
@ApiTags('Kraken playground')
export class PlaygroundKrakenController {
  private readonly logger = new Logger(PlaygroundKrakenController.name);
  private krakenClient: Kraken;

  constructor(
    private binanceWithdrawalService: BinanceWithdrawalService,
    private delegatorEvmService: DelegatorEvmService,
    private web3InfuraProviderDelegator: Web3InfuraProviderDelegator,
    private coinPriceService: CoinPriceService,
    private web3DirectDataDelegator: Web3DirectDataDelegator,
  ) {
    this.krakenClient = new Kraken({
      key: 'MtVVoGyky02cYGSl7chKkqDTMne1ZJOy0uEjnsXAsLZdLrEE+6s/63oT',
      secret:
        'fC5iU+wO3bZcGbI3cbtag7WXWm3rKws2yx9JFm4JlYzAhAgCI7jS+iBSgNY7AumcNtYO/4XGYctXvaQ7AoJLBA==',
    });
  }

  @Get('/kraken-assets')
  async getWithdraws(): Promise<any> {
    return this.krakenClient.assets();
  }

  @Get('/kraken-balance')
  async getBalance(): Promise<any> {
    return this.krakenClient.balance();
  }

  @Get('/kraken-pais')
  async getPais(): Promise<any> {
    return this.krakenClient.assetPairs();
  }

  @Get('/kraken-deposit-options/:symbol')
  async getDeposit(@Param('symbol') symbol: string): Promise<any> {
    return this.krakenClient.depositMethods({
      asset: symbol,
    });
  }

  @Get('/kraken-pai/:pair')
  async getPair(@Param('pair') pair: string): Promise<any> {
    return this.krakenClient.ticker({
      pair,
    });
  }
}
