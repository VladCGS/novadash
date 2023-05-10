import { PaymentMethodsEnum } from '@app/common/types/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SwapAssetWithAmountDTO } from './payable-common.requests.dto';

export class RampGetQuoteOptionsDTO {
  @ApiProperty()
  @IsString()
  cardCountry?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  depositIncludesFee?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paymentMethod?: PaymentMethodsEnum;
}

export class CardCredentialsDTO {
  @ApiPropertyOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  street1?: string;
}

export class RampQuoteReservationOptionsDTO extends RampGetQuoteOptionsDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  redirectLinkSuccess?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  redirectLinkError?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => CardCredentialsDTO)
  cardDetails: CardCredentialsDTO;
}

export class RampCurrencyDTO {
  @ApiProperty()
  @IsString()
  symbol: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tokenAddress?: string;

  @ApiProperty()
  @IsString()
  chainId: string;

  @ApiProperty()
  @IsString()
  walletAddress: string;
}

export class RampFiatDTO {
  @ApiProperty()
  @IsString()
  symbol: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}

export class RampFiatWithAmountDTO extends RampFiatDTO {
  @ApiProperty()
  @IsString()
  amount: string;
}

export class RampCurrencyWithAmountDTO extends RampCurrencyDTO {
  @ApiProperty()
  @IsString()
  amount: string;
}

export class RampPaymentDataDTO {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paymentUrl: string;
}

export class OnRampQuoteFeesBaseDTO {
  @ApiProperty({ isArray: true, type: () => SwapAssetWithAmountDTO })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SwapAssetWithAmountDTO)
  feesIncluded: SwapAssetWithAmountDTO[];

  @ApiProperty({ isArray: true, type: () => SwapAssetWithAmountDTO })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SwapAssetWithAmountDTO)
  feesToPay: SwapAssetWithAmountDTO[];
}
