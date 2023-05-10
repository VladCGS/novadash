import { RMQ_EVENTS } from '@app/common/modules/rmq/constants/ms-transaction.patterns';
import { Inject, Injectable } from '@nestjs/common';
import { StateSupportedStablecoins } from '../../state-manager/app-states/app-instances.state';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { ClientProxy } from '@nestjs/microservices';
import { SupportedStablecoins } from '../../state-manager/types/state-supported-stablecoins.types';

@Injectable()
export class InitStablecoinsService {
  constructor(
    private stateSupportedStablecoins: StateSupportedStablecoins,
    @Inject(RMQ_SERVICES_NAMES.MS_PAIRS) private pairsClient: ClientProxy,
  ) {}

  async handleInit() {
    try {
      this.stateSupportedStablecoins.update(
        SupportedStablecoins.PROCESSING,
      );

      await this.initSupportedStablecoins();

      this.stateSupportedStablecoins.update(SupportedStablecoins.DONE);
    } catch (err) {
      this.stateSupportedStablecoins.emit(SupportedStablecoins.ERROR, err);
      this.stateSupportedStablecoins.update(SupportedStablecoins.ERROR);
    }
  }

  private async initSupportedStablecoins(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pairsClient
        .send(RMQ_EVENTS.ms_pairs.START_INIT_SUPPORTED_STABLECOINS, 'START')
        .subscribe({
          complete: () => {
            resolve();
          },
          error: () => {
            reject('Supported staking assets initialization error!');
          },
        });
    });
  }
}
