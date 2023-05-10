import { BINANCE_HEADER_KEYS } from '@app/common/constants/cex-header-keys-names.const';
import { Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
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
import { BinanceWithdrawalService } from '../services/binance-withdtawal.service';
import {
  CEXFetchSwapStatusDTO,
  CEXSwapGetQuoteDTO,
} from '../../common/dto/payable/payable-cex-swap.requests.dto';
import {
  CEXSwapQuoteDTO,
  CEXSwapResultDataDTO,
} from '../../common/dto/payable/payable-cex-swap.responses.dto';
import { BinanceBSwapService } from '../services/binance-bswap.service';
import { PAYABLE_ROUTES } from '../../common/constants/exch-route.constants';
import { PayableCEXHttpSlugs } from '@app/common/constants/payable-slugs.const';
import { ApiBinanceHeaders } from '@app/common/decorators/cex.decorator';
import { FinalStatusDTO } from '../../common/dto/payable/payable-common.responses.dto';
import { BinanceKeysExtractorService } from '../services/binance-keys-extractor.service';

@Controller(PayableCEXHttpSlugs.BINANCE)
@ApiTags('PAYABLE Binance')
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
export class BinanceSwapController {
  constructor(
    private readonly binanceWithdrawalService: BinanceWithdrawalService,
    private readonly binanceBSwapService: BinanceBSwapService,
    private readonly binanceKeysExtractorService: BinanceKeysExtractorService,
  ) {}

  @Post(PAYABLE_ROUTES.swapCEX.status)
  async getBSwapStatus(
    @Req() req,
    @Body() body: CEXFetchSwapStatusDTO,
  ): Promise<FinalStatusDTO> {
    const result = await this.binanceBSwapService.getBSwapStatus(
      body.swapId,
      this.binanceKeysExtractorService.extractKeysFromRequest(req),
    );

    // Status - 0(0: pending for swap, 1: success, 2: failed)
    return {
      executed: result[0].status === 1,
      error: result[0].status === 2 ? 'Something went wrong' : undefined,
      info: result,
    };
  }

  @Post(PAYABLE_ROUTES.swapCEX.quote)
  async getBSwapQuote(
    @Req() req,
    @Body() body: CEXSwapGetQuoteDTO,
  ): Promise<CEXSwapQuoteDTO> {
    return this.binanceBSwapService.getBSwapQuote(
      body,
      this.binanceKeysExtractorService.extractKeysFromRequest(req),
    );
  }

  @Post(PAYABLE_ROUTES.swapCEX.call)
  async callBSwap(
    @Req() req,
    @Body() body: CEXSwapGetQuoteDTO,
  ): Promise<CEXSwapResultDataDTO> {
    return this.binanceBSwapService.callBSwap(
      body,
      this.binanceKeysExtractorService.extractKeysFromRequest(req),
    );
  }
}
