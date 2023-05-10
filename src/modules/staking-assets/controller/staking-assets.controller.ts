import { ApiOKResponse, Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FormStakingAssetsPageWithAPRDTO } from '../dto/staking-assets-request.dto';
import { StakingAssetsPageWithAPRDTO } from '../dto/staking-assets-response.dto';
import { StakingAssetsPageService } from '../service/staking-assets-page.service';

@Controller('staking-assets')
@ApiTags('staking-assets')
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
export class StakingAssetsController {
  constructor(private stakingAssetsPageService: StakingAssetsPageService) {}

  @Post('list')
  @ApiOKResponse(
    'Successfully fetched staking assets',
    StakingAssetsPageWithAPRDTO,
  )
  async getStakingAssetPage(
    @Body() body: FormStakingAssetsPageWithAPRDTO,
    @Req() req,
  ): Promise<StakingAssetsPageWithAPRDTO> {
    const { id: userId } = req.userData;

    return this.stakingAssetsPageService.getPage(body, userId);
  }
}
