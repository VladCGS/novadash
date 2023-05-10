import { MsHealthCheckService } from '@app/common/modules/healthcheck/services/ms-healthcheck.service';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { Injectable } from '@nestjs/common';
import {
  StateChains,
  StateExchangesOnOffRamp,
  StateExchangesSwap,
  StatePlatformCoins,
} from '../app-states/app-instances.state';
import {
  AlphapingStatesDTO,
  FeaturesStatesDTO,
  MicroservicesStatesDTO,
} from '../dto/app-statuses-reader-responses.dto';
import { APP_STATES_NAMES } from '../types/app-states-names.const';

@Injectable()
export class AppStatusesFormerService {
  constructor(
    private statusChains: StateChains,
    private statusPlatformCoins: StatePlatformCoins,
    private statusExchangesSwap: StateExchangesSwap,
    private statusOnOffRamp: StateExchangesOnOffRamp,
    private health: MsHealthCheckService,
  ) {}

  async formAll(): Promise<AlphapingStatesDTO> {
    const features = this.getFeaturesStatuses();
    const microservices = await this.getMicroservicesStatuses();
    return { features, microservices };
  }

  private async getMicroservicesStatuses(): Promise<MicroservicesStatesDTO> {
    const msPairsStatus = await this.health.checkMsPairs().catch(() => ({
      status: 'down',
    }));
    const msBalancesStatus = await this.health.checkMsBalances().catch(() => ({
      status: 'down',
    }));
    const msTransactions = await this.health
      .checkMsTransactions()
      .catch(() => ({
        status: 'down',
      }));

    return {
      [RMQ_SERVICES_NAMES.MS_PAIRS]: msPairsStatus.status,
      [RMQ_SERVICES_NAMES.MS_BALANCES]: msBalancesStatus.status,
      [RMQ_SERVICES_NAMES.MS_TRANSACTION]: msTransactions.status,
    };
  }

  private getFeaturesStatuses(): FeaturesStatesDTO {
    return {
      [APP_STATES_NAMES.CHAINS]: this.statusChains.getInternalState(),
      [APP_STATES_NAMES.PLATFORM_COINS]:
        this.statusPlatformCoins.getInternalState(),
      [APP_STATES_NAMES.EXCHANGES_SWAP]:
        this.statusExchangesSwap.getInternalState(),
      [APP_STATES_NAMES.EXCHANGES_ON_OFF_RAMP]:
        this.statusOnOffRamp.getInternalState(),
    };
  }
}
