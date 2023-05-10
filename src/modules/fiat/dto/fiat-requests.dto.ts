import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateFiatDTO {
  @ApiProperty({ maxLength: 512 })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ maxLength: 256 })
  @IsNotEmpty()
  country: string;

  @ApiProperty({ maxLength: 4 })
  @IsNotEmpty()
  @MaxLength(4)
  symbol: string;

  @ApiProperty({ maxLength: 256 })
  @IsNotEmpty()
  src: string;
}
