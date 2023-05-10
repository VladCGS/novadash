import {
  ApproveTokenInfoDTO,
  Web3TransactionBodyDTO,
  Web3TransactionSenderWalletMetaDTO,
} from '@app/common/dtos/web3.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import {
  UniswapV3AddLiquidityTokenDataDTO,
  UniswapWrappedPositionSwitcherMetaDTO,
} from './uniswap-v3-pools-liquidity-providing-common.dto';

export class UniswapV3AddLiquidityModalInitializationDataDTO {
  @ApiProperty()
  @IsString()
  chainIdDB: string;

  @ApiProperty()
  @IsString()
  poolAddress: string;

  @ApiProperty()
  @IsNumber()
  minRange: number;

  @ApiProperty()
  @IsNumber()
  maxRange: number;

  @ApiProperty()
  @IsNumber()
  apr: number;

  @ApiProperty()
  @IsNumber()
  priceAssumptionValue: number;

  @ApiProperty()
  @IsNumber()
  lowerRange: number;

  @ApiProperty()
  @IsNumber()
  upperRange: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  wrappedPositionSwitcherMeta?: UniswapWrappedPositionSwitcherMetaDTO;

  @ApiProperty()
  @Type(() => UniswapV3AddLiquidityTokenDataDTO)
  quoteToken: UniswapV3AddLiquidityTokenDataDTO;

  @ApiProperty()
  @Type(() => UniswapV3AddLiquidityTokenDataDTO)
  baseToken: UniswapV3AddLiquidityTokenDataDTO;
}

export class UniswapV3AddLiquidityTransactionDTO {
  @ApiProperty()
  @Type(() => Web3TransactionSenderWalletMetaDTO)
  senderWallet: Web3TransactionSenderWalletMetaDTO;

  @ApiProperty()
  @Type(() => ApproveTokenInfoDTO)
  approveTokensInfo: ApproveTokenInfoDTO[];

  @ApiProperty()
  @Type(() => Web3TransactionBodyDTO)
  bodyTransaction: Web3TransactionBodyDTO;
}
