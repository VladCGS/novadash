import { Wallet } from '@app/common/entities/transactions';
import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, In, Not } from 'typeorm';
import { HotWalletMetaDTO } from '../../exchanges/dto/trade-common-responses.dto';

@Injectable()
export class WalletPayableService {
  async getHotWalletsDestinationsByChainIds(params: {
    userId: string;
    chainIds?: string[];
    excludeWalletId?: string;
  }): Promise<HotWalletMetaDTO[]> {
    const whereQuery: FindOptionsWhere<Wallet> = {
      user: { id: params.userId },
    };

    if (params.chainIds) {
      whereQuery.chain = { id: In(params.chainIds) };
    }

    if (params.excludeWalletId) {
      whereQuery.id = Not(params.excludeWalletId);
    }

    const foundWallets = await Wallet.find({
      where: whereQuery,
      relations: {
        chain: true,
        meta: true,
      },
    });

    return foundWallets.map(
      ({ id, address, name, meta, chain, provider }: Wallet) => ({
        id,
        address,
        name,
        provider,
        image: meta?.image || null,
        chain: {
          image: chain.image,
          id: chain.id,
        },
      }),
    );
  }
}
