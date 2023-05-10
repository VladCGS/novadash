import { CronJobNames } from '@app/common/modules/cron/constants/cron.constants';
import { CronJobBaseService } from '@app/common/modules/cron/services/cron-job-base.service';
import { Injectable } from '@nestjs/common';
import { AppInitFeaturesService } from '../../admin/services/app-init-features.service';
import { ALPHPAING_CRON_PATTERNS } from '../constants/cron-job-timers.const';

@Injectable()
export class CronManagerSetupService {
  constructor(
    private cronJobsExtendedService: CronJobBaseService,
    private appInitFeaturesService: AppInitFeaturesService,
  ) {}

  setupAndStartInitAllFeatures() {
    const foundJob = this.cronJobsExtendedService.findOne(
      CronJobNames.initAllFeatures,
    );
    if (foundJob) {
      this.cronJobsExtendedService.start(CronJobNames.initAllFeatures);
      return;
    }

    this.cronJobsExtendedService.addNew({
      name: CronJobNames.initAllFeatures,
      callback: async () => {
        await this.appInitFeaturesService.initAll();
      },
      pattern: ALPHPAING_CRON_PATTERNS.initAllFeatures,
      startNow: true,
    });
  }

  stopInitAllFeatures() {
    this.cronJobsExtendedService.stop(CronJobNames.initAllFeatures);
  }
}
