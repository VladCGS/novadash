import { IsString } from 'class-validator';

export class BinanceSymbolAndDBChainDTO {
  @IsString()
  symbol: string;

  @IsString()
  chainIdDB: string;
}

export class BinanceFetchAssetWithdrawChainsDTO {
  @IsString()
  symbol: string;
}
