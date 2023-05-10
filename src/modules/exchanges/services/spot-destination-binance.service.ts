import { CHAIN_SLUGS_TO_BINANCE } from '@app/common/constants/chains-binance.const';
import { PureBinanceService } from '@app/common/modules/pure-cex-binance/services/pure-binance.service';
import {
  TOOLS_META_STATIC,
  ToolsNames,
} from '@app/common/modules/common/tools-meta.const';
import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';
import { Injectable } from '@nestjs/common';
import { FetchDestinationSpotWalletsDTO } from '../dto/trade-common-requests.dto';
import { SpotWalletDestinationMetaDTO } from '../dto/trade-common-responses.dto';
import { SupportedCEXProviders } from '@app/common/entities/pairs';
import { IBinanceKeys } from '@app/common/modules/pure-cex-binance/types/pure-binance.types';

@Injectable()
export class SpotDestinationBinanceService {
  constructor(
    private pureBinanceService: PureBinanceService,
    private dataChainService: DataChainService,
  ) {}

  async getDestinationMeta(
    credentials: IBinanceKeys,
    fetchData: FetchDestinationSpotWalletsDTO,
  ): Promise<SpotWalletDestinationMetaDTO | null> {
    const foundChain = await this.dataChainService.findOneByIdOrFail(
      fetchData.chainId,
    );

    const deposit = await this.pureBinanceService
      .getDepositAddress(credentials, {
        coinSymbol: fetchData.symbol,
        network: CHAIN_SLUGS_TO_BINANCE[foundChain.slug],
      })
      .catch((e) => {
        console.log(e);
      });

    if (deposit && deposit.address) {
      return {
        destinationWalletAddress: deposit.address,
        provider: SupportedCEXProviders.BINANCE,
        image: TOOLS_META_STATIC[ToolsNames.Binance].image,
        name: 'Main',
        chain: {
          image: foundChain.image,
          id: foundChain.id,
        },
      };
    }

    return null;
  }
}
