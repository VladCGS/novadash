import { ApiProperty } from '@nestjs/swagger';
import { SwapAssetWithAmountDTO } from './payable-common.requests.dto';

export class CEXSwapQuoteDTO {
  @ApiProperty({ description: 'Quota output' })
  sell: SwapAssetWithAmountDTO;

  @ApiProperty({ description: 'Quota output' })
  buy: SwapAssetWithAmountDTO;

  @ApiProperty({ description: 'Fees included' })
  feesIncluded: SwapAssetWithAmountDTO[];

  @ApiProperty({ description: 'Fees need to pay' })
  feesToPay: SwapAssetWithAmountDTO[];
}

export class CEXSwapResultDataDTO {
  @ApiProperty({ description: 'Id' })
  swapId: string;
}
