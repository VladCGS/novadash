import { Chain } from '@app/common/entities/transactions';
import { ChainGroupEnum } from '@app/common/modules/transactions/types/evm/tx-evm.enums';
import { stringValueToHex } from '@app/common/utils/ether-hex.util';
import { Injectable } from '@nestjs/common';
import { DEXSwapSellGetQuoteDTO } from '../../common/dto/payable/payable-dex-swap.requests.dto';

@Injectable()
export class ExchDeBridgeService {
  async addMissingFieldsToTransaction(body: DEXSwapSellGetQuoteDTO, tx: any) {
    const foundChain = await Chain.findOneBy({
      id: body.sell.chainId,
    });

    if (foundChain.group === ChainGroupEnum.EVM) {
      tx.chainId = foundChain.chainId;
      tx.from = body.sell.walletAddress;
      tx.value = stringValueToHex(tx.value);
    }
  }
}
