import { PageQueryDTO } from '@app/common/dtos';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class GetDepositFiatsQueryDTO extends PageQueryDTO {
  @ApiPropertyOptional()
  @IsString()
  search?: string;
}

export class GetPagePairsForFiatQueryDTO extends PageQueryDTO {
  @ApiProperty({
    description: 'Must be uuid id for fiat',
  })
  @IsUUID()
  @IsString()
  fiatId: string;

  @ApiPropertyOptional({
    default: '',
  })
  @IsString()
  search?: string;
}

export class GetExchangesByOnRampPairDTO {
  @ApiProperty({
    description: 'Must be uuid id of fiat',
  })
  @IsString()
  @IsUUID()
  fiatId: string;

  @ApiProperty({
    description: 'Must be uuid id of platformcoin',
  })
  @IsString()
  @IsUUID()
  platformCoinId: string;
}
