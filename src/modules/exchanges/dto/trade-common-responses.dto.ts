import { SupportedWalletProviders } from '@app/common/entities/transactions';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SupportedCEXProviders } from '@app/common/entities/pairs';

export class SellAssetBaseDTO {
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
}

export class HotWalletSellAssetChainDTO {
  @ApiProperty()
  image: string | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  id: string;
}

export class HotWalletSellAssetDTO extends SellAssetBaseDTO {
  @ApiProperty({
    example: 18,
  })
  decimals: string;

  @ApiProperty()
  tokenAddress: string;

  @ApiProperty()
  @Type(() => HotWalletSellAssetChainDTO)
  chain: HotWalletSellAssetChainDTO;
}

export class SpotWalletSellAssetDTO extends SellAssetBaseDTO {
  @ApiProperty({ description: 'Supported chains', isArray: true })
  chains: HotWalletSellAssetChainDTO[];
}

export class ChainMetaDTO {
  @ApiProperty({
    example: null,
  })
  id: string;

  @ApiProperty({
    example: null,
  })
  image: string | null;
}

export class SpotWalletMetaDTO {
  @ApiProperty({
    example: null,
  })
  image: string;

  @ApiProperty({
    example: 'Main',
  })
  name: string | null;

  @ApiProperty({
    example: SupportedCEXProviders.BINANCE,
  })
  provider: SupportedCEXProviders;
}

export class SpotWalletDestinationMetaDTO extends SpotWalletMetaDTO {
  @ApiProperty()
  chain: ChainMetaDTO;

  @ApiProperty()
  destinationWalletAddress: string;
}

export class PricedSpotWalletDTO {
  @ApiProperty()
  usdBalance: string;

  @ApiProperty()
  meta: SpotWalletMetaDTO;
}

export class PricedSpotWalletWithBalancesDTO extends PricedSpotWalletDTO {
  @ApiProperty({
    isArray: true,
    type: SpotWalletSellAssetDTO,
  })
  balances: SpotWalletSellAssetDTO[];
}

export class HotWalletMetaDTO {
  @ApiProperty({
    example: '0x55645h64dr2Ajffnx7y6777xui8765',
  })
  id: string;

  @ApiProperty({
    example: '0x55645h64dr2Ajffnx7y6777xui8765',
  })
  address: string;

  @ApiProperty({
    example: 'Polygon Main',
  })
  name: string;

  @ApiProperty({
    example: null,
  })
  image: string | null;

  @ApiProperty({
    example: SupportedWalletProviders.METAMASK,
  })
  provider: SupportedWalletProviders;

  @ApiProperty()
  chain: ChainMetaDTO;
}

export class PricedWalletDTO {
  @ApiProperty()
  usdBalance: string;

  @ApiProperty()
  meta: HotWalletMetaDTO;
}

export class PricedHotWalletWithBalancesDTO extends PricedWalletDTO {
  @ApiProperty({
    isArray: true,
    type: HotWalletSellAssetDTO,
  })
  balances: HotWalletSellAssetDTO[];
}

export class PricedHotWalletNativeBalanceDTO {
  @ApiProperty()
  meta: HotWalletMetaDTO;

  @ApiProperty()
  nativeBalance: HotWalletSellAssetDTO;
}
