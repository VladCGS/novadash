import { ApiOKResponse, Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FormLendingPoolsWithAPRDTO } from '../dto/liquidity-pools-request.dto';
import { LendingPoolsWithAPRPageDTO } from '../dto/liquidity-pools.response.dto';
import { LendingPoolsPageService } from '../service/lending-pools-page.service';

@Controller('liquidity-pools')
@ApiTags('liquidity-pools')
@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
  new CheckIdValidGuard({ field: ['id'], findIn: 'userData' }),
  new CheckRecordFieldExistGuard([
    {
      Entity: User,
      dataSource: 'userData',
      entityField: 'id',
      sourceField: 'id',
    },
  ]),
)
@Roles(AppRoles.USER)
export class LiquidityPoolsController {
  constructor(private lendingPoolsPageService: LendingPoolsPageService) {}

  @Post('lending-pools')
  @ApiOKResponse('Successfully fetched pools', LendingPoolsWithAPRPageDTO)
  async getPageLendingPoolsWithAPR(
    @Body() body: FormLendingPoolsWithAPRDTO,
  ): Promise<LendingPoolsWithAPRPageDTO> {
    return this.lendingPoolsPageService.getLendingPoolsPageWithApr(body);
  }
}
