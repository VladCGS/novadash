import { Inject, Injectable } from '@nestjs/common';
import { StateToolsMeta } from '../state-manager/app-states/app-instances.state';
import { RMQ_SERVICES_NAMES } from '@app/common/modules/rmq/constants/services-names.const';
import { ClientProxy } from '@nestjs/microservices';
import { RMQ_EVENTS } from '@app/common/modules/rmq/constants/ms-transaction.patterns';
import { ToolsMetaStateEnum } from '../state-manager/types/state-tools-meta.types';

@Injectable()
export class InitToolMetaService {
  constructor(
    private stateToolsMeta: StateToolsMeta,
    @Inject(RMQ_SERVICES_NAMES.MS_PAIRS) private pairsClient: ClientProxy,
  ) {}

  async handleInit() {
    try {
      this.stateToolsMeta.update(ToolsMetaStateEnum.PROCESSING);

      await this.initToolsMeta();

      this.stateToolsMeta.update(ToolsMetaStateEnum.DONE);
    } catch (err) {
      this.stateToolsMeta.emit(ToolsMetaStateEnum.ERROR, err);
      this.stateToolsMeta.update(ToolsMetaStateEnum.ERROR);
    }
  }

  private async initToolsMeta(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pairsClient
        .send(RMQ_EVENTS.ms_pairs.START_INIT_TOOLS_META, 'START')
        .subscribe({
          complete: () => {
            resolve();
          },
          error: () => {
            reject('Tools meta initialization error!');
          },
        });
    });
  }
}
