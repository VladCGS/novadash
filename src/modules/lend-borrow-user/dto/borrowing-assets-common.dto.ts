import { LendingBorrowingPageWithMetaBaseDTO } from '@app/common/modules/lending-borrowing-assets-common/dto/lending-borrowing-assets-common-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';

export class BorrowAssetsWithMetaAndAPYDTO extends LendingBorrowingPageWithMetaBaseDTO {
  @ApiProperty()
  @IsNumber()
  borrowStableAPY: number;

  @ApiProperty()
  @IsNumber()
  borrowVariableAPY: number;

  @ApiProperty()
  @IsBoolean()
  canUserBorrow: boolean;
}
