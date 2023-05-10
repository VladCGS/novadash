import { Chain } from '@app/common/entities/transactions';
import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { ChainMetaDTO } from '../dto/chain-user.responses.dto';

@Injectable()
export class ChainMetaService {
  async getChainsMetaByIds(chainDBIds: string[]): Promise<ChainMetaDTO[]> {
    const foundChains = await Chain.find({
      where: {
        id: In(chainDBIds),
      },
    });

    return foundChains.map((chain) => this.chainToChainMeta(chain));
  }

  private chainToChainMeta(chain: Chain): ChainMetaDTO {
    return {
      name: chain.name,
      image: chain.image,
      id: chain.id,
    };
  }
}
