import { Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { CheckUserHasWalletsGuard } from '@app/common/guards/check-user-wallets-exist.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  GetDepositFiatsQueryDTO,
  GetExchangesByOnRampPairDTO,
  GetPagePairsForFiatQueryDTO,
} from '../dto/on-ramp-send.requests.dto';
import {
  OnRampFiatsPageDTO,
  OnRampsByFiatCryptoPairDTO,
  PairsForDepositFiatPageDTO,
} from '../dto/on-ramp-send.responses.dto';
import { ExchOnRampUserService } from '../services/exch-on-ramp-user.service';

@Controller('exchanges/on-ramp')
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
@ApiTags('EXCHANGES ON RAMP')
@Roles(AppRoles.USER)
export class OnRampSelectorController {
  constructor(private exchOnRampUserService: ExchOnRampUserService) {}

  @Post('fiats')
  @UseGuards(new CheckUserHasWalletsGuard())
  async getPageFiats(
    @Body() body: GetDepositFiatsQueryDTO,
    @Req() req,
  ): Promise<OnRampFiatsPageDTO> {
    return await this.exchOnRampUserService.getPageFiats(req.userData.id, body);
  }

  @Post('pairs-for-fiat')
  async getPagePairsForFiat(
    @Body() body: GetPagePairsForFiatQueryDTO,
    @Req() req,
  ): Promise<PairsForDepositFiatPageDTO> {
    const { id } = req.userData;
    return await this.exchOnRampUserService.getPairsForFiatPaged(id, body);
  }

  @Post('exchanges-by-pair')
  async getExchangesByOnRampPair(
    @Body() body: GetExchangesByOnRampPairDTO,
  ): Promise<OnRampsByFiatCryptoPairDTO> {
    return await this.exchOnRampUserService.getExchangesByPair(body);
  }
}
