import { Transaction } from '@app/common/entities/transactions';
import { Injectable } from '@nestjs/common';
import { GetTransactionEventsSetPageQueryDTO } from '../dto/transaction-requests.dto';
import { TransactionEventsSetPageDTO } from '../dto/transaction-responses.dto';

@Injectable()
export class TransactionEventsSetService {
  async findPageEventsByWallets(
    walletsIds: string[],
    { page = 1, size = 10, search = '' }: GetTransactionEventsSetPageQueryDTO,
  ): Promise<TransactionEventsSetPageDTO> {
    const limit = size;
    const skip = (page - 1) * limit;

    const stringifiedWalletIds = `'${walletsIds.join("','")}'`;

    const andSearchQuery = search ? `AND (tx.event ILIKE '${search}%')` : '';

    const coreQuery = `
        SELECT event
        FROM (SELECT DISTINCT
              ON (event) tx.event as event
              FROM transaction tx
              WHERE tx."walletId" IN (${stringifiedWalletIds}) ${andSearchQuery}
              ORDER BY event) t4
        ORDER BY event`;

    const foundAllRecords = await Transaction.query(coreQuery);

    const total = foundAllRecords.length;
    const pages = Math.ceil(total / limit);

    const foundPageRecords = await Transaction.query(`
        ${coreQuery}
        LIMIT ${limit} OFFSET ${skip};
    `);
    return {
      page,
      size,
      pages,
      total,
      result: foundPageRecords.map((tx) => tx.event),
    };
  }
}
