import { ErrorMiddlewareService } from '@app/common/modules/error-middleware/services/error-middleware.service';
import { MsHealthCheckService } from '@app/common/modules/healthcheck/services/ms-healthcheck.service';
import { Injectable, Logger } from '@nestjs/common';
import { InitChainsService } from '../../chain/services/init-chains.service';
import { InitCoingeckoIdAndSymbolService } from '../../coingecko-init/services/init-coingecko-id-and-symbol.service';
import { IInitFeaturesStatusHandler } from '../../cron-manager/types/init-features.types';
import { InitExchangesSwapService } from '../../exchanges/services/init-exchange-swap-coins.service';
import { InitExchangesOnOffRampService } from '../../exchanges/services/init-on-off-ramps.service';
import { InitLendingAssetsService } from '../../lend-borrow-user/services/init-lending-assets.service';
import { InitSupportedPoolService } from '../../liquidity-pools/service/init-supported-pool.service';
import { InitPlatformCoinsService } from '../../platform-coins/services/init-platform-coins.service';
import { InitToolMetaService } from '../../../../../ms-pairs/src/modules/tool-meta/services/init-tool-meta.service';
import { InitSupportedPoolCexService } from '../../liquidity-pools/service/init-supported-pool-cex.service';
import { InitStakingAssetsService } from '../../staking-assets/service/init-staking-assets.service';
import { InitStablecoinsService } from '../../exchanges/services/init-stablecoins.service';
import { InitExchangesBinanceService } from '../../exchanges/services/init-exchange-binance-coins.service';

@Injectable()
export class AppInitFeaturesService {
  private readonly logger = new Logger(AppInitFeaturesService.name);

  constructor(
    private errorMiddlewareService: ErrorMiddlewareService,
    private initChainsService: InitChainsService,
    private initPlatformCoinsService: InitPlatformCoinsService,
    private initExchangesSwapService: InitExchangesSwapService,
    private initExchangesBinanceService: InitExchangesBinanceService,
    private initExchangesOnOffRampService: InitExchangesOnOffRampService,
    private initCoingeckoIdAndSymbolService: InitCoingeckoIdAndSymbolService,
    private initSupportedPoolService: InitSupportedPoolService,
    private initSupportedPoolCexService: InitSupportedPoolCexService,
    private msHealthCheck: MsHealthCheckService,
    private initToolMetaService: InitToolMetaService,
    private initLendingAssetsService: InitLendingAssetsService,
    private initStakingAssetsService: InitStakingAssetsService,
    private initStableCoinsService: InitStablecoinsService,
  ) {}

  async initAll(statusHandlers?: IInitFeaturesStatusHandler) {
    try {
      await this.msHealthCheck.checkMsPairs();
      await this.errorMiddlewareService.fetchOrFailAndException(() => {
        return this.initToolMetaService.handleInit();
      });

      await this.msHealthCheck.checkMsPairs();
      await this.errorMiddlewareService.fetchOrFailAndException(() => {
        return this.initChainsService.handleInit();
      });

      await this.msHealthCheck.checkMsPairs();
      await this.errorMiddlewareService.fetchOrFailAndContinue(() => {
        return this.initPlatformCoinsService.handleInit();
      });

      await this.msHealthCheck.checkMsPairs();
      await this.errorMiddlewareService.fetchOrFailAndException(() => {
        return this.initExchangesSwapService.handleInit();
      });

      await this.msHealthCheck.checkMsPairs();
      await this.errorMiddlewareService.fetchOrFailAndException(() => {
        return this.initExchangesOnOffRampService.handleInit();
      });

      await this.msHealthCheck.checkMsPairs();
      await this.errorMiddlewareService.fetchOrFailAndException(() => {
        return this.initCoingeckoIdAndSymbolService.handleInit();
      });

      await this.msHealthCheck.checkMsPairs();
      await this.errorMiddlewareService.fetchOrFailAndException(() => {
        return this.initSupportedPoolService.handleInit();
      });

      await this.msHealthCheck.checkMsPairs();
      await this.errorMiddlewareService.fetchOrFailAndException(() => {
        return this.initLendingAssetsService.handleInit();
      });

      await this.msHealthCheck.checkMsPairs();
      await this.errorMiddlewareService.fetchOrFailAndException(() => {
        return this.initStakingAssetsService.handleInit();
      });

      statusHandlers?.onFeatureInitCompleted();
    } catch (err) {
      if (statusHandlers?.onFeatureInitFailed) {
        statusHandlers.onFeatureInitFailed(err);
      }

      this.logger.error(`Initialization failed: ${err?.message}`);
    }
  }

  async initToolMeta() {
    await this.msHealthCheck.checkMsPairs();
    return this.initToolMetaService.handleInit();
  }

  async initChains() {
    await this.errorMiddlewareService.fetchOrFailAndException(() => {
      return this.initChainsService.handleInit();
    });
  }

  async initPlatformCoins() {
    await this.msHealthCheck.checkMsPairs();
    return this.initPlatformCoinsService.handleInit();
  }

  async initExchangesSwap() {
    await this.msHealthCheck.checkMsPairs();
    return this.initExchangesSwapService.handleInit();
  }

  async initExchangesBinance() {
    await this.msHealthCheck.checkMsPairs();
    return this.initExchangesBinanceService.handleInit();
  }

  async initExchangesOnOffRamp() {
    await this.msHealthCheck.checkMsPairs();
    return this.initExchangesOnOffRampService.handleInit();
  }

  async initCoingeckoIdAndSymbol() {
    await this.msHealthCheck.checkMsPairs();
    return this.initCoingeckoIdAndSymbolService.handleInit();
  }

  async initSupportedPool() {
    await this.msHealthCheck.checkMsPairs();
    return this.initSupportedPoolService.handleInit();
  }

  async initSupportedPoolCex() {
    await this.msHealthCheck.checkMsPairs();
    return this.initSupportedPoolCexService.handleInit();
  }

  async initSupportedReserves() {
    await this.msHealthCheck.checkMsPairs();
    return this.initLendingAssetsService.handleInit();
  }

  async initSupportedStakingTokens() {
    await this.msHealthCheck.checkMsPairs();
    return this.initStakingAssetsService.handleInit();
  }

  async initSupportedStablecoins() {
    await this.msHealthCheck.checkMsPairs();
    return this.initStableCoinsService.handleInit();
  }
}
