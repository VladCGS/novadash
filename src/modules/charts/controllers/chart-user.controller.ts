import { ApiOKResponse, Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import { Chain } from '@app/common/entities/transactions';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { CheckTokenWithChainExists } from '@app/common/guards/check-token-with-chain-exists.guar';
import { CheckUserStatusAnalyticsGuard } from '@app/common/guards/check-user-status-analytics.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  FormTokenChartDTO,
  FormUserTokenChartDTO,
  TradeAssetChartPeriodsEnum,
} from '../dtos/chart-user-requests.dto';
import { TokenChartDTO } from '../dtos/chart-user-responses.dto';
import { ChartTokenService } from '../services/chart-token.service';
import { ChartUserService } from '../services/chart-user.service';

@Controller('charts')
@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
  new CheckIdValidGuard({
    field: ['chainId'],
    findIn: 'body',
  }),
  new CheckRecordFieldExistGuard([
    {
      Entity: Chain,
      dataSource: 'body',
      entityField: 'id',
      sourceField: 'chainId',
    },
  ]),
  new CheckTokenWithChainExists({
    dataSource: 'body',
    tokenAddressField: ['tokenAddress'],
    chainDBIdField: ['chainId'],
  }),
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
@ApiTags('charts')
@Roles(AppRoles.USER)
export class ChartUserController {
  constructor(
    private chartTokenService: ChartTokenService,
    private chartUserService: ChartUserService,
  ) {}

  @Post('token-chart')
  @ApiOKResponse('Successfully fetched chart', TokenChartDTO)
  formTokenChart(
    @Req() req,
    @Body() body: FormTokenChartDTO,
  ): Promise<TokenChartDTO> {
    const userId = req.userData.id;

    if (body.mode === TradeAssetChartPeriodsEnum.ALL) {
      return this.chartTokenService.formTokenChartForTotalUserInterval(
        body,
        userId,
      );
    } else {
      return this.chartTokenService.formTokenChart(body, userId);
    }
  }

  @Post('user-chart/token-avg')
  @UseGuards(new CheckUserStatusAnalyticsGuard())
  @ApiOKResponse('Successfully fetched chart', TokenChartDTO)
  formTokenAvgChartForUser(
    @Body() body: FormUserTokenChartDTO,
    @Req() req,
  ): Promise<TokenChartDTO> {
    const userId = req.userData.id;

    if (body.mode === TradeAssetChartPeriodsEnum.ALL) {
      return this.chartUserService.formTokenAvgChartForTotalUserInterval(
        body,
        userId,
      );
    } else {
      return this.chartUserService.formTokenAvgChartForUser(body, userId);
    }
  }
}
