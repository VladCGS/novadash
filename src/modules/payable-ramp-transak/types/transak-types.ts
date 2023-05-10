import { PaymentMethodsEnum } from '@app/common/types/enums';
import { TransakNetworks } from '../constants/chainslug-to-transak.const';

export interface ITransakWidgetCustomizationUserDataAddressDTO {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postCode?: string;
  countryCode?: string;
}

export interface ITransakWidgetCustomizationUserDataDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  dob?: string;
  address?: ITransakWidgetCustomizationUserDataAddressDTO;
}

export interface ITransakWidgetCustomizationOptionsBase {
  cryptoCurrencyCode?: string;
  defaultCryptoCurrency?: string;
  cryptoCurrencyList?: string;
  networks?:
    | Record<string, { address: string; addressAdditionalData?: string }>
    | string;
  network?: TransakNetworks;
  fiatCurrency?: string;
  countryCode?: string;
  defaultNetwork?: string;
  defaultCryptoAmount?: number;
  email?: string;
  userData?: ITransakWidgetCustomizationUserDataDTO;
  partnerOrderId?: string;
  partnerCustomerId?: string;
  redirectURL?: string;
  isAutoFillUserData?: boolean;
  themeColor?: string;
  widgetHeight?: string;
  widgetWidth?: string;
  hideMenu?: boolean;
  isFeeCalculationHidden?: boolean;
  exchangeScreenTitle?: string;
}

export interface ITransakWidgetCustomizationOptionsSell
  extends ITransakWidgetCustomizationOptionsBase {
  cryptoAmount?: number;
}

export interface ITransakWidgetCustomizationOptionsBuy
  extends ITransakWidgetCustomizationOptionsBase {
  walletAddress?: string;
  walletAddressesData?: {
    networks?: Record<
      string,
      { address: string; addressAdditionalData?: string }
    >;
  };
  fiatAmount?: number;
  defaultFiatAmount?: number;
  paymentMethod?: PaymentMethodsEnum;
  defaultPaymentMethod?: PaymentMethodsEnum;
  disableWalletAddressForm?: boolean;
  hideExchangeScreen?: boolean;
  isDisableCrypto?: boolean;
}
