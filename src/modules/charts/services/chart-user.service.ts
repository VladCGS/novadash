import { Chain } from '@app/common/entities/transactions';
import { DataAnalyticsUserAssetsService } from '@app/common/modules/data-analytics-user/services/data.analytics-user-assets.service';
import { DataAnalyticsUserService } from '@app/common/modules/data-analytics-user/services/data.analytics-user.service';
import { ChainSlugs } from '@app/common/types/chain.types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DateWithPriceDTO } from '../dtos/chart-user-common.dto';
import { FormTokenChartDTO } from '../dtos/chart-user-requests.dto';
import { TokenChartDTO } from '../dtos/chart-user-responses.dto';
import {
  generateChartDates,
  TypeOfPeriodSplitter,
} from '../utils/generate-chart-dates.util';
import { TRADE_ASSETS_CHART_QUERY_PARAMS } from '../utils/generate-date-limits-charts.util';

@Injectable()
export class ChartUserService {
  constructor(
    private dataAnalyticsUserAssetService: DataAnalyticsUserAssetsService,
    private dataAnalyticsUserService: DataAnalyticsUserService,
  ) {}

  async formTokenAvgChartForUser(
    body: FormTokenChartDTO,
    userId: string,
  ): Promise<TokenChartDTO> {
    const { startDateTimestamp, endDateTimestamp } =
      TRADE_ASSETS_CHART_QUERY_PARAMS[body.mode].getTimestamps();
    const periodSplitter = TRADE_ASSETS_CHART_QUERY_PARAMS[body.mode]
      .periodSplitter as TypeOfPeriodSplitter;

    const datesArrayWithAssets = await this.formChartByDates({
      tokenAddress: body.tokenAddress,
      userId,
      chainId: body.chainId,
      startTimestamp: startDateTimestamp,
      endTimestamp: endDateTimestamp,
      periodSplitter,
    });

    return {
      tokenAddress: body.tokenAddress,
      chainId: body.chainId,
      mode: body.mode,
      result: datesArrayWithAssets,
    };
  }

  async formTokenAvgChartForTotalUserInterval(
    body: FormTokenChartDTO,
    userId: string,
  ): Promise<TokenChartDTO> {
    const foundFirstAndLastDates: Date[] | undefined =
      await this.dataAnalyticsUserService.findFirstAndLastByUserId(userId);

    if (!foundFirstAndLastDates) {
      throw new HttpException(
        `User analytics was not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const datesWithPrices = await this.formChartByDates({
      tokenAddress: body.tokenAddress,
      chainId: body.chainId,
      userId,
      periodSplitter: TypeOfPeriodSplitter.DAY,
      startTimestamp: foundFirstAndLastDates[0].getTime() / 1000,
      endTimestamp: new Date().getTime() / 1000,
    });

    return {
      tokenAddress: body.tokenAddress,
      chainId: body.chainId,
      mode: body.mode,
      result: datesWithPrices,
    };
  }

  private async formChartByDates(params: {
    tokenAddress: string;
    chainId: string;
    userId: string;
    startTimestamp: number;
    endTimestamp: number;
    periodSplitter: TypeOfPeriodSplitter;
  }): Promise<DateWithPriceDTO[]> {
    const startDate = new Date(params.startTimestamp * 1000);
    const endDate = new Date(params.endTimestamp * 1000);

    const datesArray = generateChartDates(
      startDate,
      endDate,
      params.periodSplitter,
    );

    const chain = await Chain.findOne({ where: { id: params.chainId } });

    return this.attachAssetsToDates(
      datesArray,
      params.userId,
      params.tokenAddress,
      chain.slug,
    );
  }

  private async attachAssetsToDates(
    datesArray: Date[],
    userId: string,
    tokenAddress: string,
    chainSlug: ChainSlugs,
  ): Promise<DateWithPriceDTO[]> {
    const datesWithAvgPrices: DateWithPriceDTO[] = [];

    for (const date of datesArray) {
      const desiredAsset =
        await this.dataAnalyticsUserAssetService.findOnePrevAsset({
          date,
          userId,
          tokenAddress,
          chainSlug,
        });

      if (!desiredAsset) {
        datesWithAvgPrices.push({ date, price: 0 });

        continue;
      }

      const foundPrice = desiredAsset.usdTokenPriceAvg;

      datesWithAvgPrices.push({ date, price: foundPrice });
    }

    return datesWithAvgPrices;
  }
}
