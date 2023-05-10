import { NativeCoinsSymbols } from '@app/common/constants/native-coins.const';
import { ProviderMetaDTO } from '@app/common/dtos/default-dao-common.dto';
import { SupportedWalletProviders } from '@app/common/entities/transactions';
import { PagedResultDTO } from '@app/common/modules/common/types/http-response.types';
import { ApiProperty } from '@nestjs/swagger';

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

export class CoinMetaDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  symbol: NativeCoinsSymbols;

  @ApiProperty()
  image: string;
}

export class StakedNativeBalanceDTO {
  @ApiProperty()
  usdPrice: string;

  @ApiProperty()
  usdBalance: string;

  @ApiProperty({ description: 'Token quantity' })
  quantity: string;

  @ApiProperty()
  apr: string;

  @ApiProperty()
  walletMeta: WalletMetaDTO;

  @ApiProperty()
  providerMeta: ProviderMetaDTO;

  @ApiProperty()
  coinMeta: CoinMetaDTO;
}

export class UserStakedNativeBalancesPagedDTO extends PagedResultDTO {
  result: StakedNativeBalanceDTO[];
}
