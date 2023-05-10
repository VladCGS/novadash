import { PagedResultDTO } from '@app/common/modules/common/types/http-response.types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BorrowAssetsWithMetaAndAPYDTO } from './borrowing-assets-common.dto';

export class BorrowAssetsWithAPYPageDTO extends PagedResultDTO {
  @ApiProperty()
  @Type(() => BorrowAssetsWithMetaAndAPYDTO)
  result: BorrowAssetsWithMetaAndAPYDTO[];
}
