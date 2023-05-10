import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class BinanceCredentialsDTO {
  @ApiProperty({
    description: 'Binance API key',
  })
  @IsString()
  apiKey: string;

  @ApiProperty({
    description: 'Binance API secret',
  })
  @IsString()
  apiSecret: string;
}
