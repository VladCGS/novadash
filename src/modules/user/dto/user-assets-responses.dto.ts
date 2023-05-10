import { PagedResultDTO } from '@app/common/modules/common/types/http-response.types';
import { ChainSlugs } from '@app/common/types/chain.types';
import { extender } from '@app/common/utils/class-extender.util';
import { ApiProperty } from '@nestjs/swagger';
import { SupportedWalletProviders } from '@app/common/entities/transactions';
import { IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import {
  TokenAnalyticChangesDTO,
  TokenAnalyticFromAssetDTO,
} from './user-assets-common.dto';

export class UserAssetChainDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    nullable: true,
  })
  image: string | null;

  @ApiProperty()
  slug: ChainSlugs;
}

export class UserAssetWalletChainDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    nullable: true,
  })
  image: string | null;
}

export class UserAssetWalletDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  provider: SupportedWalletProviders;

  @ApiProperty({
    nullable: true,
  })
  image: string | null;

  @ApiProperty()
  chain: UserAssetWalletChainDTO;

  @ApiProperty()
  address: string;
}

export class UserAssetMetaDTO {
  @ApiProperty({
    nullable: true,
  })
  image: string | null;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  decimals: number;
}

export class UserAssetWithChainDTO {
  @ApiProperty()
  chain: UserAssetChainDTO;
}

export class UserAssetWithWalletDTO {
  @ApiProperty()
  wallet: UserAssetWalletDTO;
}

export class UserAssetBaseDTO {
  @ApiProperty()
  usdBalance: number;

  @ApiProperty()
  usdBalanceBasic: number;

  @ApiProperty()
  usdTokenPrice: number;

  @ApiProperty()
  usdTokenPriceAvg: number;

  @ApiProperty()
  usdProfitLossChanges: number;

  @ApiProperty()
  usdProfitLossPercentChanges: number;

  @ApiProperty()
  assetAddress: string;

  @ApiProperty()
  quantityBalance: number;
}

export class UserAssetWithMeta extends extender(
  UserAssetBaseDTO,
  UserAssetMetaDTO,
) {}

export class UserAssetWithMetaAndChainDTO extends extender(
  UserAssetWithMeta,
  UserAssetWithChainDTO,
) {}
{
}

export class UserAssetWithMetaAndWalletDTO extends extender(
  UserAssetWithMeta,
  UserAssetWithWalletDTO,
) {
  wallet: UserAssetWalletDTO;
}

export class UserAssetsListDTO extends PagedResultDTO {
  @ApiProperty({
    description: `List of user's assets`,
    example: [
      {
        image: 'https://api.rango.exchange/i/MTyH5i',
        symbol: 'ETH',
        name: 'Ethereum',
        usdTokenPriceAvg: 3797.517413136448,
        usdTokenPrice: 1170.807987881229,
        usdProfitLossChanges: -486.1537482435213,
        usdProfitLossPercentChanges: -87.77475803153952,
        usdBalance: 67.7113482217232,
        quantityBalance: 0.05783300842032868,
        usdBalanceBasic: 553.8650964652445,
        assetAddress: '0xNATIVExDOxNOTxHAVExADDRESS',
        chain: {
          id: 'fad14e33-1419-4b02-9993-06f75c588b61',
          image:
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTAwIiBoZWlnaHQ9IjI1MDAiIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzYyN0VFQSIvPjxnIGZpbGw9IiNGRkYiIGZpbGwtcnVsZT0ibm9uemVybyI+PHBhdGggZmlsbC1vcGFjaXR5PSIuNjAyIiBkPSJNMTYuNDk4IDR2OC44N2w3LjQ5NyAzLjM1eiIvPjxwYXRoIGQ9Ik0xNi40OTggNEw5IDE2LjIybDcuNDk4LTMuMzV6Ii8+PHBhdGggZmlsbC1vcGFjaXR5PSIuNjAyIiBkPSJNMTYuNDk4IDIxLjk2OHY2LjAyN0wyNCAxNy42MTZ6Ii8+PHBhdGggZD0iTTE2LjQ5OCAyNy45OTV2LTYuMDI4TDkgMTcuNjE2eiIvPjxwYXRoIGZpbGwtb3BhY2l0eT0iLjIiIGQ9Ik0xNi40OTggMjAuNTczbDcuNDk3LTQuMzUzLTcuNDk3LTMuMzQ4eiIvPjxwYXRoIGZpbGwtb3BhY2l0eT0iLjYwMiIgZD0iTTkgMTYuMjJsNy40OTggNC4zNTN2LTcuNzAxeiIvPjwvZz48L2c+PC9zdmc+',
          name: 'Ethereum Mainnet',
          slug: 'eth',
        },
      },
    ],
  })
  result: UserAssetWithMetaAndChainDTO[];
}

export class OneUserAssetWalletsBalancesListDTO {
  @ApiProperty({
    description: `List of wallets with provided token`,
    example: [
      {
        wallet: {
          id: '5c7a99a1-4602-4a74-bff8-93f70ca91264',
          name: 'dgfgf',
          image: null,
        },
        image: null,
        name: 'Syndicate Token',
        symbol: 'SYNR',
        id: '42cdcc63-335a-4129-9b3c-5f936e6d40a3',
        createdAt: '2022-11-28T13:45:08.482Z',
        updatedAt: '2022-11-28T13:45:08.482Z',
        usdBalance: 0,
        usdBalanceBasic: 495.6196077586476,
        usdProfitLoss: -495.6196077586476,
        usdBalanceByTxs: 0,
        assetAddress: '0xbc6e06778708177a18210181b073da747c88490a',
        usdTokenPrice: 0,
        usdTokenPriceAvg: 0.13531043563031328,
        quantityBalance: 3662.83358301165,
        quantityBalanceByTx: 3662.83358301165,
        assetRelatedTxCount: 1,
        chainSlug: null,
        statusFullness: 'Complete',
        usdProfitLossChanges: -495.6196077586476,
        usdProfitLossPercentChanges: -100,
      },
    ],
  })
  result: UserAssetWithMetaAndWalletDTO[];
}

export class UserWalletChainDTO {
  id: string;
  name: string;
  image: string | null;
  slug: ChainSlugs;
}

export class UserWalletStatisticsDTO {
  quantityOfAsset: number;
  usdBalance: number;
  usdBalanceBasic: number;
  usdProfitLossChanges: number;
  usdProfitLossPercentChanges: number;
  wallet: {
    image: string | null;
    provider: SupportedWalletProviders;
    name: string;
    chain: UserWalletChainDTO;
  };
}

export class UserWalletsWithAssetsListDTO {
  result: UserWalletStatisticsDTO[];
}

export class UserTokenAnalyticResponseDTO {
  @ApiProperty()
  @IsObject()
  @Type(() => TokenAnalyticFromAssetDTO)
  current: TokenAnalyticFromAssetDTO;

  @ApiProperty()
  @IsObject()
  @Type(() => TokenAnalyticFromAssetDTO)
  past: TokenAnalyticFromAssetDTO;

  @ApiProperty()
  @IsObject()
  @Type(() => TokenAnalyticChangesDTO)
  changes: TokenAnalyticChangesDTO;
}
