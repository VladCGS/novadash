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
import { CoinPriceService } from '@app/common/modules/coin-price/coin-price.service';
import { DataAnalyticsAssetService } from '@app/common/modules/data-analytics-asset/services/data.analytics-asset.service';
import { DataAnalyticsUserService } from '@app/common/modules/data-analytics-user/services/data.analytics-user.service';
import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';
import { DataTransactionAssetsService } from '@app/common/modules/data-transaction/services/data.transaction-assets.service';
import { DataWalletService } from '@app/common/modules/data-wallet/services/data.wallet.service';
import { AppRoles } from '@app/common/types';
import { OrderKeywordsEnum } from '@app/common/types/common.types';
import { calcChanges } from '@app/common/utils/calc-changes.util';
import { emptyPagedResult } from '@app/common/utils/empty-paged-result.util';
import { sortByOrderAndKey } from '@app/common/utils/sort-by-order-and-key.util';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Get, Query } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  GetOneUserAssetWalletsBalancesQueryDTO,
  UserAssetsPageQueryDTO,
  UserTokenAnalyticRequestDTO,
  UserWalletsWithAssetsListRequestDTO,
} from '../dto/user-assets-requests.dto';
import {
  OneUserAssetWalletsBalancesListDTO,
  UserAssetChainDTO,
  UserAssetsListDTO,
  UserAssetWithMetaAndChainDTO,
  UserAssetWithMetaAndWalletDTO,
  UserAssetWithWalletDTO,
  UserTokenAnalyticResponseDTO,
  UserWalletStatisticsDTO,
  UserWalletsWithAssetsListDTO,
} from '../dto/user-assets-responses.dto';
import { UserAssetsTokenAnalyticsService } from '../services/user-assets-token-analytics.service';
import { UserAssetsService } from '../services/user-assets.service';
import {
  UserAssetsOrderByEnum,
  UserAssetWalletsBalancesOrderByEnum,
  UserWalletsWithAssetsOrderByEnum,
} from '../types/user-assets.types';
import {
  formAnalyticsAssetToUserAsset,
  formChain as formChainToUserAssetMeta,
  formTransactionAssetToUserAssetMeta,
  formWalletStatistics,
  formWalletToUserAssetWalletBalances as formWalletToUserAssetMeta,
} from '../utils/user-asset-formaters.util';

@Controller('user')
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
@ApiTags('user (assets)')
export class UserAssetsController {
  constructor(
    private userAssetsService: UserAssetsService,
    private coinPriceService: CoinPriceService,
    private walletDataService: DataWalletService,
    private dataTransactionAssetsService: DataTransactionAssetsService,
    private analyticsAssetDataService: DataAnalyticsAssetService,
    private dataAnalyticsUserService: DataAnalyticsUserService,
    private dataChainService: DataChainService,
    private userAssetsTokenAnalyticsService: UserAssetsTokenAnalyticsService,
  ) {}

  @Post('assets')
  @ApiOKResponse(
    'This route will return list of available assets and information about them',
    UserAssetsListDTO,
  )
  async getUserAssets(
    @Req() req,
    @Body() options: UserAssetsPageQueryDTO,
  ): Promise<UserAssetsListDTO> {
    const { id: userId } = req.userData;
    const {
      orderBy = UserAssetsOrderByEnum.USD_TOKEN_PRICE,
      orderType = OrderKeywordsEnum.DESC,
      page = 1,
      size = 10,
      search = '',
    } = options;

    const analyticsUser =
      await this.dataAnalyticsUserService.findLastByUserIdWithWalletsAndAssetsOrFail(
        userId,
      );

    if (!analyticsUser) {
      throw new HttpException(
        'No analytics user was found',
        HttpStatus.NOT_FOUND,
      );
    }

    const foundTransactionAssets =
      await this.dataTransactionAssetsService.findAddressesBySearch({
        userId,
        search,
      });

    const assetAddresses = foundTransactionAssets.map((ta) => ta.tokenAddress);

    if (!assetAddresses.length) {
      throw new HttpException(
        'No analytics user was found',
        HttpStatus.NOT_FOUND,
      );
    }

    const foundAnalyticsAssetsPaged =
      await this.analyticsAssetDataService.findByUserIdAndSearchPaged({
        analyticsUserId: analyticsUser.id,
        orderBy,
        orderType,
        assetAddresses,
        page,
        size,
        search,
      });

    const foundAnalyticsAssetsTotal =
      await this.analyticsAssetDataService.countByUserIdAndSearchQuery({
        analyticsUserId: analyticsUser.id,
        assetAddresses,
        search,
      });

    const total = Number(foundAnalyticsAssetsTotal.count);
    const pages = Math.ceil(total / size);

    const accumUserAssets: UserAssetWithMetaAndChainDTO[] = [];

    for (const analyticsAsset of foundAnalyticsAssetsPaged) {
      const {
        usdTokenPriceAvg,
        usdBalanceBasic,
        quantityBalance,
        assetAddress,
        chainSlug,
        usdTokenPrice: cachedUsdTokenPrice,
      } = analyticsAsset;

      const chain = await Chain.findOne({ where: { slug: chainSlug } });

      if (!chain) continue;

      const assetPrice = await this.coinPriceService.findEVMOrSaveAndReturn({
        tokenAddress: assetAddress,
        chain,
      });

      const userAssetMetadata =
        await this.userAssetsService.getUserAssetMetadata({
          assetAddress,
          chainId: chain.id,
        });

      if (!userAssetMetadata) continue;

      const { name, symbol, image } = userAssetMetadata;

      const {
        usdTokenPrice,
        usdBalance,
        usdProfitLossChanges,
        usdProfitLossPercentChanges,
      } = this.userAssetsService.calculateBalanceNumbers({
        usdPrice: Number(assetPrice?.usdPrice) ?? 0,
        cachedUsdTokenPrice,
        quantityBalance,
        usdBalanceBasic,
      });

      const formatedChain: UserAssetChainDTO = {
        id: chain.id,
        image: chain.image,
        name: chain.name,
        slug: chain.slug,
      };

      const formatedAsset: UserAssetWithMetaAndChainDTO = {
        image,
        symbol,
        name,
        usdTokenPriceAvg,
        usdTokenPrice,
        usdProfitLossChanges,
        usdProfitLossPercentChanges,
        usdBalance,
        quantityBalance,
        usdBalanceBasic,
        assetAddress,
        chain: formatedChain,
      };

      accumUserAssets.push(formatedAsset);
    }

    if (!foundAnalyticsAssetsPaged.length) {
      return emptyPagedResult({ page, size });
    }

    return {
      page,
      size,
      total,
      pages,
      result: accumUserAssets,
    };
  }

  @Post('assets/one-with-wallets-balances')
  @ApiOKResponse(
    'This route will return list of available assets and information about them',
    OneUserAssetWalletsBalancesListDTO,
  )
  async getOneUserAssetWalletsBalances(
    @Req() req,
    @Body() body: GetOneUserAssetWalletsBalancesQueryDTO,
  ): Promise<OneUserAssetWalletsBalancesListDTO> {
    const { id: userId } = req.userData;
    const {
      assetAddress,
      chainId,
      orderBy = UserAssetWalletsBalancesOrderByEnum.ASSET_QUANTITY,
      orderType = OrderKeywordsEnum.DESC,
    } = body;

    const foundChain = await this.dataChainService.findOneByIdOrFail(chainId);

    const foundAnalyticsUserLastByUserIdWithWalletsAndAssets =
      await this.dataAnalyticsUserService.findLastByUserIdWithWalletsAndAssetsOrFail(
        {
          userId,
          assetAddress,
          chainSlug: foundChain.slug,
        },
      );

    const foundAnalyticsWallets =
      foundAnalyticsUserLastByUserIdWithWalletsAndAssets.analyticsWallets;

    if (!foundAnalyticsWallets.length) return { result: [] };

    const accumUserAssetsWalletsBalances: UserAssetWithWalletDTO[] = [];

    const foundPriceData = await this.coinPriceService.findEVMOrSaveAndReturn({
      tokenAddress: assetAddress,
      chain: foundAnalyticsWallets[0].wallet.chain,
    });

    for (const analyticsWallet of foundAnalyticsWallets) {
      const formedUserAssetWallet = formWalletToUserAssetMeta(
        analyticsWallet.wallet,
      );

      const analyticsAssetsInWallet = analyticsWallet.analyticsAssets[0];

      const formedUserAsset = formAnalyticsAssetToUserAsset(
        analyticsAssetsInWallet,
        Number(foundPriceData?.usdPrice) || 0,
      );

      const foundTransactionAsset =
        await this.dataTransactionAssetsService.findOneByAddressAndWalletIdOrFail(
          {
            assetAddress: analyticsAssetsInWallet.assetAddress,
            walletId: formedUserAssetWallet.id,
          },
        );

      const formedUserAssetMeta = formTransactionAssetToUserAssetMeta(
        foundTransactionAsset,
      );

      const hhh: UserAssetWithMetaAndWalletDTO = {
        wallet: formedUserAssetWallet,
        ...formedUserAssetMeta,
        ...formedUserAsset,
      };

      accumUserAssetsWalletsBalances.push(hhh);
    }

    sortByOrderAndKey(accumUserAssetsWalletsBalances, orderType, orderBy);

    return { result: accumUserAssetsWalletsBalances };
  }

  @Post('assets/wallet-statistics')
  @ApiOKResponse(
    'This route will return user wallets and assets on them with some statistics',
    UserWalletsWithAssetsListDTO,
  )
  async getWalletsStatistics(
    @Req() req,
    @Body() body: UserWalletsWithAssetsListRequestDTO,
  ): Promise<UserWalletsWithAssetsListDTO> {
    const userId = req.userData.id;
    const {
      orderBy = UserWalletsWithAssetsOrderByEnum.USD_BALANCE,
      orderType = OrderKeywordsEnum.DESC,
      search = '',
    } = body;

    const foundAnalyticsUser =
      await this.dataAnalyticsUserService.findLastByUserIdAndSearchWithWalletsAndAssets(
        { userId, search },
      );

    const foundAnalyticsWallets = foundAnalyticsUser.analyticsWallets;

    const accumWalletStatistics: UserWalletStatisticsDTO[] = [];

    for (const analyticWallet of foundAnalyticsWallets) {
      const wallet = analyticWallet.wallet;

      const foundAnalyticsWallet = foundAnalyticsUser.analyticsWallets[0];
      const foundAnalyticsAssets = foundAnalyticsWallet.analyticsAssets;

      const formedWallet = formWalletToUserAssetMeta(wallet);
      const formedChain = formChainToUserAssetMeta(wallet.chain);

      const { usdBalance, usdBalanceBasic } =
        await this.userAssetsService.calcThroughAnalyticsAssets({
          assets: foundAnalyticsAssets,
          chain: wallet.chain,
        });

      const { usdProfitLossChanges, usdProfitLossPercentChanges } = calcChanges(
        {
          valueCurrent: usdBalance,
          valuePast: usdBalanceBasic,
          keyNameStarter: 'usdProfitLoss',
        },
      );

      const quantityOfAsset = foundAnalyticsAssets.length;

      const formedWalletStatistics = formWalletStatistics({
        chain: formedChain,
        wallet: formedWallet,
        statistics: {
          usdProfitLossPercentChanges,
          usdProfitLossChanges,
          quantityOfAsset,
          usdBalanceBasic,
          usdBalance,
        },
      });

      accumWalletStatistics.push(formedWalletStatistics);
    }

    sortByOrderAndKey(accumWalletStatistics, orderType, orderBy);

    return {
      result: accumWalletStatistics,
    };
  }

  @Get('assets/token-analytics-through-days')
  @UseGuards(
    new CheckIdValidGuard({
      field: ['chainId'],
      findIn: 'query',
    }),
    new CheckRecordFieldExistGuard([
      {
        Entity: Chain,
        dataSource: 'query',
        entityField: 'id',
        sourceField: 'chainId',
      },
    ]),
    new CheckTokenWithChainExists({
      dataSource: 'query',
      tokenAddressField: ['tokenAddress'],
      chainDBIdField: ['chainId'],
    }),
  )
  @ApiOKResponse(
    'This route will return user token analytics',
    UserTokenAnalyticResponseDTO,
  )
  async getTokenAnalyticsThroughDays(
    @Req() req,
    @Query() queryConfig: UserTokenAnalyticRequestDTO,
  ): Promise<UserTokenAnalyticResponseDTO> {
    const userId = req.userData.id;

    return this.userAssetsTokenAnalyticsService.getTokenAnalyticsThroughDays(
      queryConfig,
      userId,
    );
  }
}
