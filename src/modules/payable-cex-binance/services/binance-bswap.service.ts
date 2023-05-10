import { PureBinanceService } from '@app/common/modules/pure-cex-binance/services/pure-binance.service';
import {
  BinanceQuotaError,
  IBinanceKeys,
  IPureBinanceBSwapQuote,
} from '@app/common/modules/pure-cex-binance/types/pure-binance.types';
import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';
import {
  ALPHAPING_CODES,
  ALPHAPING_ERROR_MESSAGES,
} from '@app/common/modules/error-handler/constants/alphaping-codes.const';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CEXSwapGetQuoteDTO } from '../../common/dto/payable/payable-cex-swap.requests.dto';
import {
  CEXSwapQuoteDTO,
  CEXSwapResultDataDTO,
} from '../../common/dto/payable/payable-cex-swap.responses.dto';

@Injectable()
export class BinanceBSwapService {
  constructor(
    private readonly dataChainService: DataChainService,
    private readonly pureBinanceService: PureBinanceService,
  ) {}

  async callBSwap(
    quotaRequest: CEXSwapGetQuoteDTO,
    binanceCreds: IBinanceKeys,
  ): Promise<CEXSwapResultDataDTO> {
    const result = await this.pureBinanceService.callBswap(
      binanceCreds,
      quotaRequest,
      {
        onError: (err) => {
          return this.generateAndThrowExceptionByBinanceError(err.code);
        },
      },
    );
    return {
      swapId: String(result.swapId),
    };
  }

  async getBSwapQuote(
    quotaRequest: CEXSwapGetQuoteDTO,
    binanceCreds: IBinanceKeys,
  ): Promise<CEXSwapQuoteDTO> {
    const result = await this.pureBinanceService.getBSwapQuote(
      binanceCreds,
      quotaRequest,
      {
        onError: (err) => {
          return this.generateAndThrowExceptionByBinanceError(err.code);
        },
      },
    );
    return this.formQuoteResponse(result);
  }

  private generateAndThrowExceptionByBinanceError(error: BinanceQuotaError) {
    let message: string;
    let code: number;
    switch (error) {
      case BinanceQuotaError.TOO_SMALL_BSWAP_REQUEST: {
        message =
          ALPHAPING_ERROR_MESSAGES[ALPHAPING_CODES.cexTooSwapSmallAmount];
        code = ALPHAPING_CODES.cexTooSwapSmallAmount;
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

  private formQuoteResponse(
    bswapQuote: IPureBinanceBSwapQuote,
  ): CEXSwapQuoteDTO {
    return {
      sell: {
        amount: String(bswapQuote.quoteQty),
        symbol: bswapQuote.quoteAsset,
      },
      buy: {
        amount: String(bswapQuote.baseQty),
        symbol: bswapQuote.baseAsset,
      },
      feesIncluded: [
        { amount: String(bswapQuote.fee), symbol: bswapQuote.quoteAsset },
      ],
      feesToPay: [],
    };
  }

  async getBSwapStatus(swapId: string, binanceCreds: IBinanceKeys) {
    return this.pureBinanceService.getBSwapStatus(binanceCreds, swapId);
  }

  async getDepositStatus(transactionId: string, binanceCreds: IBinanceKeys) {
    return this.pureBinanceService.getDepositStatus(binanceCreds, {
      txId: transactionId,
    });
  }
}
