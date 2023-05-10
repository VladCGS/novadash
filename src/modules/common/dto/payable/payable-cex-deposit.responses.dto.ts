import { IsString } from 'class-validator';

export class CEXDepositAddressDTO {
  @IsString()
  symbol: string;

  @IsString()
  depositAddress: string;

  @IsString()
  chainIdDB: string;
}
