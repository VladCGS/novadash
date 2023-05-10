import { RMQ_EVENTS } from '@app/common/modules/rmq/constants/ms-transaction.patterns';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StateSupportedPoolCex } from '../../state-manager/app-states/app-instances.state';
import { SupportedPoolCexStateEnum } from '../../state-manager/types/state-supported-pool-cex.types';

@Injectable()
export class InitSupportedPoolCexService {
  constructor(
    private stateSupportedPool: StateSupportedPoolCex,
    @Inject(RMQ_SERVICES_NAMES.MS_PAIRS) private pairsClient: ClientProxy,
  ) {}

  async handleInit() {
    try {
      this.stateSupportedPool.update(SupportedPoolCexStateEnum.PROCESSING);

      await this.initSupportedPoolsCex();

      this.stateSupportedPool.update(SupportedPoolCexStateEnum.DONE);
    } catch (err) {
      this.stateSupportedPool.emit(SupportedPoolCexStateEnum.ERROR, err);
      this.stateSupportedPool.update(SupportedPoolCexStateEnum.ERROR);
    }
  }

  private async initSupportedPoolsCex(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pairsClient
        .send(RMQ_EVENTS.ms_pairs.START_INIT_SUPPORTED_POOL_CEX, 'START')
        .subscribe({
          complete: () => {
            resolve();
          },
          error: () => {
            reject('Supported liquidity pools initialization error!');
          },
        });
    });
  }
}
