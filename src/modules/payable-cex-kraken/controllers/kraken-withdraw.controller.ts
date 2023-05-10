import { KRAKEN_HEADER_KEYS } from '@app/common/constants/cex-header-keys-names.const';
import { Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PAYABLE_ROUTES } from '../../common/constants/exch-route.constants';
import { CEXWithdrawGetQuoteDTO } from '../../common/dto/payable/payable-cex-withdrawal.requests.dto';
import { PayableCEXHttpSlugs } from '@app/common/constants/payable-slugs.const';
import { ApiKrakenHeaders } from '@app/common/decorators/cex.decorator';

@Controller(PayableCEXHttpSlugs.KRAKEN)
@ApiTags('EXCH BINANCE')
@ApiKrakenHeaders()
@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
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
export class KrakenWithdrawController {
  constructor() {}

  @Get(PAYABLE_ROUTES.withdrawalCEX.status)
  async getWithdrawalStatus(
    @Req() req,
    @Param('withdrawId') withdrawId: string,
  ): Promise<void> {
    const apiKey = req.headers[KRAKEN_HEADER_KEYS.KEY];
    const apiSecret = req.headers[KRAKEN_HEADER_KEYS.SECRET];

    // Status - 0(0:Email Sent,1:Cancelled 2:Awaiting Approval 3:Rejected 4:Processing 5:Failure 6:Completed)
    return;
  }

  @Post(PAYABLE_ROUTES.withdrawalCEX.quote)
  async getWithdrawalQuote(
    @Req() req,
    @Body() body: CEXWithdrawGetQuoteDTO,
  ): Promise<void> {
    const apiKey = req.headers[KRAKEN_HEADER_KEYS.KEY];
    const apiSecret = req.headers[KRAKEN_HEADER_KEYS.SECRET];

    return;
  }

  @Post(PAYABLE_ROUTES.withdrawalCEX.call)
  async callWithdraw(
    @Req() req,
    @Body() body: CEXWithdrawGetQuoteDTO,
  ): Promise<void> {
    const apiKey = req.headers[KRAKEN_HEADER_KEYS.KEY];
    const apiSecret = req.headers[KRAKEN_HEADER_KEYS.SECRET];

    return;
  }
}
