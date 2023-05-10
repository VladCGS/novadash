import { TradeAssetChartPeriodsEnum } from '../dtos/chart-user-requests.dto';
import { TypeOfPeriodSplitter } from './generate-chart-dates.util';

export interface ITimeAgoFromNow {
  days?: number;
  months?: number;
  years?: number;
}

function formDateByTimesAgo(timesAgo: ITimeAgoFromNow): Date {
  const date = new Date();

  date.setUTCFullYear(
    date.getUTCFullYear() -
      (timesAgo.years && timesAgo.years >= 0 ? timesAgo.years : 0),
    date.getUTCMonth() -
      (timesAgo.months && timesAgo.months >= 0 ? timesAgo.months : 0),
    date.getUTCDate() -
      (timesAgo.days && timesAgo.days >= 0 ? timesAgo.days : 0),
  );

  return date;
}

function getTimestamps(startDate: Date, endDate: Date) {
  const startDateTimestamp = Math.round(startDate.getTime() / 1000);
  const endDateTimestamp = Math.round(endDate.getTime() / 1000);

  return { startDateTimestamp, endDateTimestamp };
}

export const TRADE_ASSETS_CHART_QUERY_PARAMS = {
  [TradeAssetChartPeriodsEnum.YTD]: {
    periodSplitter: TypeOfPeriodSplitter.MONTH,
    getTimestamps() {
      return getTimestamps(getFirstDayOfYear(new Date()), new Date());
    },
  },
  [TradeAssetChartPeriodsEnum.YEAR]: {
    periodSplitter: TypeOfPeriodSplitter.MONTH,
    getTimestamps() {
      return getTimestamps(formDateByTimesAgo({ years: 1 }), new Date());
    },
  },
  [TradeAssetChartPeriodsEnum.THREE_MONTH]: {
    periodSplitter: TypeOfPeriodSplitter.DAY,
    getTimestamps() {
      return getTimestamps(formDateByTimesAgo({ months: 3 }), new Date());
    },
  },
  [TradeAssetChartPeriodsEnum.MONTH]: {
    periodSplitter: TypeOfPeriodSplitter.DAY,
    getTimestamps() {
      return getTimestamps(formDateByTimesAgo({ months: 1 }), new Date());
    },
  },
  [TradeAssetChartPeriodsEnum.WEEK]: {
    periodSplitter: TypeOfPeriodSplitter.DAY,
    getTimestamps() {
      return getTimestamps(formDateByTimesAgo({ days: 7 }), new Date());
    },
  },
  [TradeAssetChartPeriodsEnum.DAY]: {
    periodSplitter: TypeOfPeriodSplitter.HOUR,
    getTimestamps() {
      return getTimestamps(formDateByTimesAgo({ days: 1 }), new Date());
    },
  },
};

const getFirstDayOfYear = (date: Date) => {
  return new Date(`${date.getFullYear()}-01-01`);
};
