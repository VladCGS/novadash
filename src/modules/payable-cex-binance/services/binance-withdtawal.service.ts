import {
  BinanceChainNames,
  CHAIN_SLUGS_TO_BINANCE,
} from '@app/common/constants/chains-binance.const';
import { PureBinanceService } from '@app/common/modules/pure-cex-binance/services/pure-binance.service';
import {
  BinanceQuotaError,
  IBinanceKeys,
} from '@app/common/modules/pure-cex-binance/types/pure-binance.types';
import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';
import {
  ALPHAPING_CODES,
  ALPHAPING_ERROR_MESSAGES,
} from '@app/common/modules/error-handler/constants/alphaping-codes.const';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CEXWithdrawGetQuoteDTO } from '../../common/dto/payable/payable-cex-withdrawal.requests.dto';
import BigNumber from 'bignumber.js';
import {
  CEXWithdrawQuoteDTO,
  CEXWithdrawResultDataDTO,
} from '../../common/dto/payable/payable-cex-withdrawal.responses.dto';
import { PlatformCoin } from '@app/common/entities/alphaping';
import { BinanceCorrectorService } from '@app/common/modules/pure-cex-binance/services/binance-corrector.service';

@Injectable()
export class BinanceWithdrawalService {
  constructor(
    private dataChainService: DataChainService,
    private pureBinanceService: PureBinanceService,
    private readonly binanceCorrectorService: BinanceCorrectorService,
  ) {}

  async getWithdrawalQuote(
    quotaRequest: CEXWithdrawGetQuoteDTO,
    binanceCreds: IBinanceKeys,
    options?: {
      ignoreErrors?: boolean;
    },
  ): Promise<CEXWithdrawQuoteDTO> {
    const { amount, chainId, symbol, walletAddress } = quotaRequest;

    const slug = await this.getBinanceChainNameById(chainId);

    const resultQuote = await this.pureBinanceService.getWihdrawQuote(
      binanceCreds,
      {
        address: walletAddress,
        amount,
        coinSymbol: symbol,
        network: slug,
      },
    );

    if (resultQuote.error && !options?.ignoreErrors) {
      this.generateAndThrowExceptionByBinanceError(
        resultQuote.error,
        resultQuote.withdrawMin,
      );
    }

    const correctedAddress =
      await this.binanceCorrectorService.correctBinanceWithdrawAddressToDBAddress(
        {
          symbol,
          withdrawBinanceAddress: resultQuote?.withdrawTokenAddress,
          chainId: quotaRequest.chainId,
        },
      );

    const foundToken = await PlatformCoin.findOneBy({
      tokenAddress: correctedAddress,
      chain: {
        id: chainId,
      },
    });

    return {
      output: {
        ...quotaRequest,
        // To handle 193.200000000001,
        decimals: String(foundToken.decimals),
        tokenAddress: correctedAddress,
        amount: BigNumber(quotaRequest.amount)
          .minus(resultQuote.withdrawFee)
          .toString(),
      },
      feesIncluded: [{ symbol, amount: String(resultQuote.withdrawFee) }],
      feesToPay: [],
    };
  }

  private generateAndThrowExceptionByBinanceError(
    error: BinanceQuotaError,
    withdrawMinAmount: number,
  ) {
    let message: string;
    let code: number;
    switch (error) {
      case BinanceQuotaError.WITHDRAWAL_DISABLED: {
        message =
          ALPHAPING_ERROR_MESSAGES[ALPHAPING_CODES.cexWithdrawalDisabled];
        code = ALPHAPING_CODES.cexWithdrawalDisabled;
        break;
      }
      case BinanceQuotaError.WRONG_AMOUNT: {
        message = `${
          ALPHAPING_ERROR_MESSAGES[ALPHAPING_CODES.cexWithdrawalTooSmallAmount]
        } Min amount - ${withdrawMinAmount}`;
        code = ALPHAPING_CODES.cexWithdrawalTooSmallAmount;
        break;
      }
      case BinanceQuotaError.WRONG_WALLET: {
        message =
          ALPHAPING_ERROR_MESSAGES[
            ALPHAPING_CODES.binanceWithdrawalWrongWallet
          ];
        code = ALPHAPING_CODES.binanceWithdrawalWrongWallet;
        break;
      }
    }

    throw new HttpException(
      {
        message,
        code,
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  private async getBinanceChainNameById(
    chainId: string,
  ): Promise<BinanceChainNames> {
    const foundChain = await this.dataChainService.findOneByIdOrFail(chainId);
    return CHAIN_SLUGS_TO_BINANCE[foundChain.slug];
  }

  async withdraw(
    quotaRequest: CEXWithdrawGetQuoteDTO,
    binanceCreds: IBinanceKeys,
  ): Promise<CEXWithdrawResultDataDTO> {
    await this.getWithdrawalQuote(quotaRequest, binanceCreds);

    const networkName = await this.getBinanceChainNameById(
      quotaRequest.chainId,
    );

    return this.pureBinanceService.withdraw(binanceCreds, {
      address: quotaRequest.walletAddress,
      amount: quotaRequest.amount,
      coinSymbol: quotaRequest.symbol,
      network: networkName,
    });
  }

  async getWithdrawStatus(withdrawId: string, binanceCreds: IBinanceKeys) {
    return this.pureBinanceService.getWithdrawStatus(binanceCreds, withdrawId);
  }
}
