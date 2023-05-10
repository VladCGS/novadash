import { ChainSlugs } from '@app/common/types/chain.types';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlaygroundDebridge {
  @ApiProperty()
  @IsString()
  chainSlug: ChainSlugs;
  @ApiProperty()
  @IsString()
  tokenAddress: string;
  @ApiProperty()
  @IsString()
  blockNumber: number;
}

export class PlaygroundCoinbaseWithdrawFee {
  @ApiProperty()
  @IsString()
  currency: string;
  @ApiProperty()
  @IsString()
  walletAddress: string;
  @ApiProperty()
  @IsString()
  blockNumber: number;
}

export class PlaygroundKucoin {
  @ApiProperty()
  @IsString()
  currency: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  chain: string;
}
