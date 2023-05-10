import { RMQ_EVENTS } from '@app/common/modules/rmq/constants/ms-transaction.patterns';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StatePlatformCoins } from '../../state-manager/app-states/app-instances.state';
import { PlatformCoinsStatesEnum } from '../../state-manager/types/state-platform-coins.types';

@Injectable()
export class InitPlatformCoinsService {
  constructor(
    private statePlatformCoins: StatePlatformCoins,
    @Inject(RMQ_SERVICES_NAMES.MS_PAIRS) private pairsClient: ClientProxy,
  ) {}

  async handleInit() {
    try {
      this.statePlatformCoins.update(PlatformCoinsStatesEnum.PROCESSING);

      await this.initPlatformCoinsByCoingecko();

      this.statePlatformCoins.update(PlatformCoinsStatesEnum.DONE);
    } catch (err) {
      this.statePlatformCoins.emit(PlatformCoinsStatesEnum.ERROR, err);
      this.statePlatformCoins.update(PlatformCoinsStatesEnum.ERROR);
    }
  }

  private async initPlatformCoinsByCoingecko(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pairsClient
        .send(RMQ_EVENTS.ms_pairs.START_INIT_META_COINGECKO, 'START')
        .subscribe({
          complete: () => {
            resolve();
          },
          error: () => {
            reject('Platform Coins by Coingecko initialization error!');
          },
        });
    });
  }
}
