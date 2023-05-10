import { RMQ_EVENTS } from '@app/common/modules/rmq/constants/ms-transaction.patterns';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StateCoingeckoIdSymbol } from '../../state-manager/app-states/app-instances.state';
import { CoingeckoIdSymbolEnum } from '../../state-manager/types/state-coingecko-id-and-symbol.types';

@Injectable()
export class InitCoingeckoIdAndSymbolService {
  constructor(
    private stateCoingeckoIdSymbol: StateCoingeckoIdSymbol,
    @Inject(RMQ_SERVICES_NAMES.MS_PAIRS) private pairsClient: ClientProxy,
  ) {}

  async handleInit() {
    try {
      this.stateCoingeckoIdSymbol.update(CoingeckoIdSymbolEnum.PROCESSING);

      await this.initCoingeckoIdAndSymbol();

      this.stateCoingeckoIdSymbol.update(CoingeckoIdSymbolEnum.DONE);
    } catch (err) {
      this.stateCoingeckoIdSymbol.emit(CoingeckoIdSymbolEnum.ERROR, err);
      this.stateCoingeckoIdSymbol.update(CoingeckoIdSymbolEnum.ERROR);
    }
  }

  private async initCoingeckoIdAndSymbol(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pairsClient
        .send(RMQ_EVENTS.ms_pairs.START_INIT_COINGECKO_ID_SYMBOL, 'START')
        .subscribe({
          complete: () => {
            resolve();
          },
          error: () => {
            reject('Coingecko ids and symbols initialization error!');
          },
        });
    });
  }
}
