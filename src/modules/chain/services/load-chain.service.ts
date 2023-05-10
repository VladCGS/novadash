import { PlatformCoin } from '@app/common/entities/alphaping';
import { Chain, ChainNativeCurrency } from '@app/common/entities/transactions';
import { ChainGroupEnum } from '@app/common/modules/transactions/types/evm/tx-evm.enums';
import { ChainSlugs } from '@app/common/types/chain.types';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { IChainIdNetworkItem } from '../types/chain.types';
import { ChainService } from './chain.service';
import { base64Images } from '../../../../../../libs/common/static/baseb-64-images.const';
import { ExchSetInitService } from '@app/common/modules/exch-set-init/services/exch-set-init.service';

@Injectable()
export class LoadChainService {
  private readonly logger = new Logger(LoadChainService.name);
  constructor(
    private chainService: ChainService,
    private exchSetInitService: ExchSetInitService,
  ) {}

  async cleanupChainsToDate(minDate: Date): Promise<void> {
    const invalidChainsId: { id: string }[] = await Chain.query(`
    SELECT id
    FROM chain
    WHERE "updatedAt" <= '${minDate.toISOString()}'    
    `);

    if (!invalidChainsId.length) return;

    for (const { id: chainId } of invalidChainsId) {
      await PlatformCoin.query(`
      DELETE
      FROM platform_coin
      WHERE "chainId" = '${chainId}'
      `);

      await Chain.query(`
      DELETE
      FROM chain
      WHERE "id" = '${chainId}'
      `);
    }
  }

  async loadChainIdNetworkChains() {
    const jsonList = await axios.get<IChainIdNetworkItem[]>(
      'https://chainid.network/chains_mini.json',
    );

    const objectsList = jsonList.data;

    const pageSize = 100;
    const totalTokens = objectsList.length;
    const pages = Math.ceil(totalTokens / pageSize);

    const handlePage = async (
      data: IChainIdNetworkItem[],
      page: number,
      length: number,
    ) => {
      const offset = page * pageSize;
      const offsetLimit =
        page === pages - 1 ? totalTokens : (page + 1) * pageSize;

      this.logger.warn(
        `Chains initing from: ${offset} - ${offsetLimit}, total length: ${length}`,
      );

      await Promise.all(
        data.map((coingeckoCoin) => this.saveOneChain(coingeckoCoin)),
      );
    };

    await Promise.all([
      this.exchSetInitService.bulkHandle(objectsList, pageSize, {
        handlePage,
      }),
    ]);
  }

  private async saveOneChain(chainData: IChainIdNetworkItem) {
    let foundChain = await this.chainService.findEVMChain({
      chainId: String(chainData.chainId),
    });

    const slug = chainData.shortName.toLowerCase() as ChainSlugs;
    const chainImage = base64Images?.[slug] || null;
    if (foundChain) {
      const updateObj: Partial<Chain> = {};

      if (!foundChain.image && chainImage) {
        updateObj.image = chainImage;
      }
      if (!foundChain.nativeCurrency.image && chainImage) {
        await ChainNativeCurrency.update(
          { id: foundChain.nativeCurrency.id },
          { image: chainImage },
        );
      }
      await Chain.update({ id: foundChain.id }, updateObj);
      return;
    }

    foundChain = await Chain.create({
      chainId: String(chainData.chainId),
      nativeCurrency: {
        ...chainData.nativeCurrency,
        image: chainImage,
      },
      group: ChainGroupEnum.EVM,
      name: chainData.name,
      slug,
      image: chainImage,
    }).save();

    await foundChain.save();
  }

  async loadSolanaChain() {
    const foundChain = await Chain.findOneBy({
      chainId: '0',
      name: 'Solana',
    });
    if (foundChain) {
      await Chain.update({ id: foundChain.id }, {});

      return;
    }

    const newRecord = Chain.create({
      name: 'Solana',
      slug: 'solana',
      chainId: '0',
      nativeCurrency: {
        name: 'Solana',
        symbol: 'SOL',
        decimals: 9,
      },
      group: ChainGroupEnum.SOL,
    });

    await newRecord.save();
  }

  async loadBitcoinChain() {
    const foundChain = await Chain.findOneBy({
      chainId: '0',
      name: 'Bitcoin',
    });
    if (foundChain) {
      await Chain.update({ id: foundChain.id }, {});

      return;
    }

    const newRecord = Chain.create({
      name: 'Bitcoin',
      slug: 'bitcoin',
      chainId: '0',
      nativeCurrency: {
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 8,
      },
      group: ChainGroupEnum.BTC,
    });

    await newRecord.save();
  }
}
