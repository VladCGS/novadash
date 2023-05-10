import { TransactionAssetBaseDTO } from '../dto/transaction-requests.dto';

export const formDoubleSearchTokenQuery = (
  send: TransactionAssetBaseDTO[],
  recv: TransactionAssetBaseDTO[],
) => {
  if (!send.length && !recv.length) {
    return '';
  }

  const sendQuery = send.length
    ? `(ta.operation = 'DEBIT' AND ${formSearchTokenQuery(send)})`
    : '';
  const recvQuery = recv.length
    ? `(ta.operation = 'CREDIT' AND ${formSearchTokenQuery(recv)})`
    : '';

  if (send.length && recv.length) {
    return wrapInAnd(`(${sendQuery}) AND (${recvQuery})`);
  } else {
    return wrapInAnd(`${sendQuery || recvQuery}`);
  }
};

export const wrapInAnd = (query: string) => {
  return `AND (${query})`;
};
export const formSearchTokenQuery = (arr: TransactionAssetBaseDTO[]) => {
  const chainWithDuplicatedIds = arr.map((asset) => asset.chainId);

  const chainIds = [...new Set(chainWithDuplicatedIds)];

  const chainWithAddresses: Record<string, string[]> = {};

  let tempArr = arr;
  for (const chain of chainIds) {
    const tempFilteredForNext = [];
    chainWithAddresses[chain] = [];

    for (const asset of tempArr) {
      if (asset.chainId === chain) {
        chainWithAddresses[chain].push(asset.assetAddress);
      } else {
        tempFilteredForNext.push(asset.assetAddress);
      }
    }

    tempArr = tempFilteredForNext;
  }

  const chainQueries = [];
  for (const chain of chainIds) {
    const addresses = chainWithAddresses[chain];

    const stringifiedAddresses = `'${addresses.join("','")}'`;
    const addressQuery = `pc."tokenAddress" IN (${stringifiedAddresses})`;

    chainQueries.push(`(chain.id = '${chain}' AND ${addressQuery})`);
  }

  return `(${chainQueries.join(' OR ')})`;
};
