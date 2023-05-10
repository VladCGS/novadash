import { RMQ_EVENTS } from '@app/common/modules/rmq/constants/ms-transaction.patterns';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StateSupportedStakingTokens } from '../../state-manager/app-states/app-instances.state';
import { SupportedStakingTokens } from '../../state-manager/types/state-supported-staking-tokens.types';

@Injectable()
export class InitStakingAssetsService {
  constructor(
    private stateSupportedStakingTokens: StateSupportedStakingTokens,
    @Inject(RMQ_SERVICES_NAMES.MS_PAIRS) private pairsClient: ClientProxy,
  ) {}

  async handleInit() {
    try {
      this.stateSupportedStakingTokens.update(
        SupportedStakingTokens.PROCESSING,
      );

      await this.initSupportedStakingTokens();

      this.stateSupportedStakingTokens.update(SupportedStakingTokens.DONE);
    } catch (err) {
      this.stateSupportedStakingTokens.emit(SupportedStakingTokens.ERROR, err);
      this.stateSupportedStakingTokens.update(SupportedStakingTokens.ERROR);
    }
  }

  private async initSupportedStakingTokens(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pairsClient
        .send(RMQ_EVENTS.ms_pairs.START_INIT_SUPPORTED_STAKING_TOKENS, 'START')
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
