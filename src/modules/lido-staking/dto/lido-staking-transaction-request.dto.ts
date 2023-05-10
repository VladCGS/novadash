import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FormLidoStakingTransactionDataDTO {
  @ApiProperty()
  @IsString()
  depositAmount: string;

  @ApiProperty()
  @IsString()
  stakingAddress: string;

  @ApiProperty()
  @IsString()
  ownerAddress: string;
}
