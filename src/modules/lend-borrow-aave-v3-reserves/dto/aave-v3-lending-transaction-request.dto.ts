import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FormAaveV3LendingTransactionDataDTO {
  @ApiProperty()
  @IsString()
  depositAmount: string;

  @ApiProperty()
  @IsString()
  reserveAddress: string;

  @ApiProperty()
  @IsString()
  ownerAddress: string;
}
