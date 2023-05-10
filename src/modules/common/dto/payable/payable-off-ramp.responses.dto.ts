import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject } from 'class-validator';
import {
  OnRampQuoteFeesBaseDTO,
  RampCurrencyWithAmountDTO,
  RampFiatWithAmountDTO,
} from './payable-ramp-common.dto';

export class OffRampQuoteDTO extends OnRampQuoteFeesBaseDTO {
  @ApiProperty()
  @IsObject()
  @Type(() => RampCurrencyWithAmountDTO)
  sell: RampCurrencyWithAmountDTO;

  @ApiProperty()
  @IsObject()
  @Type(() => RampFiatWithAmountDTO)
  buy: RampFiatWithAmountDTO;
}
