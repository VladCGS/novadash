import { ApiOKResponse, Roles } from '@app/common/decorators';
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
  OnRampBuyGetPaymentDataDTO,
  OnRampBuyGetQuoteDTO,
  OnRampSellGetPaymentDataDTO,
  OnRampSellGetQuoteDTO,
} from '../../common/dto/payable/payable-on-ramp.requests.dto';
import { OnRampQuoteDTO } from '../../common/dto/payable/payable-on-ramp.responses.dto';
import { RampPaymentDataDTO } from '../../common/dto/payable/payable-ramp-common.dto';
import { TransakQuoteService } from '../services/transak-quote.service';
import { TransakWidgetLinkService } from '../services/transak-widget-link.service';

@Controller('exch-transak')
@ApiTags('EXCHANGE TRANSAK on ramp')
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
@ApiBearerAuth('JWT')
@Roles(AppRoles.USER)
export class ExchTransakOnRampController {
  constructor(
    private readonly transakQuoteService: TransakQuoteService,
    private readonly transakWidgetLinkService: TransakWidgetLinkService,
  ) {}

  @Post(PAYABLE_ROUTES.onRampBuy.getQuote)
  @ApiOKResponse('Successfully fetched reservation info', OnRampQuoteDTO)
  async getOnRampBuyQuote(
    @Body() body: OnRampBuyGetQuoteDTO,
  ): Promise<OnRampQuoteDTO> {
    return this.transakQuoteService.getQuoteOnRamp(body);
  }

  @Post(PAYABLE_ROUTES.onRampBuy.getPaymentData)
  @ApiOKResponse('Successfully fetched reservation info', RampPaymentDataDTO)
  async getOnRampBuyPaymentData(
    @Body() body: OnRampBuyGetPaymentDataDTO,
    @Req() req,
  ): Promise<RampPaymentDataDTO> {
    return this.transakWidgetLinkService.formPaymentUrlOnRamp({
      body,
      userId: req.userData.id,
    });
  }

  @Post(PAYABLE_ROUTES.onRampSell.getQuote)
  @ApiOKResponse('Successfully fetched reservation info', OnRampQuoteDTO)
  async getOnRampSellQuote(
    @Body() body: OnRampSellGetQuoteDTO,
  ): Promise<OnRampQuoteDTO> {
    return this.transakQuoteService.getQuoteOnRamp(body);
  }

  @Post(PAYABLE_ROUTES.onRampSell.getPaymentData)
  @ApiOKResponse('Successfully fetched reservation info', RampPaymentDataDTO)
  async getOnRampSellPaymentData(
    @Body()
    body: OnRampSellGetPaymentDataDTO,
    @Req() req,
  ): Promise<RampPaymentDataDTO> {
    return this.transakWidgetLinkService.formPaymentUrlOnRamp({
      body,
      userId: req.userData.id,
    });
  }
}
