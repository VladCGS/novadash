import { NativeCoinsSymbols } from '@app/common/constants/native-coins.const';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class FormLidoWithdrawTransactionDataDTO {
  @ApiProperty()
  @IsString()
  amount: string;

  @ApiProperty()
  @IsString()
  walletAddress: string;

  @ApiProperty()
  @IsEnum(NativeCoinsSymbols)
  symbol: NativeCoinsSymbols;
}
