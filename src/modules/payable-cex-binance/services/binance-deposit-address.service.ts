import { PureBinanceService } from '@app/common/modules/pure-cex-binance/services/pure-binance.service';
import { Injectable } from '@nestjs/common';
import { CHAIN_SLUGS_TO_BINANCE } from '@app/common/constants/chains-binance.const';
import { BinanceAssetDepositAddressDTO } from '../dto/binance-asset.responses.dto';
import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';
import { IBinanceKeys } from '@app/common/modules/pure-cex-binance/types/pure-binance.types';

@Injectable()
export class BinanceDepositAssetsService {
  constructor(
    private pureBinanceService: PureBinanceService,
    private readonly dataChainService: DataChainService,
  ) {}

  async getDepositChainAddress(
    credentials: IBinanceKeys,
    symbol: string,
    chainIdDB: string,
  ): Promise<BinanceAssetDepositAddressDTO> {
    const foundChain = await this.dataChainService.findOneByIdOrFail(chainIdDB);
    const depositSetup = await this.pureBinanceService.getDepositAddress(
      credentials,
      {
        coinSymbol: symbol,
        network: CHAIN_SLUGS_TO_BINANCE[foundChain.slug],
      },
    );

    return {
      chainIdDB,
      depositAddress: depositSetup.address,
      symbol,
    };
  }
}
