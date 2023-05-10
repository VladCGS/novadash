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
  CEXSwapTrackerSetupRangoDTO,
  SwapPaymentDataDTO,
} from '../../common/dto/payable/payable-dex-swap.responses.dto';
import { RangoSwapSellService } from '../services/rango-swap-sell.service';
import { PayableDEXHttpSlugs } from '@app/common/constants/payable-slugs.const';

@Controller(PayableDEXHttpSlugs.RANGO)
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
@ApiTags('EXCHANGE RANGO')
@ApiBearerAuth('JWT')
@Roles(AppRoles.USER)
export class ExchRangoController {
  constructor(private rangoSwapSellService: RangoSwapSellService) {}

  @Post(PAYABLE_ROUTES.swapSell.getQuote)
  @ApiOKResponse('Price for buy tokens', CEXSwapQuoteDTO)
  async getSellQuote(
    @Body() body: DEXSwapSellGetQuoteDTO,
  ): Promise<CEXSwapQuoteDTO> {
    return this.rangoSwapSellService.makeSellQuote(body);
  }

  @Post(PAYABLE_ROUTES.swapSell.getPaymentData)
  @ApiOKResponse(
    'Successfully reserved quote for swap/sell/buy',
    SwapPaymentDataDTO,
  )
  async getSellPaymentData(
    @Body() body: DEXSwapSellGetQuoteDTO,
  ): Promise<SwapPaymentDataDTO<CEXSwapTrackerSetupRangoDTO>> {
    return this.rangoSwapSellService.makeSellPaymentData(body);
  }
}
