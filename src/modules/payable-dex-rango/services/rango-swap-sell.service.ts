import { NAMES_TO_RANGO } from '@app/common/constants/chains-rango.const';
import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';
import { DataExchSwapHelpersService } from '@app/common/modules/data-exch/services/data.exch-swap-helpers.service';
import { DataPlatformCoinService } from '@app/common/modules/data-platform-coin/services/data.platform-coin.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Asset } from 'rango-sdk-basic';
import { EvmTransaction } from 'rango-sdk-basic/lib/types/api/txs';
import { DEXSwapSellGetQuoteDTO } from '../../common/dto/payable/payable-dex-swap.requests.dto';
import {
  CEXSwapQuoteDTO,
  CEXSwapTrackerSetupRangoDTO,
  SwapPaymentDataDTO,
} from '../../common/dto/payable/payable-dex-swap.responses.dto';
import { ExchRangoService } from './exch-rango.service';
import { PureRangoService } from '@app/common/modules/rango/services/pure-rango.service';
import { RangoPaymentFormerService } from './rango-payment-former.service';
import { RangoTransactionFormerService } from './rango-transaction-former.service';
import { feeCollectorSetup } from '../../common/constants/fee-collecot-setup.const';
import { humanizeTokenQuantity } from '@app/common/helpers/contracts.helper';
import {
  SwapCurrencyDTO,
  SwapCurrencyWithAmountDTO,
} from '../../common/dto/payable/payable-common.requests.dto';

@Injectable()
export class RangoSwapSellService {
  constructor(
    private pureRangoService: PureRangoService,
    private exchRangoService: ExchRangoService,
    private dataChainService: DataChainService,
    private dataExchSwapHelpersService: DataExchSwapHelpersService,
    private dataPlatformCoinService: DataPlatformCoinService,
    private rangoTransactionFormerService: RangoTransactionFormerService,
    private rangoPaymentFormerService: RangoPaymentFormerService,
  ) {}

  async makeSellQuote({
    sell,
    buy,
  }: DEXSwapSellGetQuoteDTO): Promise<CEXSwapQuoteDTO> {
    const {
      sellAmountWeiStringified,
      toRangoBody,
      fromRangoBody,
      sellToken,
      buyToken,
    } = await this.prepareItemsForDeBridge(sell, buy);

    const quote = await this.pureRangoService.getQuote({
      amount: sellAmountWeiStringified,
      from: fromRangoBody,
      to: toRangoBody,
    });

    if (quote.resultType === 'NO_ROUTE')
      throw new HttpException(
        `Rango: Couldn't find route for swap ${
          quote.error ? `(${quote.error})` : ''
        }`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    const fees = this.exchRangoService.formFeesFromQuote(quote);

    const normalizedGetAmount =
      humanizeTokenQuantity(
        quote.route?.outputAmount,
        buyToken.decimals,
      ).toString() ?? '0';

    return {
      sell: {
        ...sell,
        amount: sell.amount,
        symbol: sellToken.coinMetadata.symbol,
      },
      buy: {
        ...buy,
        amount: normalizedGetAmount,
        symbol: buyToken.coinMetadata.symbol,
      },
      feesIncluded: fees,
      feesToPay: [],
    };
  }

  async makeSellPaymentData({
    sell,
    buy,
  }: DEXSwapSellGetQuoteDTO): Promise<
    SwapPaymentDataDTO<CEXSwapTrackerSetupRangoDTO>
  > {
    const {
      sellAmountWeiStringified,
      toRangoBody,
      fromRangoBody,
      sellChainNetworkId,
      buyChain,
    } = await this.prepareItemsForDeBridge(sell, buy);

    const swap = await this.pureRangoService.getTransactionData({
      disableEstimate: true,
      amount: sellAmountWeiStringified,
      from: fromRangoBody,
      to: toRangoBody,
      fromAddress: sell.walletAddress,
      toAddress: buy.walletAddress,
      referrerAddress: feeCollectorSetup[buyChain.slug].walletAddress,
      referrerFee: feeCollectorSetup[buyChain.slug].percent,
      slippage: '1.0',
    });

    if (swap.error) {
      throw new HttpException(
        'Something went wrong...',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    if (swap.resultType === 'NO_ROUTE') {
      throw new HttpException(
        "Couldn't find route for swap",
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const rangoSwapBody = swap.tx as EvmTransaction;

    if (!rangoSwapBody) {
      throw new HttpException('Ooops', HttpStatus.BAD_GATEWAY);
    }

    const formedTransactionTemplate =
      this.rangoTransactionFormerService.formTxBody(rangoSwapBody);

    await this.exchRangoService.addMissingFieldsToTransaction(
      { sell, buy },
      formedTransactionTemplate,
    );

    const swapPaymentDataResult: SwapPaymentDataDTO<CEXSwapTrackerSetupRangoDTO> =
      {
        transactionCheckerSetup: {
          requestId: swap.requestId,
        },
        senderWallet: {
          address: sell.walletAddress,
          chainId: sell.chainId,
        },
        bodyTransaction: formedTransactionTemplate,
      };

    this.rangoPaymentFormerService.checkOrAttachApproval(
      swapPaymentDataResult,
      rangoSwapBody,
      {
        ...sell,
        amountWei: sellAmountWeiStringified,
      },
      sellChainNetworkId,
    );

    return swapPaymentDataResult;
  }

  private async prepareItemsForDeBridge(
    sell: SwapCurrencyWithAmountDTO,
    buy: SwapCurrencyDTO,
  ) {
    const sellChain = await this.dataChainService.findOneByIdOrFail(
      sell.chainId,
    );

    const buyChain = await this.dataChainService.findOneByIdOrFail(buy.chainId);

    const sellRangoChain = NAMES_TO_RANGO[sellChain.slug];
    const buyRangoChain = NAMES_TO_RANGO[buyChain.slug];

    const sellToken =
      await this.dataPlatformCoinService.findOneByAddressAndChainIdOrFail(
        sell.tokenAddress,
        sell.chainId,
      );
    const buyToken =
      await this.dataPlatformCoinService.findOneByAddressAndChainIdOrFail(
        buy.tokenAddress,
        buy.chainId,
      );

    const sellAddress = this.exchRangoService.checkIfNativeCoinAndApplyAddress(
      sell.tokenAddress,
    );
    const buyAddress = this.exchRangoService.checkIfNativeCoinAndApplyAddress(
      buy.tokenAddress,
    );

    const fromRangoBody: Asset = {
      address: sellAddress,
      blockchain: sellRangoChain,
      symbol: sellToken.coinMetadata.symbol,
    };
    const toRangoBody: Asset = {
      address: buyAddress,
      blockchain: buyRangoChain,
      symbol: buyToken.coinMetadata.symbol,
    };

    const sellAmountWei = this.dataExchSwapHelpersService.formSellAmountInWei(
      sell.amount,
      sellToken.decimals,
    );

    return {
      fromRangoBody,
      toRangoBody,
      sellAmountWeiStringified: sellAmountWei,
      sellToken,
      buyToken,
      sellChainNetworkId: sellChain.chainId,
      buyChain,
    };
  }
}
