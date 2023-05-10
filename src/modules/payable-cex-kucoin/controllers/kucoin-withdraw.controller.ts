import { Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PAYABLE_ROUTES } from '../../common/constants/exch-route.constants';
import {
  CEXFetchWithdrawStatusDTO,
  CEXWithdrawGetQuoteDTO,
} from '../../common/dto/payable/payable-cex-withdrawal.requests.dto';
import { PayableCEXHttpSlugs } from '@app/common/constants/payable-slugs.const';
import { ApiKucoinHeaders } from '@app/common/decorators/cex.decorator';
import { KucoinWithdrawService } from '../services/kucoin-withdraw.service';
import { FinalStatusDTO } from '../../common/dto/payable/payable-common.responses.dto';
import { KucoinKeysExtractorService } from '../services/kucoin-keys-extractor.service';
import {
  CEXWithdrawQuoteDTO,
  CEXWithdrawResultDataDTO,
} from '../../common/dto/payable/payable-cex-withdrawal.responses.dto';
import { KucoinWithdrawQuoteService } from '../services/kucoin-withdraw-quote.service';
import { CheckCEXApiKeyAuthGuard } from '@app/common/guards/check-cex-api-key-auth-guard.service';
import { KUCOIN_HEADER_KEYS } from '@app/common/constants/cex-header-keys-names.const';
import { CheckKucoinRequestedChainGuard } from '../guards/check-kucoin-requested-chain.guard';

@Controller(PayableCEXHttpSlugs.KUCOIN)
@ApiTags('PAYABLE Kucoin')
@ApiKucoinHeaders()
@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
  new CheckCEXApiKeyAuthGuard(Object.values(KUCOIN_HEADER_KEYS)),
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
export class KucoinWithdrawController {
  constructor(
    private readonly kucoinWithdrawService: KucoinWithdrawService,
    private readonly kucoinWithdrawQuoteService: KucoinWithdrawQuoteService,
    private readonly kucoinKeysExtractorService: KucoinKeysExtractorService,
  ) {}

  @Post(PAYABLE_ROUTES.withdrawalCEX.status)
  async getWithdrawalStatus(
    @Req() req,
    @Body() body: CEXFetchWithdrawStatusDTO,
  ): Promise<FinalStatusDTO> {
    const keys = this.kucoinKeysExtractorService.extractKeysFromRequest(req);

    return this.kucoinWithdrawService.getWithdrawalStatus(keys, body);
  }

  @Post(PAYABLE_ROUTES.withdrawalCEX.quote)
  @UseGuards(
    new CheckKucoinRequestedChainGuard({
      field: ['chainId'],
      findIn: 'body',
    }),
  )
  async getWithdrawalQuote(
    @Req() req,
    @Body() body: CEXWithdrawGetQuoteDTO,
  ): Promise<CEXWithdrawQuoteDTO> {
    const keys = this.kucoinKeysExtractorService.extractKeysFromRequest(req);

    return this.kucoinWithdrawQuoteService.formWithdrawQuote(keys, body);
  }

  @Post(PAYABLE_ROUTES.withdrawalCEX.call)
  @UseGuards(
    new CheckKucoinRequestedChainGuard({
      field: ['chainId'],
      findIn: 'body',
    }),
  )
  async callWithdraw(
    @Req() req,
    @Body() body: CEXWithdrawGetQuoteDTO,
  ): Promise<CEXWithdrawResultDataDTO> {
    const keys = this.kucoinKeysExtractorService.extractKeysFromRequest(req);

    return this.kucoinWithdrawService.callWithdraw(keys, body);
  }
}
