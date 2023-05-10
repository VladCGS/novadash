import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { SupportedCEXProviders } from '@app/common/entities/pairs';

export class FetchDestinationHotWalletsDTO {
  @ApiPropertyOptional({
    type: String,
    description: 'Token symbol',
  })
  @IsString()
  @IsOptional()
  excludeWalletId?: string;

  @ApiPropertyOptional({
    type: String,
    isArray: true,
    description: 'Chain IDs',
  })
  @IsArray()
  @IsOptional()
  @Type(() => String)
  chainIds?: string[];
}

export class FetchDestinationSpotWalletsDTO {
  @ApiProperty({
    type: String,
    description: 'Token symbol',
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    type: String,
    description: 'Token chain id',
  })
  @IsString()
  chainId: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Not include this exchanges in result',
  })
  @IsOptional()
  @IsString()
  excludeCEX?: SupportedCEXProviders;
}
