import { Wallet } from '@app/common/entities/transactions';
import { ChainGroupEnum } from '@app/common/modules/transactions/types/evm/tx-evm.enums';
import { IInitUserTransactionReq } from '@app/common/modules/transactions/types/transaction.types';

export type IGroupedWallets = Partial<
  Record<ChainGroupEnum, IInitUserTransactionReq>
>;
export const groupWallets = (wallets: Wallet[]): IGroupedWallets => {
  const accum: IGroupedWallets = {};

  for (const oneWallet of wallets) {
    const walletChainGroup = oneWallet.chain.group;
    if (!accum.hasOwnProperty(walletChainGroup)) {
      accum[walletChainGroup] = {
        userId: oneWallet.user.id,
        wallets: [oneWallet],
      };

      continue;
    }

    accum[walletChainGroup].wallets.push(oneWallet);
  }

  return accum;
};
