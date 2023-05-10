import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject } from 'class-validator';
import {
  OnRampQuoteFeesBaseDTO,
  RampCurrencyWithAmountDTO,
  RampFiatWithAmountDTO,
} from './payable-ramp-common.dto';

export class OnRampQuoteDTO extends OnRampQuoteFeesBaseDTO {
  @ApiProperty()
  @IsObject()
  @Type(() => RampFiatWithAmountDTO)
  sell: RampFiatWithAmountDTO;

  @ApiProperty()
  @IsObject()
  @Type(() => RampCurrencyWithAmountDTO)
  buy: RampCurrencyWithAmountDTO;
}
