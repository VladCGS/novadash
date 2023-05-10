import { Roles } from '@app/common/decorators';
import { Admin } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AlphapingStatesDTO } from '../dto/app-statuses-reader-responses.dto';
import { AppStatusesFormerService } from '../services/app-statuses-former.service';

@ApiTags('Application statuses')
@Controller('statuses')
@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
  new CheckIdValidGuard({ field: ['id'], findIn: 'userData' }),
  new CheckRecordFieldExistGuard([
    {
      Entity: Admin,
      dataSource: 'userData',
      entityField: 'id',
      sourceField: 'id',
    },
  ]),
)
@Roles(AppRoles.ADMIN)
export class AppStatusesReaderController {
  constructor(private appStatusesFormerService: AppStatusesFormerService) {}

  @Get('/')
  async getAppStates(): Promise<AlphapingStatesDTO> {
    return this.appStatusesFormerService.formAll();
  }
}
