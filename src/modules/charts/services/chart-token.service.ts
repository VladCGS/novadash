import { PlatformCoin } from '@app/common/entities/alphaping';
import { Chain } from '@app/common/entities/transactions';
import { CoinPriceService } from '@app/common/modules/coin-price/coin-price.service';
import { PureCoingeckoV3ProService } from '@app/common/modules/coingecko/services/pure-coingecko-v3-pro.service';
import { DataAnalyticsUserService } from '@app/common/modules/data-analytics-user/services/data.analytics-user.service';
import { DelegatorEvmService } from '@app/common/modules/delegator/services/delegator-evm.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DateWithPriceDTO } from '../dtos/chart-user-common.dto';
import {
  FetchingToolsEnum,
  FormTokenChartDTO,
  TradeAssetChartPeriodsEnum,
} from '../dtos/chart-user-requests.dto';
import { TokenChartDTO } from '../dtos/chart-user-responses.dto';
import {
  generateChartDates,
  TypeOfPeriodSplitter,
} from '../utils/generate-chart-dates.util';
import { TRADE_ASSETS_CHART_QUERY_PARAMS } from '../utils/generate-date-limits-charts.util';

@Injectable()
export class ChartTokenService {
  constructor(
    private coinPriceService: CoinPriceService,
    private delegatorEvmService: DelegatorEvmService,
    private dataAnalyticsUserService: DataAnalyticsUserService,
    private coingeckoService: PureCoingeckoV3ProService,
  ) {}

  private async getUsdPriceByBlockNumber(
    chain: Chain,
    blockNumber: number,
    tokenAddress: string,
  ): Promise<number> {
    return this.coinPriceService.getUSDPriceByGraph(
      tokenAddress,
      chain.slug,
      blockNumber,
    );
  }

  private async attachPricesToDatesByMoralis(
    datesArray: Date[],
    chain: Chain,
    tokenAddress: string,
  ): Promise<DateWithPriceDTO[]> {
    const datesWithPrices: DateWithPriceDTO[] = [];

    for (const date of datesArray) {
      const blockNumber = await this.delegatorEvmService.getBlockNumberByDate({
        chainSlug: chain.slug,
        params: {
          date,
        },
      });

      const usdPrice = await this.getUsdPriceByBlockNumber(
        chain,
        blockNumber,
        tokenAddress,
      );

      datesWithPrices.push({ date, price: usdPrice });
    }

    return datesWithPrices;
  }

  private async attachPricesToDatesByCoingecko(
    chain: Chain,
    tokenAddress: string,
    startDateTimestamp: number,
    endDateTimestamp: number,
  ): Promise<DateWithPriceDTO[] | undefined> {
    const { tokenAddress: address } = await PlatformCoin.findOne({
      where: { chain: { id: chain.id }, tokenAddress },
      relations: {
        coinMetadata: true,
      },
    });

    const coingeckoDatesWithPrices =
      await this.coingeckoService.getMarketChartRange({
        chainSlug: chain.slug,
        currency: 'usd',
        startDateTimestamp,
        endDateTimestamp,
        address,
      });

    if (!coingeckoDatesWithPrices) {
      return;
    }

    return coingeckoDatesWithPrices.map((coingeckoDateWithPrice) => ({
      price: coingeckoDateWithPrice.price,
      date: new Date(coingeckoDateWithPrice.timestamp),
    }));
  }

  async formTokenChart(
    body: FormTokenChartDTO,
    userId: string,
  ): Promise<TokenChartDTO> {
    const { startDateTimestamp, endDateTimestamp } =
      TRADE_ASSETS_CHART_QUERY_PARAMS[body.mode].getTimestamps();
    const periodSplitter = TRADE_ASSETS_CHART_QUERY_PARAMS[body.mode]
      .periodSplitter as TypeOfPeriodSplitter;

    const assetsWithDates = await this.formChartByDates(
      {
        endTimestamp: endDateTimestamp,
        startTimestamp: startDateTimestamp,
        chainId: body.chainId,
        userId,
        tokenAddress: body.tokenAddress,
        periodSplitter,
      },
      body.fetchingTool,
    );

    return {
      mode: body.mode,
      tokenAddress: body.tokenAddress,
      chainId: body.chainId,
      result: assetsWithDates,
    };
  }

  async formTokenChartForTotalUserInterval(
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

    const assetsWithDates = await this.formChartByDates(
      {
        tokenAddress: body.tokenAddress,
        chainId: body.chainId,
        periodSplitter: TypeOfPeriodSplitter.MONTH,
        userId,
        startTimestamp: foundFirstAndLastDates[0].getTime() / 1000,
        endTimestamp: new Date().getTime() / 1000,
      },
      body.fetchingTool,
    );

    return {
      mode: TradeAssetChartPeriodsEnum.ALL,
      tokenAddress: body.tokenAddress,
      chainId: body.chainId,
      result: assetsWithDates,
    };
  }

  private async formChartByDates(
    params: {
      tokenAddress: string;
      chainId: string;
      userId: string;
      startTimestamp: number;
      endTimestamp: number;
      periodSplitter: TypeOfPeriodSplitter;
    },
    fetchingTool?: FetchingToolsEnum,
  ): Promise<DateWithPriceDTO[]> {
    const foundChain = await Chain.findOne({ where: { id: params.chainId } });

    if (fetchingTool === FetchingToolsEnum.COINGECKO) {
      const tokenChartByCoingecko = await this.attachPricesToDatesByCoingecko(
        foundChain,
        params.tokenAddress,
        params.startTimestamp,
        params.endTimestamp,
      );

      if (tokenChartByCoingecko) {
        return tokenChartByCoingecko;
      }
    }

    const startDate = new Date(params.startTimestamp * 1000);
    const endDate = new Date(params.endTimestamp * 1000);

    const datesArray = generateChartDates(
      startDate,
      endDate,
      params.periodSplitter,
    );

    return this.attachPricesToDatesByMoralis(
      datesArray,
      foundChain,
      params.tokenAddress,
    );
  }
}
