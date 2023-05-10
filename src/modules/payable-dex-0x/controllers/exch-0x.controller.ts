import { ApiOKResponse, Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PAYABLE_ROUTES } from '../../common/constants/exch-route.constants';
import { DEXSwapSellGetQuoteDTO } from '../../common/dto/payable/payable-dex-swap.requests.dto';
import {
  CEXSwapQuoteDTO,
  SwapPaymentDataDTO,
} from '../../common/dto/payable/payable-dex-swap.responses.dto';
import { Exch0xService } from '../services/exch-0x.service';
import { Pure0xService } from '../services/pure-0x.service';
import { Zero0xSwapSellService } from '../services/zero0x-swap-sell.service';
import { PayableDEXHttpSlugs } from '@app/common/constants';

@Controller(PayableDEXHttpSlugs.ZEROEX)
@ApiTags('EXCHANGE 0x')
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
export class Exch0xController {
  constructor(
    private exch0xService: Exch0xService,
    private pure0xService: Pure0xService,
    private zero0xSwapSellService: Zero0xSwapSellService,
  ) {}

  @Post(PAYABLE_ROUTES.swapSell.getQuote)
  @ApiOKResponse('Successfully fetched quote', CEXSwapQuoteDTO)
  async getSellQuote(
    @Body() body: DEXSwapSellGetQuoteDTO,
  ): Promise<CEXSwapQuoteDTO> {
    return this.zero0xSwapSellService.makeSellQuote(body);
  }

  @Post(PAYABLE_ROUTES.swapSell.getPaymentData)
  @ApiOKResponse('Successfully reserved quote for sell', SwapPaymentDataDTO)
  async getSellPaymentData(
    @Body() body: DEXSwapSellGetQuoteDTO,
  ): Promise<SwapPaymentDataDTO> {
    return this.zero0xSwapSellService.makeSellPaymentData(body);
  }
}
