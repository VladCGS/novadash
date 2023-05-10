import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FormUniswapV3IncreasingModalInitializationDataDTO {
  @ApiProperty()
  @IsString()
  chainIdDB: string;

  @ApiProperty()
  @IsString()
  positionId: string;
}
