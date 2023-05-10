import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import { Web3TransactionBodyDTO } from '@app/common/dtos/web3.dto';
import { Chain, ChainNativeCurrency } from '@app/common/entities/transactions';
import { ChainGroupEnum } from '@app/common/modules/transactions/types/evm/tx-evm.enums';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Exch0xService {
  async checkIfNativeCoinAndApplySymbol(
    tokenAddress: string,
    chain: Chain,
  ): Promise<string> {
    if (tokenAddress !== NATIVE_UNI_ADDRESS) {
      return tokenAddress;
    }

    const foundNativeCurrency = await ChainNativeCurrency.findOneBy({
      chain: { id: chain.id },
    });

    return foundNativeCurrency.symbol;
  }

  addMissingFieldsToTransaction(
    tx: Partial<Web3TransactionBodyDTO>,
    sellChain: Chain,
  ) {
    if (sellChain.group === ChainGroupEnum.EVM) {
      tx.chainId = Number(sellChain.chainId);
    }
  }
}
