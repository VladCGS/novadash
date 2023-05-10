import { Roles } from '@app/common/decorators';
import { Admin } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppInitFeaturesService } from '../../admin/services/app-init-features.service';
import { CronManagerSetupService } from '../services/cron-manager-setup.service';

@Controller('cron-manager')
@ApiTags('Cron manager')
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
export class CronManagerController {
  private readonly logger = new Logger(CronManagerController.name);

  constructor(
    private appInitFeaturesService: AppInitFeaturesService,
    private cronSetupService: CronManagerSetupService,
  ) {}

  @Get('/init-all-features')
  async initAppInitialData() {
    this.logger.warn('Init all features requested!');
    await this.appInitFeaturesService.initAll({
      onFeatureInitFailed: (err: Error) => {
        throw new HttpException(
          `Feature initialization error: ${err?.message ? err.message : err}`,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      },
      onFeatureInitCompleted: () => {
        this.logger.log('Feature initialization complete!');
      },
    });
    return 'done';
  }

  @Get('/setup-init-cron-jobs')
  setupAndStartInitFeatures() {
    this.logger.warn('Cron job setup for init all features!');
    this.cronSetupService.setupAndStartInitAllFeatures();
  }

  @Get('/stop-init-cron-jobs')
  stopInitAllFeatures() {
    this.logger.warn('Cron job stopped for init all features!');
    this.cronSetupService.stopInitAllFeatures();
  }
}
