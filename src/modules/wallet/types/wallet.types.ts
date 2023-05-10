import { CreateWalletDTO } from '../dto/wallet-requests.dto';

export interface IWallet {
  name: string;
  provider: string;
  address: string;
  balance: number;
}

export interface IWalletUpdate extends IWallet {
  walletId: string;
}

export interface IWalletDelete {
  userId: string;
  walletId: string;
}

export interface ICreateWallet {
  walletBody: CreateWalletDTO;
  userId: string;
}
