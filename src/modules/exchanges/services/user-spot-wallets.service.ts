import { Injectable } from '@nestjs/common';
import { BinanceAssetsService } from '../../payable-cex-binance/services/binance-assets.service';
import { PricedSpotWalletWithBalancesDTO } from '../dto/trade-common-responses.dto';
import { BinanceKeysExtractorService } from '../../payable-cex-binance/services/binance-keys-extractor.service';
import { KucoinKeysExtractorService } from '../../payable-cex-kucoin/services/kucoin-keys-extractor.service';
import { KucoinAssetsService } from '../../payable-cex-kucoin/services/kucoin-assets.service';

@Injectable()
export class UserSpotWalletsService {
  constructor(
    private readonly binanceKeysExtractorService: BinanceKeysExtractorService,
    private readonly binanceAssetsService: BinanceAssetsService,
    private readonly kucoinKeysExtractorService: KucoinKeysExtractorService,
    private readonly kucoinAssetsService: KucoinAssetsService,
  ) {}

  async getAll(
    userId: string,
    req: any,
  ): Promise<PricedSpotWalletWithBalancesDTO[]> {
    const spotWallets: PricedSpotWalletWithBalancesDTO[] = [];

    const binanceKeys =
      this.binanceKeysExtractorService.extractKeysFromRequest(req);
    if (binanceKeys && Object.values(binanceKeys).length) {
      const binanceWallet = await this.binanceAssetsService.formSellAssets(
        userId,
        binanceKeys,
      );
      if (binanceWallet) {
        spotWallets.push(binanceWallet);
      }
    }

    const kucoinKeys =
      this.kucoinKeysExtractorService.extractKeysFromRequest(req);

    if (kucoinKeys && Object.values(kucoinKeys).length) {
      const binanceWallet = await this.kucoinAssetsService.formSellAssets(
        userId,
        kucoinKeys,
      );
      if (binanceWallet) {
        spotWallets.push(binanceWallet);
      }
    }

    return spotWallets;
  }
}
