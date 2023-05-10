import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CEXFetchDepositStatusDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  depositId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionHash?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  symbol?: string;
}

export class CEXFetchDepositAddressDTO {
  @IsString()
  symbol: string;

  @IsString()
  chainIdDB: string;
}
