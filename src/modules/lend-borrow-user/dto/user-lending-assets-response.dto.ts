import { PagedResultDTO } from '@app/common/modules/common/types/http-response.types';
import { ApiProperty } from '@nestjs/swagger';
import { SupportedWalletProviders } from '@app/common/entities/transactions';
import { ProviderMetaDTO } from '@app/common/dtos/default-dao-common.dto';

export class CorePlatformCoinMetaDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  tokenAddress: string;

  @ApiProperty()
  platformCoinId: string;
}

export class ReserveTokenMetaDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  reserveAddress: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  provider: string;
}

export class LendingPercentDTO {
  @ApiProperty()
  year1: string;
}

export class ChainMetaDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string | null;

  @ApiProperty()
  id: string;
}

export class WalletMetaDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  provider: SupportedWalletProviders;

  @ApiProperty()
  image: string | null;

  @ApiProperty()
  chain: ChainMetaDTO;
}

export class LendingAssetInfoDTO {
  @ApiProperty()
  lendingPercent: LendingPercentDTO;

  @ApiProperty()
  usdBalance: string;

  @ApiProperty()
  quantityBalance: string;

  @ApiProperty()
  usdTokenPrice: string;
}

export class UserLendAssetDTO {
  @ApiProperty()
  coreTokenMeta: CorePlatformCoinMetaDTO;

  @ApiProperty()
  reserveMeta: ReserveTokenMetaDTO;

  @ApiProperty()
  providerMeta: ProviderMetaDTO;

  @ApiProperty()
  walletMeta: WalletMetaDTO;

  @ApiProperty()
  lendingAssetInfo: LendingAssetInfoDTO;
}

export class UserLendingAssetsPagedDTO extends PagedResultDTO {
  result: UserLendAssetDTO[];
}
