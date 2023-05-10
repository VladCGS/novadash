import { ToolMeta } from '@app/common/entities/transactions';
import { PagedResultDTO } from '@app/common/modules/common/types/http-response.types';
import { TxEvent } from '@app/common/modules/transactions/types/event-types.enum';
import {
  AssetOperationEnum,
  TokenStandardEnum,
} from '@app/common/modules/transactions/types/transaction.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TransactionAssetFullDTO } from './transaction-requests.dto';

export class TransactionNftCollectionDTO {
  @ApiProperty()
  collectionName: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  symbol: string;
}

export class TransactionNftDTO {
  @ApiProperty()
  tokenId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string | null;

  @ApiProperty()
  nftCollection: TransactionNftCollectionDTO;
}

export class TransactionCoinMetadataDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  image: string | null;
}

export class TransactionPlatformCoinDTO {
  @ApiProperty()
  tokenAddress: string;

  @ApiProperty()
  coinMetadata: TransactionCoinMetadataDTO;
}

export class TransactionAssetDTO {
  @ApiProperty()
  operation: AssetOperationEnum;

  @ApiProperty()
  usdTotal: number | null;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  standard: TokenStandardEnum;

  @ApiProperty()
  platformCoin: TransactionPlatformCoinDTO | null;

  @ApiProperty()
  platformNft: TransactionNftDTO | null;
}

export class TransactionNativeCurrencyDTO {
  @ApiProperty()
  symbol: string;

  @ApiProperty()
  image: string | null;
}

export class TransactionChainDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  image: string | null;

  @ApiProperty()
  @Type(() => TransactionNativeCurrencyDTO)
  nativeCurrency: TransactionNativeCurrencyDTO;
}

export class TransactionWalletDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  @Type(() => TransactionChainDTO)
  chain: TransactionChainDTO;
}

export enum TransactionExecutionStatusEnum {
  EXECUTED = 'Executed',
  FAILED = 'Failed',
}

export class TransactionDTO {
  @ApiProperty({
    example: 'd096634783ca6c10e65',
    description: 'transaction DB id',
  })
  id: string;

  @ApiProperty({
    example:
      '0x00c1cdba522d393c59ffc0826d4df1ec9f844cd75a0dfd096634783ca6c10e65',
    description: 'transaction hash',
  })
  txHash: string;

  @ApiProperty({
    example: '0x96d440ed28da4810eab61684c9d38ffbe0da0619',
    description: 'from',
  })
  from: string;

  @ApiProperty({
    example: {
      name: 'Kucoin',
      image: 'https://image.png',
      type: 'Lending',
    },
    description: 'From meta',
  })
  fromMeta: ToolMeta | null;

  @ApiProperty({
    example: '0x91dda01694781001005150adb8116679e4de4dcd',
    description: 'to',
  })
  to: string;

  @ApiProperty({
    example: {
      name: 'Metamask',
      image: 'https://image.png',
      type: 'Main',
    },
    description: 'To meta',
  })
  toMeta: ToolMeta | null;

  @ApiProperty({
    example: '2022/13/24',
    description: 'timestamp',
  })
  date: Date;

  @ApiProperty({
    example: 0.2715,
    description: 'transaction fee equivalent in USD',
  })
  usdFee: string;

  @ApiProperty({
    example: 0.2715,
    description: 'transaction fee equivalent in USD',
  })
  usdOutcome: string;

  @ApiProperty({
    example: 0.2715,
    description: 'transaction fee equivalent in USD',
  })
  feeQuantity: string;

  @ApiProperty({
    example: 'Trade',
    description: 'transaction fee equivalent in USD',
  })
  event: TxEvent;

  @ApiProperty({ type: TransactionAssetDTO, isArray: true })
  assets: TransactionAssetDTO[];

  @ApiProperty()
  @Type(() => TransactionWalletDTO)
  wallet: TransactionWalletDTO;

  @ApiProperty({
    example: TransactionExecutionStatusEnum.EXECUTED,
    description: 'transaction execution status',
  })
  statusExecution: TransactionExecutionStatusEnum;
}

export class TransactionPageDTO extends PagedResultDTO {
  @ApiProperty({
    description: 'Pages quantity',
    isArray: true,
    type: TransactionDTO,
    example: [
      {
        operation: 'CREDIT',
        quantity: 0.3488,
        name: 'Ethereum',
        symbol: 'ETH',
        assetAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenID: null,
        tokenCollectionName: null,
        usdTotal: 396.9832964372688,
        image:
          'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
        standard: 'NATIVE',
        statusExecution: TransactionExecutionStatusEnum.EXECUTED,
      },
    ],
  })
  result: TransactionDTO[];
}

export class TransactionEventsSetPageDTO extends PagedResultDTO {
  @ApiProperty({
    description: 'Transaction events names',
    isArray: true,
    example: ['Send', 'Receive'],
  })
  result: string[];
}

export class TransactionAssetsSetPageDTO extends PagedResultDTO {
  @ApiProperty({
    description: 'Transaction events names',
    isArray: true,
    example: ['Send', 'Receive'],
  })
  result: TransactionAssetFullDTO[];
}
