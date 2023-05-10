import { Injectable } from '@nestjs/common';
import {
  ITransakPaymentDataOptionsOffRamp,
  ITransakPaymentDataOptionsOnRamp,
} from '../types/exch-transak-service.types';
import { RampPaymentDataDTO } from '../../common/dto/payable/payable-ramp-common.dto';
import { User } from '@app/common/entities/alphaping';
import {
  ITransakWidgetCustomizationOptionsBuy,
  ITransakWidgetCustomizationOptionsSell,
} from '../types/transak-types';
import { stringify } from 'querystring';
import { PaymentMethodsEnum } from '@app/common/types/enums';
import { PAYMENT_METHODS_TRANSAK } from '../constants/payment-method.const';
import { ConfigService } from '@nestjs/config';
import { TransakRampMode } from '@app/common/modules/transak/types/pure-transak.types';
import { TransakNetworkService } from './transak-network.service';

@Injectable()
export class TransakWidgetLinkService {
  constructor(
    private readonly configService: ConfigService,
    private readonly transakNetworkService: TransakNetworkService,
  ) {}

  async formPaymentUrlOnRamp(
    options: ITransakPaymentDataOptionsOnRamp,
  ): Promise<RampPaymentDataDTO> {
    const { body, userId } = options;
    const { sell, buy, options: bodyOptions } = body;

    const userData = await User.findOne({
      where: {
        id: userId,
      },
    });

    const widgetURL = this.createTransakUrlWithApiKeyAndPaymentMethod(
      TransakRampMode.ON_RAMP,
      bodyOptions?.paymentMethod ?? PaymentMethodsEnum.DEBIT_CARD,
    );

    const widgetCustomizationOptions: ITransakWidgetCustomizationOptionsBuy = {
      userData: {
        email: userData.username,
      },
      walletAddress: buy.walletAddress,
      fiatCurrency: sell.symbol,
      defaultCryptoCurrency: buy.symbol,
      email: userData.username,
    };

    const transakNetwork =
      await this.transakNetworkService.findTransakNetworkByChainDBId(
        buy.chainId,
      );

    if (transakNetwork) {
      widgetCustomizationOptions.defaultNetwork = transakNetwork;
    }

    if ('amount' in sell) {
      widgetCustomizationOptions.defaultFiatAmount = Number(sell.amount);
    } else if ('amount' in buy) {
      widgetCustomizationOptions.defaultCryptoAmount = Number(buy.amount);
    }

    for (const key in widgetCustomizationOptions) {
      const keyValue = widgetCustomizationOptions[key];
      let formatedValue;
      if (typeof keyValue === 'object') {
        const objWithStrigifiedValues = {};
        for (const objKey in keyValue) {
          objWithStrigifiedValues[objKey] = JSON.stringify(keyValue[objKey]);
        }
        formatedValue = stringify(objWithStrigifiedValues);
      } else {
        formatedValue = keyValue;
      }

      widgetURL.searchParams.append(key, `${formatedValue}`);
    }

    return {
      paymentUrl: widgetURL.toString(),
    };
  }

  async formPaymentUrlOffRamp(
    options: ITransakPaymentDataOptionsOffRamp,
  ): Promise<RampPaymentDataDTO> {
    const { body, userId } = options;
    const { buy, sell, options: bodyOptions } = body;

    const userData = await User.findOne({
      where: {
        id: userId,
      },
    });

    const widgetURL = this.createTransakUrlWithApiKeyAndPaymentMethod(
      TransakRampMode.OFF_RAMP,
      bodyOptions.paymentMethod,
    );

    const widgetCustomizationOptions: ITransakWidgetCustomizationOptionsSell = {
      userData: {
        email: userData.username,
      },
      fiatCurrency: buy.symbol,
      defaultCryptoCurrency: sell.symbol,
      email: userData.username,
    };

    const transakNetwork =
      await this.transakNetworkService.findTransakNetworkByChainDBId(
        sell.chainId,
      );
    if (transakNetwork) {
      widgetCustomizationOptions.defaultNetwork = transakNetwork;
    }

    if ('amount' in sell) {
      widgetCustomizationOptions.defaultCryptoAmount = Number(sell.amount);
    }

    for (const key in widgetCustomizationOptions) {
      const keyValue = widgetCustomizationOptions[key];
      const formatedValue =
        typeof keyValue === 'object' ? stringify(keyValue) : keyValue;

      widgetURL.searchParams.append(key, `${formatedValue}`);
    }

    const stringifiedWidgetUrl = widgetURL.toString();

    return {
      paymentUrl: stringifiedWidgetUrl,
    };
  }

  private createTransakUrlWithApiKeyAndPaymentMethod(
    mode: TransakRampMode,
    paymentMethod?: PaymentMethodsEnum,
  ) {
    const transakWidgetUrl = this.configService.get('TRANSAK_LIVE_WIDGET_URL');
    const transakApiKey = this.configService.get('TRANSAK_LIVE_API_KEY');
    const transakPaymentMethod = PAYMENT_METHODS_TRANSAK[paymentMethod];

    const widgetURL = new URL('', transakWidgetUrl);

    widgetURL.searchParams.append('apiKey', transakApiKey);
    widgetURL.searchParams.append('productsAvailed', mode);

    if (paymentMethod) {
      widgetURL.searchParams.append('paymentMethod', transakPaymentMethod);
    }

    return widgetURL;
  }
}
