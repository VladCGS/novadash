import {
  CronJobNames,
  CRON_PATTERNS,
} from '@app/common/modules/cron/constants/cron.constants';

export const ALPHPAING_CRON_PATTERNS: Record<CronJobNames, string> = {
  [CronJobNames.initAllFeatures]: CRON_PATTERNS.every_day,
  [CronJobNames.initServices]: CRON_PATTERNS.every_day,
};
