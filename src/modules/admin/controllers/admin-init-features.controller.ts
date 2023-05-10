import { Roles } from '@app/common/decorators';
import { Admin } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppInitFeaturesService } from '../services/app-init-features.service';

@Controller('admin/init-features')
@ApiTags('Admin Init Features')
@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
  new CheckIdValidGuard({ field: ['id'], findIn: 'userData' }),
  new CheckRecordFieldExistGuard([
    {
      Entity: Admin,
      dataSource: 'userData',
      entityField: 'id',
      sourceField: 'id',
    },
  ]),
)
@Roles(AppRoles.ADMIN)
export class AdminInitFeaturesController {
  private readonly logger = new Logger(AdminInitFeaturesController.name);

  constructor(private appInitFeaturesService: AppInitFeaturesService) {}

  @Get('/call-all')
  async initAppInitialData() {
    this.logger.warn('Init all features requested!');
    await this.appInitFeaturesService.initAll({
      onFeatureInitFailed: (err: Error) => {
        throw new HttpException(
          `Feature initialization error: ${err?.message ? err.message : err}`,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      },
      onFeatureInitCompleted: () => {
        this.logger.log('Feature initialization complete!');
      },
    });
    return 'done';
  }

  @Get('/call-chains')
  async callInitChains() {
    this.logger.warn('Init Chains requested!');
    return this.appInitFeaturesService.initChains();
  }

  @Get('/call-tool-meta')
  async callInitToolMeta() {
    this.logger.warn('Init ToolMeta requested!');
    return this.appInitFeaturesService.initToolMeta();
  }

  @Get('/call-platform-coins')
  async callInitPlatformCoins() {
    this.logger.warn('Init PlatformCoins requested!');
    return this.appInitFeaturesService.initPlatformCoins();
  }

  @Get('/call-exchanges-swap')
  async callInitExchangesSwap() {
    this.logger.warn('Init ExchangesSwap requested!');
    return this.appInitFeaturesService.initExchangesSwap();
  }

  @Get('/call-exchanges-binance')
  async callInitExchangesBinance() {
    this.logger.warn('Init ExchangesSwap requested!');
    return this.appInitFeaturesService.initExchangesBinance();
  }

  @Get('/call-exchanges-on-off-ramp')
  async callInitExchangesOnOffRamp() {
    this.logger.warn('Init ExchangesOnOffRamp requested!');
    return this.appInitFeaturesService.initExchangesOnOffRamp();
  }

  @Get('/call-supported-pool')
  async callInitSupportedPool() {
    this.logger.warn('Init SupportedPool requested!');
    return this.appInitFeaturesService.initSupportedPool();
  }

  @Get('/call-supported-pool-cex')
  async callInitSupportedPoolCex() {
    this.logger.warn('Init CoingeckoIdAndSymbol requested!');
    return this.appInitFeaturesService.initSupportedPoolCex();
  }

  @Get('/call-supported-reserves')
  async callInitSupportedReserves() {
    this.logger.warn('Init SupportedReserves requested!');
    return this.appInitFeaturesService.initSupportedReserves();
  }

  @Get('/call-coingecko-id-and-symbol')
  async callInitCoingeckoIdAndSymbol() {
    this.logger.warn('Init CoingeckoIdAndSymbol requested!');
    return this.appInitFeaturesService.initCoingeckoIdAndSymbol();
  }

  @Get('/call-supported-staking-tokens')
  async callInitSupportedStakingTokens() {
    this.logger.warn('Init StakingTokens requested!');
    return this.appInitFeaturesService.initSupportedStakingTokens();
  }

  @Get('/call-supported-stablecoins')
  async callInitSupportedStableCoins() {
    this.logger.warn('Init stablecoins requested!');
    return this.appInitFeaturesService.initSupportedStablecoins();
  }
}
