import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';
import { DataExchSwapHelpersService } from '@app/common/modules/data-exch/services/data.exch-swap-helpers.service';
import { DataPlatformCoinService } from '@app/common/modules/data-platform-coin/services/data.platform-coin.service';
import { Injectable } from '@nestjs/common';
import {
  CEXSwapQuoteDTO,
  CEXSwapTrackerSetupDeBridgeDTO,
  SwapPaymentDataDTO,
} from '../../common/dto/payable/payable-dex-swap.responses.dto';
import { IDeBridgeSellEstimation } from '../types/exch-debridge.types';
import { DeBridgeEstimationService } from './debridge-estimation.service';
import { DebridgePaymentDataService } from './debridge-payment-data.service';
import { DebridgeQuoteFormer } from './debridge-quote.former';
import { DebridgeSwapFeeService } from './debridge-swap-fee.service';
import { DebridgeTokenAddressTranslator } from './debridge-token-address.translator';
import { ExchDeBridgeService } from './exch-debridge.service';
import { SupportedEvmSlugsNames } from '@app/common/constants/supported-evm-chains.const';
import {
  SwapCurrencyDTO,
  SwapCurrencyWithAmountDTO,
} from '../../common/dto/payable/payable-common.requests.dto';

@Injectable()
export class DebridgeSwapSellService {
  constructor(
    private exchDeBridgeService: ExchDeBridgeService,
    private exchDeBridgeEstimationService: DeBridgeEstimationService,
    private exchDebridgePaymentDataService: DebridgePaymentDataService,
    private exchDebridgeFeeService: DebridgeSwapFeeService,
    private dataChainService: DataChainService,
    private debridgeQuoteFormer: DebridgeQuoteFormer,
    private debridgeTokenAddressTranslator: DebridgeTokenAddressTranslator,
    private dataExchSwapHelpersService: DataExchSwapHelpersService,
    private dataPlatformCoinService: DataPlatformCoinService,
  ) {}

  async makeSellQuote(
    sell: SwapCurrencyWithAmountDTO,
    buy: SwapCurrencyDTO,
  ): Promise<CEXSwapQuoteDTO> {
    const { sellParamsForEstimation, sellChain, buyChain } =
      await this.prepareItemsForDeBridge(sell, buy);

    let estimation;
    if (sell.chainId === buy.chainId) {
      estimation =
        await this.exchDeBridgeEstimationService.getSingleChainEstimation({
          sell: sellParamsForEstimation,
          buy: {
            tokenAddress: buy.tokenAddress,
          },
        });
    } else {
      estimation =
        await this.exchDeBridgeEstimationService.getMultiChainEstimation(
          {
            sell: sellParamsForEstimation,
            buy: {
              tokenAddress: buy.tokenAddress,
              blockchainId: buyChain.chainId,
            },
          },
          buyChain.slug as SupportedEvmSlugsNames,
        );
    }
    this.debridgeTokenAddressTranslator.checkNativeDeBridgeAndApplyNativeDBAddress(
      {
        sell,
        buy,
      },
    );

    const quoteBody = await this.debridgeQuoteFormer.formQuoteWithWeiBody({
      sell,
      buy,
      estimation,
    });

    await this.exchDebridgeFeeService.attachFixedNativeFeeToPay(
      quoteBody,
      sellChain.slug,
    );

    return quoteBody;
  }

  async makeSellPaymentData(
    sell: SwapCurrencyWithAmountDTO,
    buy: SwapCurrencyDTO,
  ): Promise<SwapPaymentDataDTO<CEXSwapTrackerSetupDeBridgeDTO>> {
    const { sellParamsForEstimation, sellChain, buyChain } =
      await this.prepareItemsForDeBridge(sell, buy);

    let paymentData;
    if (sell.chainId === buy.chainId) {
      paymentData =
        await this.exchDebridgePaymentDataService.getSingleChainPaymentData({
          sell: sellParamsForEstimation,
          buy: {
            tokenAddress: buy.tokenAddress,
            receiverAddress: sell.walletAddress,
          },
        });
    } else {
      paymentData =
        await this.exchDebridgePaymentDataService.getMultiChainPaymentData(
          {
            sell: sellParamsForEstimation,
            buy: {
              tokenAddress: buy.tokenAddress,
              blockchainId: buyChain.chainId,
              receiverAddress: sell.walletAddress,
            },
          },
          buyChain.slug as SupportedEvmSlugsNames,
        );
    }

    this.debridgeTokenAddressTranslator.checkNativeDeBridgeAndApplyNativeDBAddress(
      {
        sell,
        buy,
      },
    );

    const quoteBody = await this.debridgeQuoteFormer.formQuoteWithWeiBody({
      sell,
      buy,
      estimation: paymentData,
    });

    await this.exchDebridgeFeeService.attachFixedNativeFeeToPay(
      quoteBody,
      sellChain.slug,
    );

    await this.exchDeBridgeService.addMissingFieldsToTransaction(
      { sell, buy },
      paymentData.tx,
    );

    const swapPaymentResult: SwapPaymentDataDTO<CEXSwapTrackerSetupDeBridgeDTO> =
      {
        transactionCheckerSetup: {
          senderChainSlug: sellChain.slug,
          receiverChainSlug: buyChain.slug,
        },
        senderWallet: {
          chainId: sell.chainId,
          address: sell.walletAddress,
        },
        bodyTransaction: paymentData.tx,
      };

    if (sell.tokenAddress !== NATIVE_UNI_ADDRESS) {
      swapPaymentResult.approveTokenInfo = {
        bodyApprove: {
          to: paymentData.tx.to,
        },
        approveTokenMeta: {
          tokenAddress: sell.tokenAddress,
          amountWei: quoteBody.sell.amountWei,
          chainId: sell.chainId,
        },
      };
    }

    return swapPaymentResult;
  }

  private async prepareItemsForDeBridge(
    sell: SwapCurrencyWithAmountDTO,
    buy: SwapCurrencyDTO,
  ) {
    const sellChain = await this.dataChainService.findOneByIdOrFail(
      sell.chainId,
    );
    const buyChain = await this.dataChainService.findOneByIdOrFail(buy.chainId);

    const sellToken =
      await this.dataPlatformCoinService.findOneByAddressAndChainIdOrFail(
        sell.tokenAddress,
        sell.chainId,
      );

    await this.dataPlatformCoinService.findOneByAddressAndChainIdOrFail(
      buy.tokenAddress,
      buy.chainId,
    );

    const sellAmountWei = this.dataExchSwapHelpersService.formSellAmountInWei(
      sell.amount,
      sellToken.decimals,
    );
    await this.debridgeTokenAddressTranslator.checkIfNativeCoinAndApplyDebridgeAddress(
      {
        buy,
        sell,
      },
    );

    const sellParamsForEstimation: IDeBridgeSellEstimation = {
      blockchainId: sellChain.chainId,
      tokenAddress: sell.tokenAddress,
      amountWei: sellAmountWei,
    };

    return {
      sellChain,
      buyChain,
      sellParamsForEstimation,
    };
  }
}
