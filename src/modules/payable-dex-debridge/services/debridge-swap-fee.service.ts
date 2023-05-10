import { BLOCK_CHAIN_PROVIDER_META } from '@app/common/constants/rpc-blockchain-list.const';
import { ChainNativeCurrency } from '@app/common/entities/transactions';
import { ChainSlugs } from '@app/common/types/chain.types';
import { getDeBridgeGate } from '@debridge-finance/desdk/lib/evm';
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { CEXSwapQuoteDTO } from '../../common/dto/payable/payable-dex-swap.responses.dto';

@Injectable()
export class DebridgeSwapFeeService {
  private savedNativeFixedFee: {
    chainSlug: string | null;
    fixedNativeDeBridgeFee: string | null;
  } = {
    chainSlug: null,
    fixedNativeDeBridgeFee: null,
  };

  async getNativeFixedFee(chainSlug: ChainSlugs): Promise<string> {
    const foundRPCurl = BLOCK_CHAIN_PROVIDER_META[chainSlug].rpcUrl;

    const blockchainProvider = new ethers.providers.JsonRpcProvider(
      foundRPCurl,
    );

    const isCachedChainSlugEquals =
      this.savedNativeFixedFee.chainSlug === chainSlug;
    const cachedFee = this.savedNativeFixedFee.fixedNativeDeBridgeFee;
    if (isCachedChainSlugEquals && cachedFee) {
      return cachedFee;
    }

    const gate = getDeBridgeGate({
      provider: {
        ethers: {
          provider: blockchainProvider,
        },
      },
    });
    const feeBigNumber = await gate.globalFixedNativeFee();

    return ethers.utils.formatEther(feeBigNumber);
  }

  async attachFixedNativeFeeToPay(
    quoteBody: CEXSwapQuoteDTO,
    chainSlug: ChainSlugs,
  ) {
    const foundNativeCurrency = await ChainNativeCurrency.findOneBy({
      chain: {
        slug: chainSlug,
      },
    });

    if (!foundNativeCurrency) {
      return;
    }

    const nativeNormalFee = await this.getNativeFixedFee(chainSlug);
    const nativeSymbol = foundNativeCurrency.symbol;

    quoteBody.feesToPay.push({
      symbol: nativeSymbol,
      amount: nativeNormalFee,
    });
  }
}
