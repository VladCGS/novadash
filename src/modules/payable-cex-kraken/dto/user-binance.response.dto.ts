import { ApiProperty } from '@nestjs/swagger';

export class BinanceApiCheckResponseDTO {
  @ApiProperty()
  isValid: boolean;

  @ApiProperty({ isArray: true })
  missingPermissions: string[];
}
