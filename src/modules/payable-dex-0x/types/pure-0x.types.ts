export interface IGet0xQuote {
  sellToken: string;
  buyToken: string;
  sellAmount?: string;
  buyAmount?: string;
  slippagePercentage?: string;
  gasPrice?: string;
  takerAddress?: string;
  excludedSources?: string;
  includedSources?: string;
  skipValidation?: boolean;
  intentOnFilling?: boolean;
  feeRecipient?: string;
  buyTokenPercentageFee?: number;
  affiliateAddress: string;
  enableSlippageProtection?: boolean;
}

export interface I0xQuote {
  price: string;
  guaranteedPrice: string;
  to: string;
  data: string;
  value: string;
  gasPrice: string;
  gas: string;
  estimatedGas: string;
  protocolFee: string;
  minimumProtocolFee: string;
  buyAmount: string;
  sellAmount: string;
  sources: IGetPureReturnTypeSource[];
  buyTokenAddress: string;
  sellTokenAddress: string;
  allowanceTarget: string;
  orders: IGetQuotePureReturnTypeOrder[];
  sellTokenToEthRate: string;
  buyTokenToEthRate: string;
  expectedSlippage: string;
}

export interface IGetPureReturnTypeSource {
  name: string;
  proportion: string;
}

export interface IGetQuotePureReturnTypeOrder {
  makerToken: string;
  takerToken: string;
  makerAmount: string;
  takerAmount: string;
  fillData: IGetQuotePureReturnTypeFillData;
  source: string;
  sourcePathId: string;
  type: number;
}

export interface IGetQuotePureReturnTypeFillData {
  tokenAddressPath: string[];
  router: string;
}

export interface IGet0xPrice {
  sellToken: string;
  buyToken: string;
  sellAmount?: string;
  buyAmount?: string;
  slippagePercentage?: string;
  gasPrice?: string;
  takerAddress?: string;
  excludedSources?: string;
  includedSources?: string;
  skipValidation?: boolean;
  feeRecipient?: string;
  buyTokenPercentageFee?: string;
  affiliateAddress: string;
  enableSlippageProtection?: boolean;
}

export interface I0xPrice {
  price: string;
  estimatedPriceImpact: string;
  value: string;
  gasPrice: string;
  gas: string;
  estimatedGas: string;
  protocolFee: string;
  minimumProtocolFee: string;
  buyTokenAddress: string;
  buyAmount: string;
  sellTokenAddress: string;
  sellAmount: string;
  sources: IGetPureReturnTypeSource[];
  allowanceTarget: string;
  sellTokenToEthRate: string;
  buyTokenToEthRate: string;
  expectedSlippage: string;
}
