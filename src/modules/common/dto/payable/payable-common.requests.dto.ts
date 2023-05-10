import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SwapAssetDTO {
  @ApiProperty()
  @IsString()
  symbol: string;
}

export class SwapAssetWithAmountDTO extends SwapAssetDTO {
  @ApiProperty()
  @IsString()
  amount: string;
}
export class SwapCurrencyDTO extends SwapAssetDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  tokenAddress: string;

  @ApiProperty()
  @IsString()
  chainId: string;

  @ApiProperty()
  @IsString()
  walletAddress: string;
}

export class SwapCurrencyWithAmountDTO extends SwapCurrencyDTO {
  @ApiProperty()
  @IsString()
  amount: string;
}

export class SwapCurrencyWithAmountAndWeiDTO extends SwapCurrencyDTO {
  @ApiProperty()
  @IsString()
  amount: string;

  @ApiProperty()
  @IsString()
  amountWei: string;
}
