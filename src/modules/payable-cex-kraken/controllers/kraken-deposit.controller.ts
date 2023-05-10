import { Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PAYABLE_ROUTES } from '../../common/constants/exch-route.constants';
import { ApiKrakenHeaders } from '@app/common/decorators/cex.decorator';
import { PayableCEXHttpSlugs } from '@app/common/constants/payable-slugs.const';
import { FinalStatusDTO } from '../../common/dto/payable/payable-common.responses.dto';

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
export class KrakenDepositController {
  constructor() {}

  // @param depositId - for Kraken is deposit transactionHash
  @Get(PAYABLE_ROUTES.depositCEX.status)
  async getDepositStatus(
    @Req() req,
    @Param('depositId') depositId: string,
  ): Promise<FinalStatusDTO> {
    // 0(0:pending,6: credited but cannot withdraw
    // 7=Wrong Deposit,8=Waiting User confirm, 1:success)
    return {
      executed: false,
      info: null,
    };
  }
}
