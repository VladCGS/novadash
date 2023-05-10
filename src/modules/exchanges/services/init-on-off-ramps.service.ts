import { RMQ_EVENTS } from '@app/common/modules/rmq/constants/ms-transaction.patterns';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StateExchangesOnOffRamp } from '../../state-manager/app-states/app-instances.state';
import { ExchangesOnOffRampStatesEnum } from '../../state-manager/types/state-on-off-ramp.types';

@Injectable()
export class InitExchangesOnOffRampService {
  constructor(
    private statusOnOffRamp: StateExchangesOnOffRamp,
    @Inject(RMQ_SERVICES_NAMES.MS_PAIRS) private pairsClient: ClientProxy,
  ) {}

  async handleInit() {
    try {
      this.statusOnOffRamp.update(ExchangesOnOffRampStatesEnum.PROCESSING);

      await this.initExchangesOnOffRamp();

      this.statusOnOffRamp.update(ExchangesOnOffRampStatesEnum.DONE);
    } catch (err) {
      this.statusOnOffRamp.emit(ExchangesOnOffRampStatesEnum.ERROR, err);
      this.statusOnOffRamp.update(ExchangesOnOffRampStatesEnum.ERROR);
    }
  }

  private async initExchangesOnOffRamp(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pairsClient
        .send(RMQ_EVENTS.ms_pairs.START_INIT_EXCHANGES_ON_OFF_RAMPS, 'START')
        .subscribe({
          complete: () => resolve(),
          error: () => reject('Services and tokens initialization error!'),
        });
    });
  }
}
