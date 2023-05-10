import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PureKucoinService } from '@app/common/modules/pure-cex-kucoin/services/pure-kucoin.service';
import { IKucoinKeys } from '../payable-cex-kucoin/types/kucoin-keys.types';
import { KUCOIN_HEADER_KEYS } from '@app/common/constants/cex-header-keys-names.const';
import { PlaygroundKucoin } from './playground.dto';

const api = require('kucoin-node-api');

@Controller('playground/kucoin')
@ApiTags('Coinbase playground')
export class PlaygroundKucoinController {
  keys: IKucoinKeys;
  private readonly logger = new Logger(PlaygroundKucoinController.name);
  constructor(private pureKucoinService: PureKucoinService) {
    this.keys = {
      [KUCOIN_HEADER_KEYS.SECRET]: '1819ea94-3c5c-4a2c-aae9-68978548146b',
      [KUCOIN_HEADER_KEYS.KEY]: '64514e5ecb77280001342b09',
      [KUCOIN_HEADER_KEYS.PASSPHRASE]: 'novadash',
    };
  }

  private KucoinPlayground() {
    const client = { ...api };
    client.init({
      apiKey: '64520c26ba02b40001f998cd',
      secretKey: 'd6450c5b-59c2-4816-b146-ffba19f37b7b',
      passphrase: 'novadashtest',
      environment: 'sandbox',
    });

    return client;
  }

  private Kucoin() {
    const client = api;
    client.init({
      apiKey: '64520c26ba02b40001f998cd',
      secretKey: 'd6450c5b-59c2-4816-b146-ffba19f37b7b',
      passphrase: 'novadashtest',
      environment: 'sandbox',
    });

    return client;
  }

  @Get('/balances')
  async getBalances(): Promise<any> {
    return this.pureKucoinService
      .getCurrenciesList(this.keys)
      .catch(console.error);
  }

  @Get('/deposit-list/:symbol')
  async getDepositList(@Param('symbol') symbol: string): Promise<any> {
    return this.pureKucoinService.getDepositList(this.keys, {
      currency: symbol,
    });
  }

  @Get('/deposit-address/:symbol')
  async getDepositAddress(@Param('symbol') symbol: string): Promise<any> {
    return this.pureKucoinService.getDepositOptionsForForCurrency(this.keys, {
      currency: symbol,
    });
  }

  @Post('/create-deposit-options')
  async createDepositAddress(@Body() body: PlaygroundKucoin): Promise<any> {
    return this.pureKucoinService
      .createDepositAddressForCurrency(this.keys, body)
      .catch(console.error);
  }

  @Get('/balances/test')
  async getBalancesTest(): Promise<any> {
    return this.KucoinPlayground().getAccounts().catch(console.error);
  }

  @Get('/deposit-list/test/:symbol')
  async getDepositListTest(@Param('symbol') symbol: string): Promise<any> {
    return this.KucoinPlayground()
      .getDepositList({
        currency: symbol,
      })
      .catch(console.error);
  }

  @Get('/deposit-address/test/:symbol')
  async getDepositAddressTest(@Param('symbol') symbol: string): Promise<any> {
    return this.KucoinPlayground()
      .getDepositAddress({
        currency: symbol,
      })
      .catch(console.error);
  }

  @Post('/create-deposit-options/test')
  async createDepositAddressTest(@Body() body: PlaygroundKucoin): Promise<any> {
    return this.KucoinPlayground()
      .createDepositAddress(body)
      .catch(console.error);
  }
}
