import {
  IDeBridgeChainTransactionResponse,
  IDeBridgeEstimationBase,
  MultiChainEstimation,
  SingleChainEstimation,
} from './pure-debridge-responses.types';
import {
  SwapCurrencyDTO,
  SwapCurrencyWithAmountDTO,
} from '../../common/dto/payable/payable-common.requests.dto';

type FormReservationBodyOption =
  | IDeBridgeEstimationBase<SingleChainEstimation>
  | IDeBridgeEstimationBase<MultiChainEstimation>
  | IDeBridgeChainTransactionResponse;

export interface IFormReservationBodyOptions {
  sell: SwapCurrencyWithAmountDTO;
  buy: SwapCurrencyDTO;
  estimation: FormReservationBodyOption;
}

export class IDeBridgeSellEstimation {
  tokenAddress: string;
  blockchainId: string;
  amountWei: string;
}
export class IDeBridgeBuySingleChainEstimation {
  tokenAddress: string;
}
export class IDeBridgeBuyMultiChainEstimation extends IDeBridgeBuySingleChainEstimation {
  blockchainId: string;
}

export class IDeBridgeBuySingleChainPaymentData extends IDeBridgeBuySingleChainEstimation {
  receiverAddress: string;
}
export class IDeBridgeBuyMultiChainPaymentData extends IDeBridgeBuyMultiChainEstimation {
  receiverAddress: string;
}

export interface IDeBridgeSingleChainEstimate {
  sell: IDeBridgeSellEstimation;
  buy: IDeBridgeBuySingleChainEstimation;
}

export interface IDeBridgeMultiChainEstimate {
  sell: IDeBridgeSellEstimation;
  buy: IDeBridgeBuyMultiChainEstimation;
}

export interface IDeBridgeSingleChainPaymentData {
  sell: IDeBridgeSellEstimation;
  buy: IDeBridgeBuySingleChainPaymentData;
}

export interface IDeBridgeMultiChainPaymentData {
  sell: IDeBridgeSellEstimation;
  buy: IDeBridgeBuyMultiChainPaymentData;
}
