import { Injectable, Logger } from '@nestjs/common';
import { AppBaseState } from 'apps/alphaping/src/modules/state-manager/app-states/base/app-base.state';
import { APP_STATES_NAMES } from '../types/app-states-names.const';
import { ChainsStatesEnum } from '../types/state-chains.types';
import { CoingeckoIdSymbolEnum } from '../types/state-coingecko-id-and-symbol.types';
import { ExchangesSwapStatesEnum } from '../types/state-exchanges-swap.types';
import { ExchangesOnOffRampStatesEnum } from '../types/state-on-off-ramp.types';
import { PlatformCoinsStatesEnum } from '../types/state-platform-coins.types';
import { SupportedPoolStateEnum } from '../types/state-supported-pool.types';
import { SupportedReservesStateEnum } from '../types/state-supported-reserves.types';
import { SupportedStakingTokens } from '../types/state-supported-staking-tokens.types';
import { ToolsMetaStateEnum } from '../types/state-tools-meta.types';
import { SupportedPoolCexStateEnum } from '../types/state-supported-pool-cex.types';
import { SupportedStablecoins } from '../types/state-supported-stablecoins.types';

@Injectable()
export class StateToolsMeta extends AppBaseState<ToolsMetaStateEnum> {
  protected internalState: ToolsMetaStateEnum = ToolsMetaStateEnum.DONE;
  constructor() {
    super(APP_STATES_NAMES.TOOLS_META);
    this.logger = new Logger(StateToolsMeta.name);
  }
}

@Injectable()
export class StateChains extends AppBaseState<ChainsStatesEnum> {
  protected internalState: ChainsStatesEnum = ChainsStatesEnum.DONE;
  constructor() {
    super(APP_STATES_NAMES.CHAINS);
    this.logger = new Logger(StateChains.name);
  }
}

@Injectable()
export class StatePlatformCoins extends AppBaseState<PlatformCoinsStatesEnum> {
  constructor() {
    super(APP_STATES_NAMES.PLATFORM_COINS);
    this.logger = new Logger(StatePlatformCoins.name);
  }
}

@Injectable()
export class StateExchangesSwap extends AppBaseState<ExchangesSwapStatesEnum> {
  constructor() {
    super(APP_STATES_NAMES.EXCHANGES_SWAP);
    this.logger = new Logger(StateExchangesSwap.name);
  }
}

@Injectable()
export class StateExchangesOnOffRamp extends AppBaseState<ExchangesOnOffRampStatesEnum> {
  constructor() {
    super(APP_STATES_NAMES.EXCHANGES_ON_OFF_RAMP);
    this.logger = new Logger(StateExchangesOnOffRamp.name);
  }
}

@Injectable()
export class StateCoingeckoIdSymbol extends AppBaseState<CoingeckoIdSymbolEnum> {
  constructor() {
    super(APP_STATES_NAMES.COINGECKO_ID_SYMBOL);
    this.logger = new Logger(StateCoingeckoIdSymbol.name);
  }
}

@Injectable()
export class StateSupportedPool extends AppBaseState<SupportedPoolStateEnum> {
  constructor() {
    super(APP_STATES_NAMES.SUPPORTED_POOL);
    this.logger = new Logger(StateSupportedPool.name);
  }
}

@Injectable()
export class StateSupportedPoolCex extends AppBaseState<SupportedPoolCexStateEnum> {
  constructor() {
    super(APP_STATES_NAMES.SUPPORTED_POOL_CEX);
    this.logger = new Logger(StateSupportedPool.name);
  }
}

@Injectable()
export class StateSupportedReserves extends AppBaseState<SupportedReservesStateEnum> {
  constructor() {
    super(APP_STATES_NAMES.SUPPORTED_RESERVES);
    this.logger = new Logger(StateSupportedReserves.name);
  }
}

@Injectable()
export class StateSupportedStakingTokens extends AppBaseState<SupportedStakingTokens> {
  constructor() {
    super(APP_STATES_NAMES.SUPPORTED_STAKING_TOKENS);
    this.logger = new Logger(StateSupportedStakingTokens.name);
  }
}

@Injectable()
export class StateSupportedStablecoins extends AppBaseState<SupportedStablecoins> {
  constructor() {
    super(APP_STATES_NAMES.SUPPORTED_STABLE_COINS);
    this.logger = new Logger(StateSupportedStablecoins.name);
  }
}
