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
import { FormLendingAssetsPageWithAPYDTO } from '../dto/lending-assets-request.dto';
import { LendingAssetsWithAPYPageDTO } from '../dto/lending-assets-response.dto';
import { UserLendingAssetsPagedRequestDTO } from '../dto/user-lending-assets-request.dto';
import { LendingAssetsPageService } from '../services/lending-assets-page.service';
import { UserLendingAssetsService } from '../services/user-lending-assets.service';
import { UserLendingAssetsPagedDTO } from '../dto/user-lending-assets-response.dto';

@Controller('lending-assets')
@ApiTags('lending-assets')
@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
  new CheckIdValidGuard({
    field: ['id'],
    findIn: 'userData',
  }),
  new CheckRecordFieldExistGuard([
    {
      isFieldOptional: true,
      sourceField: 'id',
      Entity: User,
      entityField: 'id',
      dataSource: 'userData',
    },
  ]),
)
@Roles(AppRoles.USER)
export class LendingAssetsController {
  constructor(
    private lendingAssetsPageService: LendingAssetsPageService,
    private userLendingAssetsService: UserLendingAssetsService,
  ) {}

  @Post('list')
  @ApiOKResponse(
    'Successfully fetched lending options',
    LendingAssetsWithAPYPageDTO,
  )
  async getLendingAssetPage(
    @Body() body: FormLendingAssetsPageWithAPYDTO,
    @Req() req,
  ): Promise<LendingAssetsWithAPYPageDTO> {
    const { id: userId } = req.userData;

    return this.lendingAssetsPageService.getPage(body, userId);
  }

  @Post('/user-assets/list')
  @ApiOKResponse(
    'Successfully fetched lending user assets',
    UserLendingAssetsPagedDTO,
  )
  async getUserLendingAssets(
    @Req() req,
    @Body() body: UserLendingAssetsPagedRequestDTO,
  ): Promise<UserLendingAssetsPagedDTO> {
    const { id: userId } = req.userData;

    return this.userLendingAssetsService.getAllByUserPaged(userId, body);
  }
}
