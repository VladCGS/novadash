import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FromCompoundV2WithdrawTransactionData {
  @ApiProperty()
  @IsString()
  withdrawAmount: string;

  @ApiProperty()
  @IsString()
  reserveAddress: string;

  @ApiProperty()
  @IsString()
  ownerAddress: string;
}
