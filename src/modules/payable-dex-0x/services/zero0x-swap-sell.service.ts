import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';
import { DataExchSwapHelpersService } from '@app/common/modules/data-exch/services/data.exch-swap-helpers.service';
import { DataPlatformCoinService } from '@app/common/modules/data-platform-coin/services/data.platform-coin.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DEXSwapSellGetQuoteDTO } from '../../common/dto/payable/payable-dex-swap.requests.dto';
import {
  CEXSwapQuoteDTO,
  SwapPaymentDataDTO,
} from '../../common/dto/payable/payable-dex-swap.responses.dto';
import { Exch0xService } from './exch-0x.service';
import { Pure0xService } from './pure-0x.service';
import { Zero0xFeesService } from './zero0x-fees.service';
import { Zero0xPaymentService } from './zero0x-payment.service';
import { Zero0xQuoteService } from './zero0x-quote.service';
import { feeCollectorSetup } from '../../common/constants/fee-collecot-setup.const';

@Injectable()
export class Zero0xSwapSellService {
  constructor(
    private pure0xService: Pure0xService,
    private dataChainService: DataChainService,
    private dataExchSwapHelpersService: DataExchSwapHelpersService,
    private dataPlatformCoinService: DataPlatformCoinService,
    private exch0xService: Exch0xService,
    private zero0xPaymentService: Zero0xPaymentService,
    private zero0xFeesService: Zero0xFeesService,
    private zero0xQuoteService: Zero0xQuoteService,
  ) {}

  async makeSellQuote(body: DEXSwapSellGetQuoteDTO): Promise<CEXSwapQuoteDTO> {
    const {
      sell0xToken,
      buy0xToken,
      sellChain,
      sellAmountWeiStringified,
      buyTokenDecimals,
      buyChain,
    } = await this.prepareCommonFeatures(body);

    const quote = await this.pure0xService.getPrice(sellChain.slug, {
      sellToken: sell0xToken,
      sellAmount: sellAmountWeiStringified,
      buyToken: buy0xToken,
      buyTokenPercentageFee: '0.5',
      feeRecipient: feeCollectorSetup[buyChain.slug].walletAddress,
      affiliateAddress: body.sell.walletAddress,
    });

    return this.zero0xQuoteService.formQuoteBy0x(
      quote,
      body,
      sellChain.slug,
      buyTokenDecimals,
    );
  }

  async makeSellPaymentData(
    body: DEXSwapSellGetQuoteDTO,
  ): Promise<SwapPaymentDataDTO> {
    const {
      sell0xToken,
      buy0xToken,
      sellChain,
      sellAmountWeiStringified,
      buyChain,
    } = await this.prepareCommonFeatures(body);

    const paymentQuote0x = await this.pure0xService.getQuote(sellChain.slug, {
      sellToken: sell0xToken,
      sellAmount: sellAmountWeiStringified,
      buyToken: buy0xToken,
      buyTokenPercentageFee: 1,
      feeRecipient: feeCollectorSetup[buyChain.slug].walletAddress,
      affiliateAddress: body.sell.walletAddress,
    });

    if (!paymentQuote0x) {
      throw new HttpException('Could`t fetch quote', HttpStatus.BAD_GATEWAY);
    }

    const formedTransactionBody = this.zero0xPaymentService.formTransactionBody(
      paymentQuote0x,
      body.sell.walletAddress,
    );

    this.exch0xService.addMissingFieldsToTransaction(
      formedTransactionBody,
      sellChain,
    );

    const paymentResult: SwapPaymentDataDTO = {
      senderWallet: {
        chainId: sellChain.id,
        address: body.sell.walletAddress,
      },
      bodyTransaction: formedTransactionBody,
    };

    this.zero0xPaymentService.checkAllowanceTargetOrAttachApprove(
      paymentResult,
      paymentQuote0x.allowanceTarget,
      {
        ...body.sell,
        amountWei: sellAmountWeiStringified,
      },
    );

    return paymentResult;
  }

  private async prepareCommonFeatures({ sell, buy }: DEXSwapSellGetQuoteDTO) {
    const sellChain = await this.dataChainService.findOneByIdOrFail(
      sell.chainId,
    );

    const buyChain = await this.dataChainService.findOneByIdOrFail(buy.chainId);

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

    const sell0xToken =
      await this.exch0xService.checkIfNativeCoinAndApplySymbol(
        sell.tokenAddress,
        sellChain,
      );
    const buy0xToken = await this.exch0xService.checkIfNativeCoinAndApplySymbol(
      buy.tokenAddress,
      buyChain,
    );

    const sellAmountWei = this.dataExchSwapHelpersService.formSellAmountInWei(
      sell.amount,
      sellToken.decimals,
    );

    return {
      sell0xToken,
      buy0xToken,
      sellAmountWeiStringified: sellAmountWei,
      buyTokenDecimals: buyToken.decimals,
      sellChain,
      buyChain,
    };
  }
}
