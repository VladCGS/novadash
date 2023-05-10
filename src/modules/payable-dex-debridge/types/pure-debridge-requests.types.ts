export interface IDeBridgeEsmitationOptions {
  srcChainId: number;
  srcChainTokenIn: string;
  srcChainTokenInAmount: string;
  slippage?: number;
  dstChainId: number;
  dstChainTokenOut: string | null;
  executionFeeAmount?: 'auto';
  executionFeeTokenAddress?: string;
  dstBaseGasAmount?: number;
  affiliateFeePercent?: number;
  affiliateFeeRecipient?: string;
}

export interface IDeBridgeChainEstimationOptions {
  chainId: number;
  tokenIn: string;
  tokenInAmount: string;
  slippage?: number;
  tokenOut: string;
}

export interface IDeBridgeTransactionOptions {
  srcChainId: number;
  srcChainTokenIn: string;
  srcChainTokenInAmount: string;
  slippage: number;
  dstChainId: number;
  dstChainTokenOut: string | null;
  executionFeeAmount?: 'auto';
  executionFeeTokenAddress?: string;
  dstBaseGasAmount?: number;
  affiliateFeePercent?: number;
  affiliateFeeRecipient?: string;
  dstChainTokenOutRecipient: string;
  dstChainFallbackAddress?: string;
  referralCode?: number;
  srcChainTokenInSenderPermit?: string;
  dstChainTxBundle?: string;
  senderAddress?: string;
  enableEstimate?: boolean;
}

export interface IDeBridgeChainTransactionOptions {
  chainId: number;
  tokenIn: string;
  tokenInAmount: string;
  slippage?: number;
  tokenOut: string;
  tokenOutRecipient: string;
}
