import { PagedResultDTO } from '@app/common/modules/common/types/http-response.types';
import { ApiProperty } from '@nestjs/swagger';

export class BinanceWithdrawChainMetaDTO {
  @ApiProperty()
  image: string | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  id: string;
}
export class BinanceWithdrawalAssetDTO {
  @ApiProperty({ description: 'Token name' })
  name: string;

  @ApiProperty({ description: 'Token symbol' })
  symbol: string;

  @ApiProperty({ description: 'Token image url' })
  image: string;

  @ApiProperty({ description: 'Token quantity' })
  quantity: string;

  @ApiProperty({ description: 'Supported chains' })
  chains: BinanceWithdrawChainMetaDTO[];
}

export class PricedBinanceWithdrawalAssetDTO extends BinanceWithdrawalAssetDTO {
  usdPrice: string;
  usdBalance: string;
}

export class BinanceWithdrawalListPageDTO extends PagedResultDTO {
  result: BinanceWithdrawalAssetDTO[];
}
