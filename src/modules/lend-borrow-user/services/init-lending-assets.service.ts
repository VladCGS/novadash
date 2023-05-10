import { RMQ_EVENTS } from '@app/common/modules/rmq/constants/ms-transaction.patterns';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StateSupportedReserves } from '../../state-manager/app-states/app-instances.state';
import { SupportedReservesStateEnum } from '../../state-manager/types/state-supported-reserves.types';

@Injectable()
export class InitLendingAssetsService {
  constructor(
    private stateSupportedReserves: StateSupportedReserves,
    @Inject(RMQ_SERVICES_NAMES.MS_PAIRS) private pairsClient: ClientProxy,
  ) {}

  async handleInit() {
    try {
      this.stateSupportedReserves.update(SupportedReservesStateEnum.PROCESSING);

      await this.initSupportedReserves();

      this.stateSupportedReserves.update(SupportedReservesStateEnum.DONE);
    } catch (err) {
      this.stateSupportedReserves.emit(SupportedReservesStateEnum.ERROR, err);
      this.stateSupportedReserves.update(SupportedReservesStateEnum.ERROR);
    }
  }

  private async initSupportedReserves(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pairsClient
        .send(RMQ_EVENTS.ms_pairs.START_INIT_SUPPORTED_RESERVES, 'START')
        .subscribe({
          complete: () => {
            resolve();
          },
          error: () => {
            reject('Supported lending assets initialization error!');
          },
        });
    });
  }
}
