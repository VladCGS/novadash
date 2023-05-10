import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UniswapV3IncreaseLiquidityTokenDataDTO } from './uniswap-v3-pools-liquidity-increasing-common.dto';
import { UniswapV3AddLiquidityModalInitializationDataDTO } from './uniswap-v3-pools-liquidity-providing-response.dto';
import { IsEnum, IsString } from 'class-validator';
import { SupportedWalletProviders } from '@app/common/entities/transactions';

export class PositionOwnerChainMetaDTO {
  @ApiProperty()
  @IsString()
  image: string;
}

export class PositionOwnerMetaDTO {
  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  image: string;

  @ApiProperty()
  @IsEnum(SupportedWalletProviders)
  provider: SupportedWalletProviders;

  @ApiProperty()
  @Type(() => PositionOwnerChainMetaDTO)
  chain: PositionOwnerChainMetaDTO;
}

export class PositionWalletPricedChainDTO {
  @ApiProperty()
  image: string | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  id: string;
}

export class PositionWalletPricedAssetDTO {
  @ApiProperty({ description: 'Token name' })
  name: string;

  @ApiProperty({ description: 'Token symbol' })
  symbol: string;

  @ApiProperty({ description: 'Token image url' })
  image: string;

  @ApiProperty()
  usdPrice: string;

  @ApiProperty()
  usdBalance: string;

  @ApiProperty({ description: 'Token quantity' })
  quantity: string;

  @ApiProperty()
  chain: PositionWalletPricedChainDTO;
}

export class PositionPricedWalletDTO {
  @ApiProperty()
  @Type(() => PositionOwnerMetaDTO)
  meta: PositionOwnerMetaDTO;

  @ApiProperty({
    nullable: true,
  })
  @Type(() => PositionOwnerMetaDTO)
  balances: PositionWalletPricedAssetDTO[];
}

export class UniswapV3IncreaseLiquidityModalInitializationDataDTO extends UniswapV3AddLiquidityModalInitializationDataDTO {
  @ApiProperty()
  @Type(() => UniswapV3IncreaseLiquidityTokenDataDTO)
  quoteToken: UniswapV3IncreaseLiquidityTokenDataDTO;

  @ApiProperty()
  @Type(() => UniswapV3IncreaseLiquidityTokenDataDTO)
  baseToken: UniswapV3IncreaseLiquidityTokenDataDTO;

  @ApiProperty()
  @Type(() => PositionPricedWalletDTO)
  walletPriced: PositionPricedWalletDTO;
}
