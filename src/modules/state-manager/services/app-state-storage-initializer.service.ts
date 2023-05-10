import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  StateChains,
  StateExchangesSwap,
  StateExchangesOnOffRamp,
  StatePlatformCoins,
} from '../app-states/app-instances.state';
import { StateStorageService } from './state-storage.service';

@Injectable()
export class AppStatesStorageInitializerService implements OnModuleInit {
  constructor(
    private stateStorageService: StateStorageService,
    private stateChains: StateChains,
    private stateCoins: StatePlatformCoins,
    private stateExchanges: StateExchangesSwap,
    private stateOnOffRamps: StateExchangesOnOffRamp,
  ) {}
  onModuleInit() {
    this.stateStorageService.addState(this.stateChains);
    this.stateStorageService.addState(this.stateCoins);
    this.stateStorageService.addState(this.stateExchanges);
    this.stateStorageService.addState(this.stateOnOffRamps);
  }
}
