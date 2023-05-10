import { Roles } from '@app/common/decorators';
import { PlatformCoin, User } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckBinanceAPIKeyPermissionsGuard } from '../../payable-cex-binance/guards/check-binance-api-key-permissions.guard';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  PricedHotWalletNativeBalanceDTO,
  PricedHotWalletWithBalancesDTO,
  PricedSpotWalletWithBalancesDTO,
} from '../dto/trade-common-responses.dto';
import { UserHotWalletPricedBalancesService } from '../services/user-hot-wallets-priced-balances.service';
import {
  FetchHotWalletsPricedNativeBalanceDTO,
  FetchSelectorHotPricedWalletsDTO,
} from '../dto/priced-wallets-selector.requests.dto';
import { UserHotWalletPricedNativeBalanceService } from '../services/user-hot-wallets-priced-native-balance.service';
import { OrderNativePricedHotWallets } from '../types/orders.enum';
import { OrderKeywordsEnum } from '@app/common/types/common.types';
import {
  ApiBinanceHeaders,
  ApiKucoinHeaders,
} from '@app/common/decorators/cex.decorator';
import { UserSpotWalletsService } from '../services/user-spot-wallets.service';

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
      sourceField: 'id',
      Entity: User,
      entityField: 'id',
      dataSource: 'userData',
    },
  ]),
  CheckBinanceAPIKeyPermissionsGuard,
)
@Roles(AppRoles.USER)
@Controller('exchanges/user-wallets/priced')
@ApiTags('EXCHANGE priced wallets selector')
export class PricedWalletsSelectorController {
  constructor(
    private userHotWalletPricedNativeBalanceService: UserHotWalletPricedNativeBalanceService,
    private userHotWalletPricedBalancesService: UserHotWalletPricedBalancesService,
    private userSpotWalletsService: UserSpotWalletsService,
  ) {}

  @UseGuards(
    new CheckRecordFieldExistGuard([
      {
        isFieldOptional: true,
        isFieldArray: true,
        sourceField: 'platformCoinsIds',
        Entity: PlatformCoin,
        entityField: 'id',
        dataSource: 'body',
      },
    ]),
  )
  @Post('/hot')
  async getPricedHotWallets(
    @Req() req,
    @Body() body: FetchSelectorHotPricedWalletsDTO,
  ): Promise<PricedHotWalletWithBalancesDTO[]> {
    const { id } = req.userData;

    const walletsHot: PricedHotWalletWithBalancesDTO[] = [];

    // WARNING
    // This method calculates whole wallet USD balance only by filtered tokens
    // e.g. Balances were filtered by options (10 balances -> 5 balances)
    // Wallet usdBalance will be calculated by summarizing 5 balances, but not 10
    const pricedWallet =
      await this.userHotWalletPricedBalancesService.getAllPriced(id, body);

    if (pricedWallet) {
      walletsHot.push(...pricedWallet);
    }

    return walletsHot;
  }

  @Post('/hot-natives-only')
  async getPricedHotWalletsNativeBalances(
    @Req() req,
    @Body() body: FetchHotWalletsPricedNativeBalanceDTO,
  ): Promise<PricedHotWalletNativeBalanceDTO[]> {
    const { id } = req.userData;

    const walletsHot: PricedHotWalletNativeBalanceDTO[] =
      await this.userHotWalletPricedNativeBalanceService.getAllPriced(id, {
        onlyChainIds: body?.chainIds,
      });

    const orderBy = body?.orderBy || OrderNativePricedHotWallets.USD_BALANCE;
    const orderType = body?.orderType || OrderKeywordsEnum.ASC;

    return this.userHotWalletPricedNativeBalanceService.sortByCriteria(
      walletsHot,
      orderBy,
      orderType,
    );
  }

  @ApiBinanceHeaders()
  @ApiKucoinHeaders()
  @Get('/spot')
  async getPricedSpotWallets(
    @Req() req,
  ): Promise<PricedSpotWalletWithBalancesDTO[]> {
    const { id } = req.userData;

    return this.userSpotWalletsService.getAll(id, req);
  }
}
