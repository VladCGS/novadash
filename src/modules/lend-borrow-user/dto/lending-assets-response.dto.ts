import { PagedResultDTO } from '@app/common/modules/common/types/http-response.types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LendingAssetsWithMetaAndAPYDTO } from './lending-assets-common.dto';

export class LendingAssetsWithAPYPageDTO extends PagedResultDTO {
  @ApiProperty()
  @Type(() => LendingAssetsWithMetaAndAPYDTO)
  result: LendingAssetsWithMetaAndAPYDTO[];
}
