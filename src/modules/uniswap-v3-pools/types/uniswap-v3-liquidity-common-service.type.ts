import { PoolChainSlugAndId } from '@app/common/modules/data-supported-pools/dto/data-supported-pools-response.dto';
import { IPool } from '@app/common/types/liquidity-pools.type';
import { Pool, Position } from '@uniswap/v3-sdk';
import { IUniswapV3PositionBase } from '@app/common/modules/uniswap-v3-evm/types/pure-uniswap-v3-response.types';
import { Chain } from '@app/common/entities/transactions';
import { ethers } from 'ethers';
import { UniswapV3AddLiquidityModalInitializationDataDTO } from '../dtos/uniswap-v3-pools-liquidity-providing-response.dto';
import { UniswapWrappedPositionSwitcherMetaDTO } from '../dtos/uniswap-v3-pools-liquidity-providing-common.dto';

export interface IPoolNativeWrappedToken {
  wrappedPositionSwitcherMeta: UniswapWrappedPositionSwitcherMetaDTO;
}

export interface IFormAndSaveIncreaseModalInitializationData {
  poolUniswapInfo: IPool;
  poolChainSlugAndId: PoolChainSlugAndId;
  userId: string;
  tickLower?: number;
  tickUpper?: number;
}

export class FormWithdrawModalTokenAnalytics {
  tokenNumber: 0 | 1;
  position: Position;
  positionInfo: IUniswapV3PositionBase;
  chain: Chain;
  poolNativeWrappedToken?: IPoolNativeWrappedToken;
  contract: ethers.Contract;
}

export class FormCollectFeeOptions {
  position: Position;
  positionInfo: IUniswapV3PositionBase;
  depositWrapped: boolean;
  pool: Pool;
  ownerAddress: string;
  includeUncollectedFees?: boolean;
}

export class IIncreaseModalInitializationData {
  poolInfo: UniswapV3AddLiquidityModalInitializationDataDTO;
  rangeReverse: boolean;
}
