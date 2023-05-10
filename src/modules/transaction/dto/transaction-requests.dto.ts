import { TxEvent } from '@app/common/modules/transactions/types/event-types.enum';
import { OrderKeywordsEnum } from '@app/common/types/common.types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { OrderByesEnum } from '../types/transaction.types';

export class PageQueryDTO {
  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  page: number;

  @ApiProperty({
    example: 10,
  })
  @IsNumber()
  size: number;
}

export class TransactionAssetBaseDTO {
  @ApiProperty()
  @IsString()
  chainId: string;

  @ApiProperty()
  @IsString()
  assetAddress: string;
}

export class TransactionAssetFullDTO extends TransactionAssetBaseDTO {
  @ApiProperty()
  @IsString()
  symbol: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({
    nullable: true,
  })
  @IsString()
  image: string | null;

  @ApiProperty({
    nullable: true,
  })
  @IsString()
  nativeImage: string | null;

  @ApiProperty()
  @IsString()
  nativeSymbol: string;
}

export class GetTransactionEventsSetPageQueryDTO extends PageQueryDTO {
  @ApiPropertyOptional({
    required: false,
    description: '<small>Default - **""**</small>',
    example: '',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class GetTransactionAssetsSetPageQueryDTO extends PageQueryDTO {
  @ApiPropertyOptional({
    required: false,
    description: '<small>Default - **""**</small>',
    example: '',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class GetTransactionPageQueryDTO extends PageQueryDTO {
  @ApiPropertyOptional({
    required: false,
    description: '<small>Default - **""**</small>',
    example: '',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    required: false,
    isArray: true,
    example: ['Receive'],
  })
  @IsOptional()
  @IsArray()
  events?: TxEvent[];

  @ApiPropertyOptional({
    required: false,
    isArray: true,
    example: ['5ade393a-726d-4405-9b0f-b380a0717e25'],
  })
  @IsOptional()
  @IsArray()
  chains?: string[];

  @ApiPropertyOptional({
    required: false,
    isArray: true,
    example: [
      {
        chainId: '5ade393a-726d-4405-9b0f-b380a0717e25',
        assetAddress: '0xNATIVExDOxNOTxHAVExADDRESS',
      },
      {
        chainId: '5ade393a-726d-4405-9b0f-b380a0717e25',
        assetAddress: '0xc2cfbd487fe9c42aa5a92c222261b1ad8fdfc6f1',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionAssetBaseDTO)
  sendAssets?: TransactionAssetBaseDTO[];

  @ApiPropertyOptional({
    required: false,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionAssetBaseDTO)
  recvAssets?: TransactionAssetBaseDTO[];

  @ApiPropertyOptional({
    required: false,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  walletsIds?: string[];

  @ApiPropertyOptional({
    required: false,
  })
  @IsOptional()
  @IsDate()
  toDate?: Date;

  @ApiPropertyOptional({
    required: false,
  })
  @IsOptional()
  @IsDate()
  fromDate?: Date;

  @ApiPropertyOptional({
    required: false,
    description: '<small>Default - **"timestamp"**</small>',
  })
  @IsOptional()
  @IsString()
  orderBy?: OrderByesEnum;

  @ApiProperty({
    required: false,
    description:
      '<small>Default - **"DESC"** . **"DESC"** - start search from the newest, **"ASC"** - the oldest</small>',
  })
  @IsOptional()
  @IsString()
  orderType?: OrderKeywordsEnum;
}
