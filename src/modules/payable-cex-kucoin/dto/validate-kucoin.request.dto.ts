import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class KucoinCredentialsDTO {
  @ApiProperty({
    description: 'Kucoin API key',
  })
  @IsString()
  apiKey: string;

  @ApiProperty({
    description: 'Kucoin API secret',
  })
  @IsString()
  apiSecret: string;

  @ApiProperty({
    description: 'Kucoin API secret',
  })
  @IsString()
  apiPassphrase: string;
}
