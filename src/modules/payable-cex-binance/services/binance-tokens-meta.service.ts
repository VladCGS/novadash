import { Injectable } from '@nestjs/common';
import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';
import { PureBinanceService } from '@app/common/modules/pure-cex-binance/services/pure-binance.service';
import { BinanceSearchNetworkService } from '@app/common/modules/pure-cex-binance/services/binance-search-network.service';
import { DataPlatformCoinService } from '@app/common/modules/data-platform-coin/services/data.platform-coin.service';
import { CoinNetwork } from 'binance';
import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import { BinanceCorrectorService } from '@app/common/modules/pure-cex-binance/services/binance-corrector.service';
import { IBinanceKeys } from '@app/common/modules/pure-cex-binance/types/pure-binance.types';

@Injectable()
export class BinanceTokensMetaService {
  constructor(
    private dataChainService: DataChainService,
    private dataPlatformCoinService: DataPlatformCoinService,
    private pureBinanceService: PureBinanceService,
    private binanceSearchNetworkService: BinanceSearchNetworkService,
    private binanceCorrectorService: BinanceCorrectorService,
  ) {}

  async getFutureWithdrawalPlatformCoin(
    credentials: IBinanceKeys,
    symbol: string,
    chainIdDB: string,
  ) {
    const foundNetworkName =
      await this.binanceSearchNetworkService.getBinanceChainNameById(chainIdDB);

    const coinBalance = await this.pureBinanceService.getCoinBalance(
      credentials,
      symbol,
    );

    const foundNetwork: CoinNetwork = coinBalance.networkList.find(
      (o) => o.network === foundNetworkName,
    );

    const correctedTokenAddress =
      await this.binanceCorrectorService.correctBinanceWithdrawAddressToDBAddress(
        {
          symbol,
          chainId: chainIdDB,
          // @ts-ignore
          withdrawBinanceAddress: foundNetwork?.contractAddress,
        },
      );

    return this.dataPlatformCoinService.findOneByAddressAndChainIdOrFail(
      correctedTokenAddress === NATIVE_UNI_ADDRESS
        ? correctedTokenAddress
        : correctedTokenAddress.toLowerCase(),
      chainIdDB,
    );
  }

  async getAssetWithdrawChains(
    credentials: IBinanceKeys,
    symbol: string,
  ): Promise<string[]> {
    const coinBalance = await this.pureBinanceService.getCoinBalance(
      credentials,
      symbol,
    );

    const chainDBIds = [];
    for (const netData of coinBalance.networkList) {
      const foundChain =
        await this.binanceSearchNetworkService.getChainDBIdByBinanceNetName(
          netData.network,
        );
      if (foundChain) {
        chainDBIds.push(foundChain.id);
      }
    }

    return chainDBIds;
  }
}
