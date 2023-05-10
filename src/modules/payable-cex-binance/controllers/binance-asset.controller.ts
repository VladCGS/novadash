import { BINANCE_HEADER_KEYS } from '@app/common/constants/cex-header-keys-names.const';
import { Roles } from '@app/common/decorators';
import { PlatformCoin, User } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckCEXApiKeyAuthGuard } from '@app/common/guards/check-cex-api-key-auth-guard.service';
import { CheckBinanceAPIKeyPermissionsGuard } from '../guards/check-binance-api-key-permissions.guard';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BinanceTokensMetaService } from '../services/binance-tokens-meta.service';
import {
  BinanceFetchAssetWithdrawChainsDTO,
  BinanceSymbolAndDBChainDTO,
} from '../dto/binance-asset.request.dto';
import { ApiBinanceHeaders } from '@app/common/decorators/cex.decorator';
import { BinanceKeysExtractorService } from '../services/binance-keys-extractor.service';

@Controller('user/binance-asset')
@ApiTags('BINANCE meta')
@ApiBinanceHeaders()
@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  new CheckCEXApiKeyAuthGuard(Object.values(BINANCE_HEADER_KEYS)),
  CheckBinanceAPIKeyPermissionsGuard,
  RolesGuard,
  new CheckIdValidGuard({ field: ['id'], findIn: 'userData' }),
  new CheckRecordFieldExistGuard([
    {
      Entity: User,
      dataSource: 'userData',
      entityField: 'id',
      sourceField: 'id',
    },
  ]),
)
@Roles(AppRoles.USER)
export class BinanceAssetController {
  constructor(
    private binanceTokensMetaService: BinanceTokensMetaService,
    private binanceKeysExtractorService: BinanceKeysExtractorService,
  ) {}

  @Post('/future-withdraw-address')
  async getFutureWithdrawalPlatformCoin(
    @Req() req,
    @Body() body: BinanceSymbolAndDBChainDTO,
  ): Promise<PlatformCoin> {
    return this.binanceTokensMetaService.getFutureWithdrawalPlatformCoin(
      this.binanceKeysExtractorService.extractKeysFromRequest(req),
      body.symbol,
      body.chainIdDB,
    );
  }

  @Post('/asset-withdraw-chains-ids')
  async getAssetWithdrawChains(
    @Req() req,
    @Body() body: BinanceFetchAssetWithdrawChainsDTO,
  ): Promise<string[]> {
    return this.binanceTokensMetaService.getAssetWithdrawChains(
      this.binanceKeysExtractorService.extractKeysFromRequest(req),
      body.symbol,
    );
  }
}
