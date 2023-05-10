import { SUPPORTED_SPOT_EXCHANGES } from '@app/common/constants/supported-spot-exchanges.const';
import { Injectable } from '@nestjs/common';
import { FetchDestinationSpotWalletsDTO } from '../dto/trade-common-requests.dto';
import { SpotWalletDestinationMetaDTO } from '../dto/trade-common-responses.dto';
import { SpotDestinationBinanceService } from './spot-destination-binance.service';
import { KucoinKeysExtractorService } from '../../payable-cex-kucoin/services/kucoin-keys-extractor.service';
import { SpotDestinationKucoinService } from './spot-destination-kucoin.service';
import { SupportedCEXProviders } from '@app/common/entities/pairs';
import { BinanceKeysExtractorService } from '../../payable-cex-binance/services/binance-keys-extractor.service';

@Injectable()
export class SpotDestinationsService {
  constructor(
    private spotDestinationBinanceService: SpotDestinationBinanceService,
    private spotDestinationKucoinService: SpotDestinationKucoinService,
    private readonly binanceKeysExtractorService: BinanceKeysExtractorService,
    private readonly kucoinKeysExtractorService: KucoinKeysExtractorService,
  ) {}

  async getAll(
    body: FetchDestinationSpotWalletsDTO,
    req: any,
  ): Promise<SpotWalletDestinationMetaDTO[]> {
    const walletsSpot = [];

    const binanceDepositMeta = await this.checkAndFetchBinanceDestination(
      req,
      body,
    );
    if (binanceDepositMeta) {
      walletsSpot.push(binanceDepositMeta);
    }

    const kucoinDepositMeta = await this.checkAndFetchKucoinDestination(
      req,
      body,
    );
    if (kucoinDepositMeta) {
      walletsSpot.push(kucoinDepositMeta);
    }

    return walletsSpot;
  }

  private async checkAndFetchBinanceDestination(
    req: any,
    body: FetchDestinationSpotWalletsDTO,
  ): Promise<SpotWalletDestinationMetaDTO | undefined> {
    const supportedSpots = Object.keys(SUPPORTED_SPOT_EXCHANGES);
    if (
      body.excludeCEX &&
      (!supportedSpots.includes(body.excludeCEX) ||
        body.excludeCEX === SupportedCEXProviders.KUCOIN)
    ) {
      return;
    }
    const keys = this.binanceKeysExtractorService.extractKeysFromRequest(req);
    const areKeysExists = !!Object.values(keys).length;

    return areKeysExists
      ? this.spotDestinationBinanceService.getDestinationMeta(keys, body)
      : undefined;
  }

  private async checkAndFetchKucoinDestination(
    req: any,
    body: FetchDestinationSpotWalletsDTO,
  ): Promise<SpotWalletDestinationMetaDTO | undefined> {
    const supportedSpots = Object.keys(SUPPORTED_SPOT_EXCHANGES);
    if (
      body.excludeCEX &&
      (!supportedSpots.includes(body.excludeCEX) ||
        body.excludeCEX === SupportedCEXProviders.KUCOIN)
    ) {
      return;
    }
    const keys = this.kucoinKeysExtractorService.extractKeysFromRequest(req);
    const areKeysExists = !!Object.values(keys).length;

    return areKeysExists
      ? this.spotDestinationKucoinService.getDestinationMeta(keys, body)
      : undefined;
  }
}
