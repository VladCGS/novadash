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
import { BinanceBSwapService } from '../services/binance-bswap.service';
import { PAYABLE_ROUTES } from '../../common/constants/exch-route.constants';
import { PayableCEXHttpSlugs } from '@app/common/constants/payable-slugs.const';
import { ApiBinanceHeaders } from '@app/common/decorators/cex.decorator';
import { FinalStatusDTO } from '../../common/dto/payable/payable-common.responses.dto';
import {
  CEXFetchDepositAddressDTO,
  CEXFetchDepositStatusDTO,
} from '../../common/dto/payable/payable-cex-deposit.requests.dto';
import { CEXDepositAddressDTO } from '../../common/dto/payable/payable-cex-deposit.responses.dto';
import { BinanceDepositAssetsService } from '../services/binance-deposit-address.service';
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
export class BinanceDepositController {
  constructor(
    private readonly binanceWithdrawalService: BinanceWithdrawalService,
    private readonly binanceBSwapService: BinanceBSwapService,
    private readonly binanceDepositAssetsService: BinanceDepositAssetsService,
    private readonly binanceKeysExtractorService: BinanceKeysExtractorService,
  ) {}

  // @param depositId - for Binance is deposit transactionHash
  @Post(PAYABLE_ROUTES.depositCEX.status)
  async getDepositStatus(
    @Req() req,
    @Body() body: CEXFetchDepositStatusDTO,
  ): Promise<FinalStatusDTO> {
    const result = await this.binanceBSwapService.getDepositStatus(
      body.depositId,
      this.binanceKeysExtractorService.extractKeysFromRequest(req),
    );
    // 0(0:pending,6: credited but cannot withdraw
    // 7=Wrong Deposit,8=Waiting User confirm, 1:success)
    return {
      executed: result[0].status === 1,
      error: [7].includes(result[0].status)
        ? 'Something went wrong during Binance Deposit'
        : undefined,
      info: result,
    };
  }

  @Post(PAYABLE_ROUTES.depositCEX.depositAddress)
  async getDepositAddress(
    @Req() req,
    @Body() body: CEXFetchDepositAddressDTO,
  ): Promise<CEXDepositAddressDTO> {
    return this.binanceDepositAssetsService.getDepositChainAddress(
      this.binanceKeysExtractorService.extractKeysFromRequest(req),
      body.symbol,
      body.chainIdDB,
    );
  }
}
