import { UserStatusAnalyticsEnum } from '@app/common/constants/user-status-analytics.const';
import { UserStatusTransactionsEnum } from '@app/common/constants/user-status-transactions.const';
import { Roles } from '@app/common/decorators';
import { IdDTO } from '@app/common/dtos';
import { User } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { CheckUserStatusAnalyticsGuard } from '@app/common/guards/check-user-status-analytics.guard';
import { CheckUserStatusTransactionsGuard } from '@app/common/guards/check-user-status-transactions.guard';
import { AppRoles } from '@app/common/types';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserAnalyticsService } from './user-analytics.service';

@Controller('user/analytics')
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
@ApiTags('user (analytics)')
export class UserAnalyticsController {
  constructor(private userAnalyticsService: UserAnalyticsService) {}

  @Get('/init')
  @UseGuards(
    new CheckUserStatusTransactionsGuard({
      errorsIf: [
        UserStatusTransactionsEnum.NOT_INITED_YET,
        UserStatusTransactionsEnum.IS_INITING,
        UserStatusTransactionsEnum.ERROR,
      ],
    }),
    new CheckUserStatusAnalyticsGuard({
      errorsIf: [UserStatusAnalyticsEnum.IS_INITING],
    }),
  )
  async initUserBalances(@Req() req): Promise<IdDTO> {
    const { id } = req.userData;

    await this.userAnalyticsService.callInitUserAnalytics(id);

    return { id };
  }
}
