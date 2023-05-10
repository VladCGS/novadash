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
  OffRampBuyGetPaymentDataDTO,
  OffRampBuyGetQuoteDTO,
  OffRampSellGetPaymentDataDTO,
  OffRampSellGetQuoteDTO,
} from '../../common/dto/payable/payable-off-ramp.requests.dto';
import { OffRampQuoteDTO } from '../../common/dto/payable/payable-off-ramp.responses.dto';
import { RampPaymentDataDTO } from '../../common/dto/payable/payable-ramp-common.dto';
import { TransakQuoteService } from '../services/transak-quote.service';
import { TransakWidgetLinkService } from '../services/transak-widget-link.service';

@Controller('exch-transak')
@ApiTags('EXCHANGE TRANSAK off ramp')
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
export class ExchTransakOffRampController {
  constructor(
    private readonly transakQuoteService: TransakQuoteService,
    private readonly transakWidgetLinkService: TransakWidgetLinkService,
  ) {}

  @Post(PAYABLE_ROUTES.offRampBuy.getQuote)
  @ApiOKResponse('Successfully on ramp quote', OffRampQuoteDTO)
  async getOffRampBuyQuote(
    @Body() body: OffRampBuyGetQuoteDTO,
  ): Promise<OffRampQuoteDTO> {
    return this.transakQuoteService.getQuoteOffRamp(body);
  }

  @Post(PAYABLE_ROUTES.offRampBuy.getPaymentData)
  @ApiOKResponse('Successfully fetched reservation info', RampPaymentDataDTO)
  async getOffRampBuyPaymentData(
    @Body() body: OffRampBuyGetPaymentDataDTO,
    @Req() req,
  ): Promise<RampPaymentDataDTO> {
    return this.transakWidgetLinkService.formPaymentUrlOffRamp({
      body,
      userId: req.userData.id,
    });
  }

  @Post(PAYABLE_ROUTES.offRampSell.getQuote)
  @ApiOKResponse('Successfully fetched reservation info', OffRampQuoteDTO)
  async getOffRampSellQuote(
    @Body() body: OffRampSellGetQuoteDTO,
  ): Promise<OffRampQuoteDTO> {
    return this.transakQuoteService.getQuoteOffRamp(body);
  }

  @Post(PAYABLE_ROUTES.offRampSell.getPaymentData)
  @ApiOKResponse('Successfully fetched reservation info', RampPaymentDataDTO)
  async getOffRampSellPaymentData(
    @Body()
    body: OffRampSellGetPaymentDataDTO,
    @Req() req,
  ): Promise<RampPaymentDataDTO> {
    return this.transakWidgetLinkService.formPaymentUrlOffRamp({
      body,
      userId: req.userData.id,
    });
  }
}
