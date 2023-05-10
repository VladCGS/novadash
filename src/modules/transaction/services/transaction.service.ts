import { Transaction } from '@app/common/entities/transactions';
import { IPagedResult } from '@app/common/modules/common/types/http-response.types';
import { RmqMsTransactionService } from '@app/common/modules/rmq-transport/senders/rmq-ms-transaction.service';
import { ChainGroupEnum } from '@app/common/modules/transactions/types/evm/tx-evm.enums';
import { IInitWalletBody } from '@app/common/modules/transactions/types/transaction.types';
import { UserStatusTransaction } from '@app/common/modules/user-trigger/user-status-transaction.service';
import { OrderKeywordsEnum } from '@app/common/types/common.types';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { GetTransactionPageQueryDTO } from '../dto/transaction-requests.dto';
import { TransactionDTO } from '../dto/transaction-responses.dto';
import {
  IInitChainGroupWallets,
  OrderByesEnum,
} from '../types/transaction.types';
import { formDoubleSearchTokenQuery } from '../utils/form-search-asset-query.util';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);
  constructor(
    private rmqMsTransactionService: RmqMsTransactionService,
    private userStatusTransaction: UserStatusTransaction,
  ) {}

  async initChainGroupWallets(
    userId: string,
    { chainGroupName, chainGroupWallets }: IInitChainGroupWallets,
  ): Promise<IInitWalletBody[]> {
    const response: IInitWalletBody[] = [];

    await this.userStatusTransaction.setLoading(userId);

    if (chainGroupName === ChainGroupEnum.EVM) {
      await this.rmqMsTransactionService.initTxsStart(chainGroupWallets, {
        onMicroserviceDown: async () => {
          await this.userStatusTransaction.setErrorMicroserviceDown(userId);
          throw new HttpException(
            'MS-TRANSACTION is not responding',
            HttpStatus.BAD_GATEWAY,
          );
        },
      });

      response.push(...chainGroupWallets.wallets);
    }
    /*if (chainGroupName === ChainGroupEnum.SOL) {
     for (const oneSolWallet of chainGroupWallets) {
        const txsInitedInThisWallet = await lastValueFrom(
          this.txClient.send<number>(TX_PATTERS.INIT_SOL_WALLET, oneSolWallet),
        );

        responseCount.push({
          walletAddress: oneSolWallet.walletAddress,
          initCount: txsInitedInThisWallet,
        });
      }
    }*/

    return response;
  }

  async findPageByParams({
    page = 1,
    size = 10,
    search = '',
    sendAssets = [],
    recvAssets = [],
    events = [],
    chains = [],
    walletsIds,
    toDate,
    fromDate,
    orderBy = OrderByesEnum.DATE,
    orderType = OrderKeywordsEnum.DESC,
  }: GetTransactionPageQueryDTO): Promise<IPagedResult<TransactionDTO>> {
    const limit = size;
    const skip = (page - 1) * limit;

    const stringifiedWalletIds = `'${walletsIds.join("','")}'`;

    const andSearchQuery = search
      ? `AND (pcm.symbol ILIKE '${search}%'
                 OR pcm.name ILIKE '${search}%'
                 OR pc."tokenAddress" ILIKE '${search}%'
                 OR CAST (tx."usdOutcome" AS TEXT) ILIKE '${search}%'
                 OR
                  CAST (tx."usdFee" AS TEXT) ILIKE '${search}%')`
      : '';

    const andSendOrRecvQuery = formDoubleSearchTokenQuery(
      sendAssets,
      recvAssets,
    );

    const stringifiedChains = `'${chains.join("','")}'`;
    const andChainsQuery =
      chains.length !== 0 ? `AND "chain".id IN (${stringifiedChains})` : '';

    const stringifiedEvents = `'${events.join("','")}'`;
    const andEventsQuery =
      events.length !== 0 ? `AND tx.event IN (${stringifiedEvents})` : '';

    const andFromDateQuery = !!fromDate ? `AND tx.date >= ${fromDate}` : '';

    const andToDateQuery = !!toDate ? `AND tx.date <= ${toDate}` : '';

    const txRawQuery = `
        SELECT ordero, tx_id as id
        FROM (SELECT DISTINCT
              ON (tx.id) tx."${orderBy}" as ordero, tx.id AS tx_id
              FROM transaction as tx
                  LEFT JOIN transaction_asset ta ON tx.id = ta."transactionId"
                  LEFT JOIN platform_coin pc ON ta."platformCoinId" = pc.id
                  LEFT JOIN platform_coin_metadata pcm ON pc."coinMetadataId" = pcm.id
                  LEFT JOIN "wallet" "wallet" ON "wallet"."id" = "tx"."walletId"
                  LEFT JOIN "chain" "chain" ON "chain"."id" = "wallet"."chainId"
              WHERE tx."walletId" IN (${stringifiedWalletIds}) ${andSearchQuery}
                ${andSendOrRecvQuery} ${andEventsQuery} ${andFromDateQuery} ${andToDateQuery} ${andChainsQuery}
              ORDER BY tx.id) t4
        ORDER BY ordero ${orderType}
    `;

    const foundTxsIdsAll = await Transaction.query(txRawQuery);

    const foundTxsIdsPaged = await Transaction.query(`
        ${txRawQuery}
        LIMIT ${limit} OFFSET ${skip};
    `);

    const idsArr = foundTxsIdsPaged.map((item) => item.id);
    let result = [];
    const total = foundTxsIdsAll.length;
    if (total > 0) {
      result = await Transaction.createQueryBuilder('tx')
        .where(`tx.id IN (:...idsArr)`, {
          idsArr,
        })
        .leftJoin('tx.assets', 'assets')
        .leftJoin('assets.platformCoin', 'pc')
        .leftJoin('pc.coinMetadata', 'pcm')
        .leftJoin('assets.platformNft', 'pn')
        .leftJoin('pn.nftCollection', 'nc')
        .leftJoin('tx.wallet', 'wallet')
        .leftJoin('wallet.chain', 'chain')
        .leftJoin('chain.nativeCurrency', 'nativeCurrency')
        .leftJoin('tx.fromMeta', 'fromMeta')
        .leftJoin('tx.toMeta', 'toMeta')
        .select([
          'tx.id',
          'tx.txHash',
          'tx.from',
          'fromMeta',
          'tx.to',
          'tx.statusExecution',
          'toMeta',
          'tx.date',
          'tx.usdFee',
          'tx.usdOutcome',
          'tx.feeQuantity',
          'tx.event',
          'wallet.id',
          'wallet.address',
          'chain.name',
          'chain.image',
          'nativeCurrency.image',
          'nativeCurrency.symbol',
          'assets.operation',
          'pcm.symbol',
          'pcm.name',
          'pcm.image',
          'assets.usdTotal',
          'assets.quantity',
          'pc.tokenAddress',
          'pn.tokenId',
          'pn.name',
          'pn.image',
          'nc.collectionName',
          'nc.address',
          'nc.symbol',
          'assets.standard',
        ])
        .orderBy(`tx."${orderBy}"`, orderType)
        .getMany();
    }
    const pages = Math.ceil(total / limit);

    return {
      page,
      size,
      pages,
      total,
      result,
    };
  }
}
