import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';
import {
  RampCurrencyDTO,
  RampCurrencyWithAmountDTO,
  RampFiatDTO,
  RampFiatWithAmountDTO,
  RampGetQuoteOptionsDTO,
  RampQuoteReservationOptionsDTO,
} from './payable-ramp-common.dto';

export class OffRampSellGetQuoteDTO {
  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampFiatWithAmountDTO)
  sell: RampCurrencyWithAmountDTO;

  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampCurrencyDTO)
  buy: RampFiatDTO;

  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampGetQuoteOptionsDTO)
  options: RampGetQuoteOptionsDTO;
}

export class OffRampBuyGetQuoteDTO {
  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampFiatDTO)
  sell: RampCurrencyDTO;

  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampCurrencyWithAmountDTO)
  buy: RampFiatWithAmountDTO;

  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampGetQuoteOptionsDTO)
  options: RampGetQuoteOptionsDTO;
}

export class OffRampSellGetPaymentDataDTO {
  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampCurrencyWithAmountDTO)
  sell: RampCurrencyWithAmountDTO;

  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampFiatDTO)
  buy: RampFiatDTO;

  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampQuoteReservationOptionsDTO)
  options: RampQuoteReservationOptionsDTO;
}

export class OffRampBuyGetPaymentDataDTO {
  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampCurrencyDTO)
  sell: RampCurrencyDTO;

  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampFiatDTO)
  buy: RampFiatDTO;

  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => RampQuoteReservationOptionsDTO)
  options: RampQuoteReservationOptionsDTO;
}
