import { PagedResultDTO } from '@app/common/modules/common/types/http-response.types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { StakingAssetsWithMetaAndAPRDTO } from './staking-assets-common.dto';

export class StakingAssetsPageWithAPRDTO extends PagedResultDTO {
  @ApiProperty()
  @Type(() => StakingAssetsWithMetaAndAPRDTO)
  result: StakingAssetsWithMetaAndAPRDTO[];
}
