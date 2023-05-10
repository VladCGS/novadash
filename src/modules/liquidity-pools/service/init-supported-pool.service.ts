import { RMQ_EVENTS } from '@app/common/modules/rmq/constants/ms-transaction.patterns';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StateSupportedPool } from '../../state-manager/app-states/app-instances.state';
import { SupportedPoolStateEnum } from '../../state-manager/types/state-supported-pool.types';

@Injectable()
export class InitSupportedPoolService {
  constructor(
    private stateSupportedPool: StateSupportedPool,
    @Inject(RMQ_SERVICES_NAMES.MS_PAIRS) private pairsClient: ClientProxy,
  ) {}

  async handleInit() {
    try {
      this.stateSupportedPool.update(SupportedPoolStateEnum.PROCESSING);

      await this.initSupportedPools();

      this.stateSupportedPool.update(SupportedPoolStateEnum.DONE);
    } catch (err) {
      this.stateSupportedPool.emit(SupportedPoolStateEnum.ERROR, err);
      this.stateSupportedPool.update(SupportedPoolStateEnum.ERROR);
    }
  }

  private async initSupportedPools(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pairsClient
        .send(RMQ_EVENTS.ms_pairs.START_INIT_SUPPORTED_POOL, 'START')
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
