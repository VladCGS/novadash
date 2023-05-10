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
  CEXSwapTrackerSetupDeBridgeDTO,
  SwapPaymentDataDTO,
} from '../../common/dto/payable/payable-dex-swap.responses.dto';
import { CheckIfEnoughNativeBalanceForFeeGuard } from '../guards/check-if-enough-native-balance-for-fee.guard';
import { CheckIfEnoughSellNativeValueForDebridgeFeeGuard } from '../guards/check-if-enough-sell-native-value-for-debridge-fee.guard';
import { DebridgeSwapSellService } from '../services/debridge-swap-sell.service';
import { PayableDEXHttpSlugs } from '@app/common/constants';

@Controller(PayableDEXHttpSlugs.DEBRIGDE)
@UseGuards(
  JWTAuthGuard,
  CheckIfEnoughNativeBalanceForFeeGuard,
  CheckIfEnoughSellNativeValueForDebridgeFeeGuard,
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
@ApiTags('EXCHANGE DEBRIDGE')
@ApiBearerAuth('JWT')
@Roles(AppRoles.USER)
export class ExchDeBridgeController {
  constructor(private exchDebridgeSwapSellService: DebridgeSwapSellService) {}

  @Post(PAYABLE_ROUTES.swapSell.getQuote)
  @ApiOKResponse('Success fetch estimation for deBridge quote', CEXSwapQuoteDTO)
  async getSellQuote(
    @Body() { buy, sell }: DEXSwapSellGetQuoteDTO,
  ): Promise<CEXSwapQuoteDTO> {
    return this.exchDebridgeSwapSellService.makeSellQuote(sell, buy);
  }

  @Post(PAYABLE_ROUTES.swapSell.getPaymentData)
  @ApiOKResponse(
    'Success fetch payment data for deBridge quote',
    SwapPaymentDataDTO,
  )
  async getSellPaymentData(
    @Body() { sell, buy }: DEXSwapSellGetQuoteDTO,
  ): Promise<SwapPaymentDataDTO<CEXSwapTrackerSetupDeBridgeDTO>> {
    return this.exchDebridgeSwapSellService.makeSellPaymentData(sell, buy);
  }
}
