import { Injectable } from '@nestjs/common';
import { PositionPricedWalletDTO } from '../dtos/uniswap-v3-pools-liquidity-increasing-response.dto';
import { Wallet } from '@app/common/entities/transactions';
import { PricedHotWalletService } from '@app/common/modules/priced-wallet/services/priced-hot-wallet.service';
import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';

@Injectable()
export class UniswapFormPricedWalletService {
  constructor(private pricedHotWalletService: PricedHotWalletService) {}
  async formPricedHotWallet(
    wallet: Wallet,
    positionTokenAddresses: {
      quoteTokenAddress: string;
      baseTokenAddress: string;
    },
  ): Promise<PositionPricedWalletDTO> {
    return this.pricedHotWalletService.formPriced(wallet, {
      onlyAddresses: [
        positionTokenAddresses.quoteTokenAddress,
        NATIVE_UNI_ADDRESS,
        positionTokenAddresses.baseTokenAddress,
      ],
    });
  }
}
