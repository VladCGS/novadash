interface DeBridgeToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  amount: string;
}

interface ExecutionFeeToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

interface ExecutionFee {
  token: ExecutionFeeToken;
  recommendedAmount: string;
  actualAmount: string;
}

interface DeBridgeTokenOut extends DeBridgeToken {
  minAmount: string;
}

interface TxEstimation {
  allowanceTarget: string;
}

interface TxTransaction {
  to: string;
  data: string;
  value: string;
  gasLimit: number;
}

export interface MultiChainEstimation {
  srcChainTokenIn: DeBridgeToken;
  srcChainTokenOut: DeBridgeToken;
  dstChainTokenIn: DeBridgeToken;
  dstChainTokenOut: DeBridgeToken;
  executionFee: ExecutionFee;
}
export interface IDeBridgeEstimationBase<T> {
  estimation: T;
}
export interface SingleChainEstimation {
  tokenIn: DeBridgeToken;
  tokenOut: DeBridgeTokenOut;
}

export interface IDeBridgeEstimationResponse
  extends IDeBridgeEstimationBase<MultiChainEstimation> {
  tx: TxEstimation;
}

export interface IDeBridgeTransactionResponse
  extends IDeBridgeEstimationBase<MultiChainEstimation> {
  tx: TxTransaction;
}

export interface IDeBridgeChainTransactionResponse {
  tokenIn: DeBridgeToken;
  tokenOut: DeBridgeTokenOut;
  tx: TxTransaction;
}
