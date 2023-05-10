export enum TypeOfPeriodSplitter {
  HOUR = 'hour',
  DAY = 'day',
  MONTH = 'month',
}

const roundUpDateTime = (time: Date): Date =>
  new Date(
    Math.floor(new Date(time).getTime() / (3600 * 1000)) * (3600 * 1000),
  );

const dateWrapper = (milliseconds: number): Date => new Date(milliseconds);

const generatorHour = (date: Date): Date => {
  const increasedHoursByOne = date.getHours() + 1;

  return dateWrapper(date.setHours(increasedHoursByOne));
};

const generatorDay = (date: Date): Date => {
  const increasedDaysByOne = date.getDate() + 1;

  return dateWrapper(date.setDate(increasedDaysByOne));
};

const generatorMonth = (date: Date): Date => {
  const increasedMonthsByOne = date.getMonth() + 1;

  return dateWrapper(date.setMonth(increasedMonthsByOne));
};

const getDateGenerator = (
  periodSplitter: TypeOfPeriodSplitter,
): ((date: Date) => Date) => {
  switch (periodSplitter) {
    case TypeOfPeriodSplitter.HOUR:
      return (date) => generatorHour(new Date(date));

    case TypeOfPeriodSplitter.DAY:
      return (date) => generatorDay(new Date(date));

    case TypeOfPeriodSplitter.MONTH:
      return (date) => generatorMonth(new Date(date));
  }
};

export const generateChartDates = (
  startDate: Date,
  endDate: Date,
  periodSplitter = TypeOfPeriodSplitter.HOUR,
): Date[] => {
  const datesArray = [startDate];
  const dateGeneratorFc = getDateGenerator(periodSplitter);

  for (let i = 1; ; i++) {
    const lastElement = datesArray[i - 1];
    const nextDate = dateGeneratorFc(lastElement);

    if (nextDate.getTime() > endDate.getTime()) {
      datesArray.push(endDate);
      break;
    }

    datesArray.push(roundUpDateTime(nextDate));
  }

  return datesArray;
};
