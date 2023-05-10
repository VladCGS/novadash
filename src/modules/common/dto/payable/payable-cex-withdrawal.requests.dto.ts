import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CEXFetchWithdrawStatusDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  withdrawId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionHash?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  symbol?: string;
}

export class CEXWithdrawGetQuoteDTO {
  @ApiProperty({ description: 'Token name' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: 'Withdrawal amount' })
  @IsString()
  amount: string;

  @ApiProperty({ description: 'Chain id' })
  @IsString()
  chainId: string;

  @ApiProperty({ description: 'Destination wallet address' })
  @IsString()
  walletAddress: string;

  @ApiPropertyOptional({ description: 'Destination wallet address' })
  @IsBoolean()
  @IsOptional()
  ignoreErrors?: boolean;
}
