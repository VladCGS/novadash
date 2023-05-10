import { SupportedEvmSlugsNames } from '@app/common/constants/supported-evm-chains.const';
import { SupportedWalletProviders } from '@app/common/entities/transactions';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWalletDTO {
  @ApiProperty({ maxLength: 255 })
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ maxLength: 255 })
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  provider: SupportedWalletProviders;

  @ApiProperty({ maxLength: 255 })
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ maxLength: 255 })
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  chainSlug: SupportedEvmSlugsNames;
}

export class UpdateWalletDTO {
  @ApiProperty({ maxLength: 255 })
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;
}
