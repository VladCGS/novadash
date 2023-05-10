import { SupportedWalletProviders } from '@app/common/entities/transactions';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class WithdrawModalTokenAnalyticsDTO {
  @ApiProperty()
  @IsNumber()
  currentAmountToken: number;

  @ApiProperty()
  @IsNumber()
  uncollectedTokenFee: number;

  @ApiProperty()
  @IsNumber()
  usdPrice: number;

  @ApiProperty()
  @IsString()
  symbol: string;

  @ApiProperty()
  @IsString()
  tokenAddress: string;
}

export class UniswapV3WithdrawSenderMetaDTO {
  @ApiProperty()
  address: string;

  @ApiProperty()
  chainId: string;

  @ApiProperty()
  providerName: SupportedWalletProviders;
}

export class UniswapV3WithdrawInitialModalChainDTO {
  @ApiProperty()
  @IsString()
  image: string | null;

  @ApiProperty()
  @IsString()
  id: string;
}
