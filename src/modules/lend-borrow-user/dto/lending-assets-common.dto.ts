import { DefaultProfitsDTO } from '@app/common/dtos/default-dao-common.dto';
import { LendingBorrowingPageWithMetaBaseDTO } from '@app/common/modules/lending-borrowing-assets-common/dto/lending-borrowing-assets-common-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class LendingAssetsWithMetaAndAPYDTO extends LendingBorrowingPageWithMetaBaseDTO {
  @ApiProperty()
  @Type(() => DefaultProfitsDTO)
  profits: DefaultProfitsDTO;

  @ApiProperty()
  @IsBoolean()
  canUserLend: boolean;
}
