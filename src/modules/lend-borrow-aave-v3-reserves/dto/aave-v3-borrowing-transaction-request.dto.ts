import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export enum InterestRate {
  None = 'None',
  Stable = 'Stable',
  Variable = 'Variable',
}

export class FormAaveV3BorrowingTransactionDTO {
  @ApiProperty()
  @IsEnum(InterestRate)
  interestRateMode: InterestRate;

  @ApiProperty()
  @IsString()
  reserveAddress: string;

  @ApiProperty()
  @IsString()
  ownerAddress: string;

  @ApiProperty()
  @IsString()
  borrowAmount: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  useNativeToken?: boolean = true;
}
