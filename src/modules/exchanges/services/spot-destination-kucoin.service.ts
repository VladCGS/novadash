import {
  TOOLS_META_STATIC,
  ToolsNames,
} from '@app/common/modules/common/tools-meta.const';
import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';
import { Injectable } from '@nestjs/common';
import { FetchDestinationSpotWalletsDTO } from '../dto/trade-common-requests.dto';
import { SpotWalletDestinationMetaDTO } from '../dto/trade-common-responses.dto';
import { IKucoinKeys } from '../../payable-cex-kucoin/types/kucoin-keys.types';
import { SUPPORTED_EVM_SLUGS } from '@app/common/constants/supported-evm-chains.const';
import { KucoinDepositService } from '../../payable-cex-kucoin/services/kucoin-deposit.service';
import { SupportedCEXProviders } from '@app/common/entities/pairs';

@Injectable()
export class SpotDestinationKucoinService {
  constructor(
    private kucoinDepositService: KucoinDepositService,
    private dataChainService: DataChainService,
  ) {}

  async getDestinationMeta(
    credentials: IKucoinKeys,
    fetchData: FetchDestinationSpotWalletsDTO,
  ): Promise<SpotWalletDestinationMetaDTO | null> {
    const foundChain = await this.dataChainService.findOneByIdOrFail(
      fetchData.chainId,
    );
    if (foundChain.slug !== SUPPORTED_EVM_SLUGS.ETH) {
      return null;
    }

    const deposit = await this.kucoinDepositService
      .fetchOrCreateNewDepositRoute(credentials, fetchData.symbol)
      .catch((e) => {
        console.log(e);
      });

    if (deposit && deposit.address) {
      return {
        destinationWalletAddress: deposit.address,
        provider: SupportedCEXProviders.KUCOIN,
        image: TOOLS_META_STATIC[ToolsNames.Kucoin].image,
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
