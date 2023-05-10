import { PagedResultDTO } from '@app/common/modules/common/types/http-response.types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  PoolActivePositionInfoWithMetaDTO,
  PoolInactivePositionInfoWithMetaDTO,
} from './liquidity-pools-user-positions-common.dto';

export class PoolsActivePositionsPageDTO extends PagedResultDTO {
  @ApiProperty()
  @Type(() => PoolActivePositionInfoWithMetaDTO)
  result: PoolActivePositionInfoWithMetaDTO[];
}

export class PoolsInactivePositionsPageDTO extends PagedResultDTO {
  @ApiProperty()
  @Type(() => PoolInactivePositionInfoWithMetaDTO)
  result: PoolInactivePositionInfoWithMetaDTO[];
}
