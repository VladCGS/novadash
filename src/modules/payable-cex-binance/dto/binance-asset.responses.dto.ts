import { IsString } from 'class-validator';

export class BinanceAssetDepositAddressDTO {
  @IsString()
  symbol: string;

  @IsString()
  depositAddress: string;

  @IsString()
  chainIdDB: string;
}
