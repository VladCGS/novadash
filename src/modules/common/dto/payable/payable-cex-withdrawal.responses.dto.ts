import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { SwapAssetWithAmountDTO } from './payable-common.requests.dto';

export class CEXWithdrawOutputDTO {
  @ApiProperty({ description: 'Token name' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: 'Withdrawal amount' })
  @IsString()
  amount: string;

  @ApiProperty({ description: 'Withdrawal amount' })
  @IsString()
  decimals: string;

  @ApiProperty({ description: 'Chain id' })
  @IsString()
  chainId: string;

  @ApiProperty({ description: 'Token Address' })
  @IsString()
  tokenAddress: string;

  @ApiProperty({ description: 'Destination wallet address' })
  @IsString()
  walletAddress: string;
}

export class CEXWithdrawQuoteDTO {
  @ApiProperty({ description: 'Quota output' })
  output: CEXWithdrawOutputDTO;

  @ApiProperty({ description: 'Fees included' })
  feesIncluded: SwapAssetWithAmountDTO[];

  @ApiProperty({ description: 'Fees need to pay' })
  feesToPay: SwapAssetWithAmountDTO[];
}

export class CEXWithdrawResultDataDTO {
  @ApiProperty({ description: 'Id' })
  withdrawOrderId: string;

  @ApiPropertyOptional()
  transactionHash?: string;

  @ApiPropertyOptional()
  symbol?: string;
}
