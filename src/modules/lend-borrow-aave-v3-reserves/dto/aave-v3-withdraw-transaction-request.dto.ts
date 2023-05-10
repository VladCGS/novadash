import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class FormAaveV3WithdrawTransactionDataDTO {
  @ApiProperty()
  @IsString()
  withdrawAmount: string;

  @ApiProperty()
  @IsString()
  reserveAddress: string;

  @ApiProperty()
  @IsString()
  ownerAddress: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  useNativeToken?: boolean = true;
}
