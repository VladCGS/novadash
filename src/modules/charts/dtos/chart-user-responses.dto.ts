import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';
import { DateWithPriceDTO } from './chart-user-common.dto';
import { FormTokenChartBaseDTO } from './chart-user-requests.dto';

export class TokenChartDTO extends FormTokenChartBaseDTO {
  @ApiProperty()
  @IsArray()
  @Type(() => DateWithPriceDTO)
  result: DateWithPriceDTO[];
}
