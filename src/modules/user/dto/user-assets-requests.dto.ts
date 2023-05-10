import { PageQueryDTO } from '@app/common/dtos';
import { OrderKeywordsEnum } from '@app/common/types/common.types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import {
  UserAssetsOrderByEnum,
  UserAssetWalletsBalancesOrderByEnum,
  UserWalletsWithAssetsOrderByEnum,
} from '../types/user-assets.types';

export class UserAssetsPageQueryDTO extends PageQueryDTO {
  @ApiPropertyOptional({
    required: false,
    description: '<small>Default - **"usdTokenPrice"**</small>',
    default: UserAssetsOrderByEnum.USD_TOKEN_PRICE,
    enum: UserAssetsOrderByEnum,
  })
  @IsOptional()
  @IsEnum(UserAssetsOrderByEnum)
  @IsString()
  orderBy?: UserAssetsOrderByEnum;

  @ApiProperty({
    required: false,
    description:
      '<small>Default - **"DESC"** . **"DESC"** - start search from the newest, **"ASC"** - the oldest</small>',
    default: OrderKeywordsEnum.DESC,
    enum: OrderKeywordsEnum,
  })
  @IsOptional()
  @IsString()
  @IsEnum(OrderKeywordsEnum)
  orderType?: OrderKeywordsEnum;

  @ApiProperty()
  @IsOptional()
  @IsString()
  search?: string;
}

export class GetOneUserAssetWalletsBalancesQueryDTO {
  @ApiPropertyOptional({
    required: false,
    description: '<small>Default - **"usdTokenPrice"**</small>',
    default: UserAssetWalletsBalancesOrderByEnum.ASSET_QUANTITY,
    enum: UserAssetWalletsBalancesOrderByEnum,
  })
  @IsOptional()
  @IsEnum(UserAssetWalletsBalancesOrderByEnum)
  @IsString()
  orderBy?: UserAssetWalletsBalancesOrderByEnum;

  @ApiPropertyOptional({
    required: false,
    description:
      '<small>Default - **"DESC"** . **"DESC"** - start search from the newest, **"ASC"** - the oldest</small>',
    default: OrderKeywordsEnum.DESC,
    enum: OrderKeywordsEnum,
  })
  @IsOptional()
  @IsString()
  @IsEnum(OrderKeywordsEnum)
  orderType?: OrderKeywordsEnum;

  @ApiProperty({
    description: 'Asset blockchain address',
    example: '0x12vbnv5558983bbk33ayb00nfuotrw4f5c889',
  })
  @IsString()
  assetAddress: string;

  @ApiProperty({
    description: 'Database chain ID',
    example: '00000-000-000-0000000000',
  })
  @IsString()
  chainId: string;
}

export class UserWalletsWithAssetsListRequestDTO {
  @ApiPropertyOptional({
    required: false,
    description: '<small>Default - **"usdBalance"**</small>',
    default: UserWalletsWithAssetsOrderByEnum.USD_BALANCE,
    enum: UserWalletsWithAssetsOrderByEnum,
  })
  @IsOptional()
  @IsEnum(UserWalletsWithAssetsOrderByEnum)
  @IsString()
  orderBy?: UserWalletsWithAssetsOrderByEnum;

  @ApiProperty({
    required: false,
    description:
      '<small>Default - **"DESC"** . **"DESC"** - start search from the newest, **"ASC"** - the oldest</small>',
    default: OrderKeywordsEnum.DESC,
    enum: OrderKeywordsEnum,
  })
  @IsOptional()
  @IsString()
  @IsEnum(OrderKeywordsEnum)
  orderType?: OrderKeywordsEnum;

  @ApiProperty()
  @IsOptional()
  @IsString()
  search?: string;
}

export class UserTokenAnalyticRequestDTO {
  @ApiProperty()
  @IsString()
  tokenAddress: string;

  @ApiProperty()
  @IsString()
  chainId: string;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  throughDays: number;
}
