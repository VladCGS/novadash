import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';

export class FetchChainMetaByDBIDsDTO {
  @ApiProperty()
  @IsArray()
  @Type(() => String)
  chainIds: string[];
}
