import { RMQ_EVENTS } from '@app/common/modules/rmq/constants/ms-transaction.patterns';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StateExchangesSwap } from '../../state-manager/app-states/app-instances.state';
import { ExchangesSwapStatesEnum } from '../../state-manager/types/state-exchanges-swap.types';

@Injectable()
export class InitExchangesBinanceService {
  constructor(
    private statusExchangesSwap: StateExchangesSwap,
    @Inject(RMQ_SERVICES_NAMES.MS_PAIRS) private pairsClient: ClientProxy,
  ) {}

  async handleInit() {
    try {
      this.statusExchangesSwap.update(ExchangesSwapStatesEnum.PROCESSING);

      await this.initAppServicesAndTokens();

      this.statusExchangesSwap.update(ExchangesSwapStatesEnum.DONE);
    } catch (err) {
      this.statusExchangesSwap.emit(ExchangesSwapStatesEnum.ERROR, err);
      this.statusExchangesSwap.update(ExchangesSwapStatesEnum.ERROR);
    }
  }

  private async initAppServicesAndTokens(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pairsClient
        .send(RMQ_EVENTS.ms_pairs.START_INIT_EXCHANGES_BINANCE, 'START')
        .subscribe({
          complete: () => {
            resolve();
          },
          error: () => {
            reject('Binance tokens initialization error!');
          },
        });
    });
  }
}
