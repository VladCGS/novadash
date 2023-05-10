import { PageQueryDTO } from '@app/common/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class TokenSearchDTO {
  @ApiProperty({
    example: '0x04fa0d235c4abf4bcf4787af4cf447de572ef828',
    description: 'Addres of platform coin',
  })
  @IsString()
  tokenAddress: string;

  @ApiProperty({
    example: 'afbf8d26-7910-43be-8729-f1e7a6ebe495',
    description: 'Chain ID',
  })
  @IsString()
  chainId: string;
}

export class GetPagePairsForTokenQueryDTO extends PageQueryDTO {
  @ApiProperty({
    example: 'AMPL',
    description: 'Search string. Can be or Symbol or Name or Address',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    example: '0x04fa0d235c4abf4bcf4787af4cf447de572ef828',
    description: 'Addres of platform coin',
  })
  @IsString()
  tokenAddress: string;

  @ApiProperty({
    example: 'afbf8d26-7910-43be-8729-f1e7a6ebe495',
    description: 'Chain ID',
  })
  @IsString()
  chainId: string;
}

export class GetPairsForTokenQueryDTO {
  @ApiProperty({
    example: '0x04fa0d235c4abf4bcf4787af4cf447de572ef828',
    description: 'Addres of platform coin',
  })
  @IsString()
  tokenAddress: string;

  @ApiProperty({
    example: '5c74ccb8-c1a0-4d6c-8b0b-197b68c3e660',
    description: 'Chain ID',
  })
  @IsString()
  chainId: string;
}

export class GetPagePairsForCexTokenQueryDTO extends PageQueryDTO {
  @ApiProperty({
    example: 'AMPL',
    description: 'Search string. Can be or Symbol or Name or Address',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    example: '0x04fa0d235c4abf4bcf4787af4cf447de572ef828',
    description: 'Addres of platform coin',
  })
  @IsString()
  symbolOfInitialToken: string;
}

export class GetExchangesByTokensDTO {
  @ApiProperty({
    example:
      '5ade393a-726d-4405-9b0f-b380a0717e25,904269e2-1b25-4ebf-a0ca-366168fc0be4',
    description: 'IDs of platform coins',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => TokenSearchDTO)
  tokens: TokenSearchDTO[];
}
