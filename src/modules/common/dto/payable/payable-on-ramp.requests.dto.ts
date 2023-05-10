import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import {
  RampCurrencyDTO,
  RampCurrencyWithAmountDTO,
  RampFiatDTO,
  RampFiatWithAmountDTO,
  RampGetQuoteOptionsDTO,
  RampQuoteReservationOptionsDTO,
} from './payable-ramp-common.dto';

export class OnRampSellGetQuoteDTO {
  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampFiatWithAmountDTO)
  sell: RampFiatWithAmountDTO;

  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampCurrencyDTO)
  buy: RampCurrencyDTO;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampGetQuoteOptionsDTO)
  options?: RampGetQuoteOptionsDTO;
}

export class OnRampBuyGetQuoteDTO {
  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampFiatDTO)
  sell: RampFiatDTO;

  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampCurrencyWithAmountDTO)
  buy: RampCurrencyWithAmountDTO;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RampGetQuoteOptionsDTO)
  options?: RampGetQuoteOptionsDTO;
}

export class OnRampSellGetPaymentDataDTO {
  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampFiatWithAmountDTO)
  sell: RampFiatWithAmountDTO;

  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampCurrencyDTO)
  buy: RampCurrencyDTO;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampQuoteReservationOptionsDTO)
  options: RampQuoteReservationOptionsDTO;
}

export class OnRampBuyGetPaymentDataDTO {
  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampFiatDTO)
  sell: RampFiatDTO;

  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampCurrencyWithAmountDTO)
  buy: RampCurrencyWithAmountDTO;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampQuoteReservationOptionsDTO)
  options?: RampQuoteReservationOptionsDTO;
}
