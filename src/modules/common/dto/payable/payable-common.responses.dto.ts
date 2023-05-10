import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FinalStatusDTO {
  @ApiProperty()
  executed: boolean;

  @ApiPropertyOptional()
  error?: string;

  @ApiPropertyOptional()
  info: any;
}
