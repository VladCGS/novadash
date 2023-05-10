import { Injectable } from '@nestjs/common';
import { StateChains } from '../../state-manager/app-states/app-instances.state';
import { ChainsStatesEnum } from '../../state-manager/types/state-chains.types';
import { LoadChainService } from './load-chain.service';

@Injectable()
export class InitChainsService {
  constructor(
    private statusChains: StateChains,
    private loadChainService: LoadChainService,
  ) {}

  async handleInit() {
    try {
      const startInitDate = new Date();
      this.statusChains.update(ChainsStatesEnum.PROCESSING);

      await this.loadChainService.loadBitcoinChain();
      await this.loadChainService.loadChainIdNetworkChains();
      await this.loadChainService.loadSolanaChain();

      await this.loadChainService.cleanupChainsToDate(startInitDate);

      this.statusChains.update(ChainsStatesEnum.DONE);
    } catch (err) {
      this.statusChains.emit(ChainsStatesEnum.ERROR, err);
      this.statusChains.update(ChainsStatesEnum.ERROR);
    }
  }
}
