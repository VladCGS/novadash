import { SupportedCEXProviders } from '@app/common/entities/pairs';
import { Wallet } from '@app/common/entities/transactions';

export interface IFilterSupportedOptions {
  onlyPlatformCoinsIds?: string[];
  onlySupportedByDEXs?: boolean;
  onlySupportedByCEX?: SupportedCEXProviders;
}

export interface IFindDEXSupportedTokenAddresses {
  wallet: Wallet;
  tokenAddresses: string[];
}

export interface IFindCEXSupportedTokenAddresses
  extends IFindDEXSupportedTokenAddresses {
  cex: SupportedCEXProviders;
}
