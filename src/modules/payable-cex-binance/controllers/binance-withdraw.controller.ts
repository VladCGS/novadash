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
import { PAYABLE_ROUTES } from '../../common/constants/exch-route.constants';
import {
  CEXFetchWithdrawStatusDTO,
  CEXWithdrawGetQuoteDTO,
} from '../../common/dto/payable/payable-cex-withdrawal.requests.dto';
import { BinanceWithdrawalService } from '../services/binance-withdtawal.service';
import { FinalStatusDTO } from '../../common/dto/payable/payable-common.responses.dto';
import { PayableCEXHttpSlugs } from '@app/common/constants/payable-slugs.const';
import { ApiBinanceHeaders } from '@app/common/decorators/cex.decorator';
import {
  CEXWithdrawQuoteDTO,
  CEXWithdrawResultDataDTO,
} from '../../common/dto/payable/payable-cex-withdrawal.responses.dto';
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
export class BinanceWithdrawController {
  constructor(
    private readonly binanceWithdrawalService: BinanceWithdrawalService,
    private readonly binanceKeysExtractorService: BinanceKeysExtractorService,
  ) {}

  @Post(PAYABLE_ROUTES.withdrawalCEX.status)
  async getWithdrawalStatus(
    @Req() req,
    @Body() body: CEXFetchWithdrawStatusDTO,
  ): Promise<FinalStatusDTO> {
    const result = await this.binanceWithdrawalService.getWithdrawStatus(
      body.withdrawId,
      this.binanceKeysExtractorService.extractKeysFromRequest(req),
    );

    // Status - 0(0:Email Sent,1:Cancelled 2:Awaiting Approval 3:Rejected 4:Processing 5:Failure 6:Completed)
    return {
      executed: result[0].status === 6,
      error: result[0].status === 5 ? result[0]?.info : undefined,
      info: result,
    };
  }

  @Post(PAYABLE_ROUTES.withdrawalCEX.quote)
  async getWithdrawalQuote(
    @Req() req,
    @Body() body: CEXWithdrawGetQuoteDTO,
  ): Promise<CEXWithdrawQuoteDTO> {
    return this.binanceWithdrawalService.getWithdrawalQuote(
      body,
      this.binanceKeysExtractorService.extractKeysFromRequest(req),
      {
        ignoreErrors: body.ignoreErrors || false,
      },
    );
  }

  @Post(PAYABLE_ROUTES.withdrawalCEX.call)
  async callWithdraw(
    @Req() req,
    @Body() body: CEXWithdrawGetQuoteDTO,
  ): Promise<CEXWithdrawResultDataDTO> {
    return this.binanceWithdrawalService.withdraw(
      body,
      this.binanceKeysExtractorService.extractKeysFromRequest(req),
    );
  }
}
