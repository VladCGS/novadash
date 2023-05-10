import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';
import {
  SwapCurrencyDTO,
  SwapCurrencyWithAmountDTO,
} from './payable-common.requests.dto';

export class DEXSwapSellGetQuoteDTO {
  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => SwapCurrencyWithAmountDTO)
  sell: SwapCurrencyWithAmountDTO;

  @ApiProperty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => SwapCurrencyDTO)
  buy: SwapCurrencyDTO;
}
