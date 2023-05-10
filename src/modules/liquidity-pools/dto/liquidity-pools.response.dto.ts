import { PagedResultDTO } from '@app/common/modules/common/types/http-response.types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PoolWithMetasAndAprDTO } from './liquidity-pools-common.dto';

export class LendingPoolsWithAPRPageDTO extends PagedResultDTO {
  @ApiProperty()
  @Type(() => PoolWithMetasAndAprDTO)
  result: PoolWithMetasAndAprDTO[];
}
