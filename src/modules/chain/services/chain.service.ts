import { Chain } from '@app/common/entities/transactions';
import { ChainGroupEnum } from '@app/common/modules/transactions/types/evm/tx-evm.enums';
import { ChainSlugs } from '@app/common/types/chain.types';
import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';

@Injectable()
export class ChainService {
  async findAllBySlugs(slugs: ChainSlugs[]) {
    return Chain.findBy({
      slug: In(slugs),
    });
  }

  async findEVMChain({ chainId }: { chainId: string }) {
    return Chain.findOne({
      where: {
        group: ChainGroupEnum.EVM,
        chainId,
      },
      relations: {
        nativeCurrency: true,
      },
    });
  }
}
