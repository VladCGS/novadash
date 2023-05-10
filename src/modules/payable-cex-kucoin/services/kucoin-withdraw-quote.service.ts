import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IKucoinKeys } from '../types/kucoin-keys.types';
import { PureKucoinService } from '@app/common/modules/pure-cex-kucoin/services/pure-kucoin.service';
import { CEXWithdrawGetQuoteDTO } from '../../common/dto/payable/payable-cex-withdrawal.requests.dto';
import { CEXWithdrawQuoteDTO } from '../../common/dto/payable/payable-cex-withdrawal.responses.dto';
import { IKucoinWithdrawQuote } from '@app/common/modules/pure-cex-kucoin/types/pure-kucoin-client.responses';
import { formAlphapingExceptionBody } from '@app/common/utils/form-alphaping-exception-body.util';
import { ALPHAPING_CODES } from '@app/common/modules/error-handler/constants/alphaping-codes.const';
import { IKucoinCurrencyWithChainRequest } from '@app/common/modules/pure-cex-kucoin/types/pure-kucoin-client.requests';
import { Chain } from '@app/common/entities/transactions';
import { SUPPORTED_EVM_SLUGS } from '@app/common/constants/supported-evm-chains.const';
import { KucoinDepositService } from './kucoin-deposit.service';
import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import { PlatformCoin } from '@app/common/entities/alphaping';
import BigNumber from 'bignumber.js';

@Injectable()
export class KucoinWithdrawQuoteService {
  constructor(
    private readonly pureKucoinService: PureKucoinService,
    private readonly kucoinDepositService: KucoinDepositService,
  ) {}

  async formWithdrawQuote(
    credentials: IKucoinKeys,
    withdrawalRequest: CEXWithdrawGetQuoteDTO,
  ): Promise<CEXWithdrawQuoteDTO> {
    const kucoinWithdrawalQuote =
      await this.pureKucoinService.getWithdrawalQuote(credentials, {
        currency: withdrawalRequest.symbol,
        chain: withdrawalRequest.symbol === 'ETH' ? '' : 'ERC20',
      });
    console.log(kucoinWithdrawalQuote);
    this.checkIfWithdrawEnabled(kucoinWithdrawalQuote.data);
    this.checkIfWithdrawMinAmountCorrect(
      kucoinWithdrawalQuote.data,
      withdrawalRequest,
    );
    this.checkIfWithdrawLimitAmountCorrect(
      kucoinWithdrawalQuote.data,
      withdrawalRequest,
    );

    const foundChain = await Chain.findOneBy({
      slug: SUPPORTED_EVM_SLUGS.ETH,
    });

    const foundToken = await this.fetchWithdrawPlatformCoin(
      credentials,
      {
        currency: withdrawalRequest.symbol,
      },
      foundChain.id,
    );

    return {
      output: {
        amount: BigNumber(withdrawalRequest.amount)
          .minus(kucoinWithdrawalQuote.data.withdrawMinFee)
          .toString(),
        symbol: withdrawalRequest.symbol,
        decimals: String(foundToken.decimals),
        chainId: foundChain.id,
        tokenAddress: foundToken.tokenAddress,
        walletAddress: withdrawalRequest.walletAddress,
      },
      feesIncluded: [
        {
          symbol: withdrawalRequest.symbol,
          amount: kucoinWithdrawalQuote.data.withdrawMinFee,
        },
      ],
      feesToPay: [],
    };
  }

  private checkIfWithdrawEnabled(quatas: IKucoinWithdrawQuote) {
    if (!quatas.isWithdrawEnabled) {
      throw new HttpException(
        formAlphapingExceptionBody(ALPHAPING_CODES.cexWithdrawalDisabled),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private checkIfWithdrawMinAmountCorrect(
    quatas: IKucoinWithdrawQuote,
    withdrawRequest: CEXWithdrawGetQuoteDTO,
  ) {
    if (
      !(
        parseFloat(withdrawRequest.amount) >= parseFloat(quatas.withdrawMinSize)
      )
    ) {
      throw new HttpException(
        formAlphapingExceptionBody(ALPHAPING_CODES.cexWithdrawalTooSmallAmount),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private checkIfWithdrawLimitAmountCorrect(
    quatas: IKucoinWithdrawQuote,
    withdrawRequest: CEXWithdrawGetQuoteDTO,
  ) {
    if (
      !(parseFloat(withdrawRequest.amount) >= parseFloat(quatas.remainAmount))
    ) {
      throw new HttpException(
        formAlphapingExceptionBody(ALPHAPING_CODES.cexWithdrawalTooSmallAmount),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async fetchWithdrawPlatformCoin(
    keys: IKucoinKeys,
    params: IKucoinCurrencyWithChainRequest,
    chainDBId: string,
  ): Promise<PlatformCoin> {
    const depositMethod =
      await this.kucoinDepositService.fetchOrCreateNewDepositRoute(
        keys,
        params.currency,
      );

    const tokenAddress = depositMethod.contractAddress ?? NATIVE_UNI_ADDRESS;

    const foundToken = await PlatformCoin.findOneBy({
      tokenAddress,
      chain: {
        id: chainDBId,
      },
    });

    if (!foundToken) {
      throw new HttpException(
        'Couldn`t find token for withdraw symbol',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return foundToken;
  }
}
