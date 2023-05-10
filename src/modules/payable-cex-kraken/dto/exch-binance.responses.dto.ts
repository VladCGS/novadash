import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BSwapFinalStatusDTO {
  @ApiProperty()
  executed: boolean;

  @ApiPropertyOptional()
  error?: string;

  @ApiPropertyOptional()
  binanceInfo: any;
}
