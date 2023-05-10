import { Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import { Chain } from '@app/common/entities/transactions';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckBinanceAPIKeyPermissionsGuard } from '../../payable-cex-binance/guards/check-binance-api-key-permissions.guard';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WalletPayableService } from '../../wallet/services/wallet-payable.service';
import {
  FetchDestinationHotWalletsDTO,
  FetchDestinationSpotWalletsDTO,
} from '../dto/trade-common-requests.dto';
import {
  HotWalletMetaDTO,
  SpotWalletDestinationMetaDTO,
} from '../dto/trade-common-responses.dto';
import { SpotDestinationsService } from '../services/spot-destinations.service';
import { ApiBinanceHeaders } from '@app/common/decorators/cex.decorator';
import { ApiKucoinHeaders } from '../../../../../../libs/common/src/decorators/cex.decorator';

@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
  new CheckIdValidGuard({
    field: ['id'],
    findIn: 'userData',
  }),
  new CheckRecordFieldExistGuard([
    {
      isFieldOptional: true,
      sourceField: 'id',
      Entity: User,
      entityField: 'id',
      dataSource: 'userData',
    },
  ]),
  CheckBinanceAPIKeyPermissionsGuard,
)
@Roles(AppRoles.USER)
@Controller('exchanges/user-wallets/destination')
@ApiTags('EXCHANGE TRANSFER destination')
export class DestinationWalletsController {
  constructor(
    private spotDestinationsService: SpotDestinationsService,
    private walletExchangeService: WalletPayableService,
  ) {}

  @Post('/spot')
  @ApiBinanceHeaders()
  @ApiKucoinHeaders()
  @UseGuards(
    new CheckIdValidGuard({
      field: ['chainId'],
      findIn: 'body',
    }),
    new CheckRecordFieldExistGuard([
      {
        dataSource: 'body',
        sourceField: 'chainId',
        Entity: Chain,
        entityField: 'id',
      },
    ]),
  )
  async getSpotWallets(
    @Req() req,
    @Body() body: FetchDestinationSpotWalletsDTO,
  ): Promise<SpotWalletDestinationMetaDTO[]> {
    return this.spotDestinationsService.getAll(body, req);
  }

  @Post('/hot')
  @UseGuards(
    new CheckIdValidGuard({
      isFieldOptional: true,
      isFieldArray: true,
      field: ['chainIds'],
      findIn: 'body',
    }),
    new CheckRecordFieldExistGuard([
      {
        isFieldOptional: true,
        isFieldArray: true,
        sourceField: 'chainIds',
        Entity: Chain,
        entityField: 'id',
        dataSource: 'body',
      },
    ]),
  )
  async getHotWallets(
    @Req() req,
    @Body() body: FetchDestinationHotWalletsDTO,
  ): Promise<HotWalletMetaDTO[]> {
    const { id } = req.userData;

    return this.walletExchangeService.getHotWalletsDestinationsByChainIds({
      userId: id,
      chainIds: body.chainIds,
      excludeWalletId: body.excludeWalletId,
    });
  }
}
