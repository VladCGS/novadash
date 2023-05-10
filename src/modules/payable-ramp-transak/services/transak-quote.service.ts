import { PureTransakService } from '@app/common/modules/transak/services/pure-transak.service';
import {
  IGetTransakQuoteOptions,
  IGetTransakQuoteResponseData,
  TransakRampMode,
} from '@app/common/modules/transak/types/pure-transak.types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OffRampBuyGetQuoteDTO,
  OffRampSellGetQuoteDTO,
} from '../../common/dto/payable/payable-off-ramp.requests.dto';
import { OffRampQuoteDTO } from '../../common/dto/payable/payable-off-ramp.responses.dto';
import {
  OnRampBuyGetQuoteDTO,
  OnRampSellGetQuoteDTO,
} from '../../common/dto/payable/payable-on-ramp.requests.dto';
import { OnRampQuoteDTO } from '../../common/dto/payable/payable-on-ramp.responses.dto';
import { RampGetQuoteOptionsDTO } from '../../common/dto/payable/payable-ramp-common.dto';
import { PAYMENT_METHODS_TRANSAK } from '../constants/payment-method.const';
import { TransakNetworkService } from './transak-network.service';
import { PaymentMethodsEnum } from '@app/common/types/enums';

@Injectable()
export class TransakQuoteService {
  constructor(
    private readonly pureTransakService: PureTransakService,
    private readonly configService: ConfigService,
    private readonly transakNetworkService: TransakNetworkService,
  ) {}

  async getQuoteOnRamp(body: OnRampBuyGetQuoteDTO): Promise<OnRampQuoteDTO>;
  async getQuoteOnRamp(body: OnRampSellGetQuoteDTO): Promise<OnRampQuoteDTO>;
  async getQuoteOnRamp(
    body: OnRampBuyGetQuoteDTO | OnRampSellGetQuoteDTO,
  ): Promise<OnRampQuoteDTO> {
    const responseQuote = await this.getQuoteByBody(
      TransakRampMode.ON_RAMP,
      {
        fiatSetup: body.sell,
        cryptoSetup: body.buy,
      },
      body.options,
    );

    return {
      sell: {
        amount: responseQuote.fiatAmount.toString(),
        symbol: responseQuote.fiatCurrency,
      },
      buy: {
        amount: responseQuote.cryptoAmount.toString(),
        symbol: responseQuote.cryptoCurrency,
        chainId: body.buy.chainId,
        walletAddress: body.buy.walletAddress,
        name: body.buy.name,
        tokenAddress: body.buy.tokenAddress,
      },
      feesToPay: [
        {
          amount: responseQuote.totalFee.toString(),
          symbol: responseQuote.fiatCurrency,
        },
      ],
      feesIncluded: [],
    };
  }

  async getQuoteOffRamp(body: OffRampBuyGetQuoteDTO): Promise<OffRampQuoteDTO>;
  async getQuoteOffRamp(body: OffRampSellGetQuoteDTO): Promise<OffRampQuoteDTO>;
  async getQuoteOffRamp(
    body: OffRampSellGetQuoteDTO | OffRampBuyGetQuoteDTO,
  ): Promise<OffRampQuoteDTO> {
    const responseQuote = await this.getQuoteByBody(
      TransakRampMode.OFF_RAMP,
      {
        fiatSetup: body.buy,
        cryptoSetup: body.sell,
      },
      body.options,
    );
    return {
      sell: {
        amount: responseQuote.cryptoAmount.toString(),
        symbol: responseQuote.cryptoCurrency,
        chainId: body.sell.chainId,
        walletAddress: body.sell.walletAddress,
        name: body.sell.name,
        tokenAddress: body.sell.tokenAddress,
      },
      buy: {
        amount: responseQuote.fiatAmount.toString(),
        symbol: responseQuote.fiatCurrency,
      },
      feesToPay: [
        {
          amount: responseQuote.totalFee.toString(),
          symbol: responseQuote.fiatCurrency,
        },
      ],
      feesIncluded: [],
    };
  }

  private async getQuoteByBody(
    rampMode: TransakRampMode,
    setup: {
      cryptoSetup: {
        chainId: string;
        amount?: string;
        symbol: string;
      };
      fiatSetup: {
        amount?: string;
        symbol: string;
      };
    },
    options?: RampGetQuoteOptionsDTO,
  ): Promise<IGetTransakQuoteResponseData> {
    const paymentMethod =
      PAYMENT_METHODS_TRANSAK[
        options?.paymentMethod ?? PaymentMethodsEnum.DEBIT_CARD
      ];

    const transakNetwork =
      await this.transakNetworkService.findTransakNetworkByChainDBId(
        setup.cryptoSetup.chainId,
      );

    const getQuoteOptions: IGetTransakQuoteOptions = {
      cryptoCurrency: setup.cryptoSetup.symbol,
      fiatCurrency: setup.fiatSetup.symbol,
      isBuyOrSell: rampMode,
      paymentMethod,
      network: transakNetwork,
    };

    if ('amount' in setup.cryptoSetup) {
      getQuoteOptions['cryptoAmount'] = Number(setup.cryptoSetup.amount);
    } else if ('amount' in setup.fiatSetup) {
      getQuoteOptions['fiatAmount'] = Number(setup.fiatSetup.amount);
    }

    if (!getQuoteOptions['fiatAmount'] && !getQuoteOptions['cryptoAmount'])
      throw new HttpException(
        'Specify crypto or fiat amount',
        HttpStatus.BAD_REQUEST,
      );

    return this.pureTransakService.getQuote(getQuoteOptions);
  }
}
