import { Web3TransactionBodyDTO } from '@app/common/dtos/web3.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  UniswapV3WithdrawInitialModalChainDTO,
  UniswapV3WithdrawSenderMetaDTO,
  WithdrawModalTokenAnalyticsDTO,
} from './uniswap-v3-pools-liquidity-withdrawing-common.dto';
import { SupportedWalletProviders } from '@app/common/entities/transactions';
import { IsOptional, IsString } from 'class-validator';
import { UniswapWrappedPositionSwitcherMetaDTO } from './uniswap-v3-pools-liquidity-providing-common.dto';

export class UniswapV3WithdrawInitialModalWalletDTO {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  provider: SupportedWalletProviders;

  @ApiProperty()
  @IsString()
  image: string;

  @ApiProperty()
  @IsString()
  chain: UniswapV3WithdrawInitialModalChainDTO;
}

export class UniswapV3WithdrawingModalInitializationDataDTO {
  @ApiProperty()
  @Type(() => UniswapV3WithdrawInitialModalChainDTO)
  ownerMeta: UniswapV3WithdrawInitialModalChainDTO;

  @ApiProperty()
  @Type(() => WithdrawModalTokenAnalyticsDTO)
  tokensAnalytics: WithdrawModalTokenAnalyticsDTO[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  wrappedPositionSwitcherMeta?: UniswapWrappedPositionSwitcherMetaDTO;
}

export class UniswapV3WithdrawTransactionDTO {
  @ApiProperty()
  @Type(() => UniswapV3WithdrawSenderMetaDTO)
  senderMeta: UniswapV3WithdrawSenderMetaDTO;

  @ApiProperty()
  @Type(() => Web3TransactionBodyDTO)
  bodyTransaction: Web3TransactionBodyDTO;
}
