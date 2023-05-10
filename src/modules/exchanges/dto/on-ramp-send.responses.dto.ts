import { PageQueryDTO } from '@app/common/dtos';
import { PagedResultDTO } from '@app/common/modules/common/types/http-response.types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, IsUUID } from 'class-validator';
import { TokenExchangeDTO } from './swap-selector-response.dto';
import { ExchangesOnRampUrlSlugs } from '@app/common/entities/pairs';

export class OnRampFiatDTO {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  symbol: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string | null;

  @ApiProperty()
  @IsString()
  image: string | null;
}

export class OnRampFiatsPageDTO extends PagedResultDTO {
  @ApiProperty({
    description: `List of available transak fiats that user can sell and receive crypto coins`,
    example: [
      {
        id: 'uuid',
        symbol: 'UAH',
        name: 'Ukrainian Hryvna',
        description: '',
        image: null,
      },
    ],
  })
  result: OnRampFiatDTO[];
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

export class PairsForDepositFiatPageDTO extends PagedResultDTO {
  @ApiProperty()
  result: TokenExchangeDTO[];
}

export class ExchangeOnRampMetaDTO {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty({ nullable: true })
  @IsString()
  image: string | null;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  urlSlug: ExchangesOnRampUrlSlugs;
}

export class OnRampsByFiatCryptoPairDTO {
  @IsArray()
  @Type(() => ExchangeOnRampMetaDTO)
  services: ExchangeOnRampMetaDTO[];
}
