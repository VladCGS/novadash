import { ChainGroupEnum } from '@app/common/modules/transactions/types/evm/tx-evm.enums';
import { IInitUserTransactionReq } from '@app/common/modules/transactions/types/transaction.types';
import { ChainSlugs } from '@app/common/types/chain.types';

export interface TxsInitedMessage {
  chainSlug: ChainSlugs;
  walletAddress: string;
}
export type IInitedUserTransactions = Partial<
  Record<ChainGroupEnum, TxsInitedMessage[]>
>;

export interface IInitChainGroupWallets {
  chainGroupName: string;
  chainGroupWallets: IInitUserTransactionReq;
}

export enum OrderByesEnum {
  DATE = 'date',
  USD_FEE = 'usdFee',
  USD_OUTCOME = 'usdOutcome',
}
