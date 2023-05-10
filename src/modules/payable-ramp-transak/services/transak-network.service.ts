import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  SUPPORTED_EVM_SLUGS,
  SupportedEvmSlugsNames,
} from '@app/common/constants/supported-evm-chains.const';
import {
  NAMES_TO_TRANSAK,
  TransakNetworks,
} from '../constants/chainslug-to-transak.const';
import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';

@Injectable()
export class TransakNetworkService {
  constructor(private readonly dataChainService: DataChainService) {}

  async findTransakNetworkByChainDBId(
    chainId: string,
  ): Promise<TransakNetworks> {
    const foundChain = await this.dataChainService.findOneByIdOrFail(chainId);
    const supportedChainSlugs = Object.values(SUPPORTED_EVM_SLUGS);
    if (
      !supportedChainSlugs.includes(foundChain.slug as SupportedEvmSlugsNames)
    ) {
      throw new HttpException(
        `Chain with slug ${foundChain.slug} is not yes supported`,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    return NAMES_TO_TRANSAK[foundChain.slug];
  }
}
