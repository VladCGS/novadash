import {
  EthereumTransactionTypeExtended,
  getTxValue,
  Pool,
} from '@aave/contract-helpers';
import { AAVE_NATIVE_COIN_ADDRESS } from '@app/common/constants/chains-aave-v3.const';
import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import {
  ApproveTokenInfoDTO,
  Web3TransactionBodyDTO,
} from '@app/common/dtos/web3.dto';
import bn from 'bignumber.js';
import { PlatformCoin } from '@app/common/entities/alphaping';
import { SupportedReserveLendBorrow } from '@app/common/entities/borrowing/reserve.entity';
import { AaveV3EvmDelegator } from '@app/common/modules/aave-v3-evm/services/aave-v3.delegator';
import { Injectable } from '@nestjs/common';
import { FormAaveV3LendingTransactionDataDTO } from '../dto/aave-v3-lending-transaction-request.dto';
import { AaveV3LendingTransactionDataDTO } from '../dto/aave-v3-lending-transaction-response.dto';

@Injectable()
export class AaveV3LendingTransactionService {
  constructor(private aaveV3EvmDelegator: AaveV3EvmDelegator) {}

  async getTransactionData(
    body: FormAaveV3LendingTransactionDataDTO,
  ): Promise<AaveV3LendingTransactionDataDTO> {
    const isNativeReserve = body.reserveAddress.includes(NATIVE_UNI_ADDRESS);
    const { corePlatformCoin } = await SupportedReserveLendBorrow.findOne({
      where: { reserveAddress: body.reserveAddress },
      relations: { corePlatformCoin: { chain: true } },
      select: {
        id: true,
        corePlatformCoin: {
          id: true,
          chain: { id: true, slug: true },
          tokenAddress: true,
          decimals: true,
        },
      },
    });

    const pool = this.aaveV3EvmDelegator
      .setChain(corePlatformCoin.chain.slug)
      .getPool();

    let web3TransactionBody: Web3TransactionBodyDTO;
    let approveTokenInfo: ApproveTokenInfoDTO;

    if (isNativeReserve) {
      web3TransactionBody = await this.formTransactionForNativeToken(
        pool,
        body.ownerAddress,
        body.depositAmount,
      );
    } else {
      const depositWei = bn(body.depositAmount)
        .multipliedBy(bn(10 ** Number(corePlatformCoin.decimals)))
        .toFixed(0);

      web3TransactionBody = await this.formTransactionForERC20Token(
        pool,
        corePlatformCoin,
        depositWei,
        body.ownerAddress,
      );

      approveTokenInfo = {
        approveTokenMeta: {
          tokenAddress: corePlatformCoin.tokenAddress,
          amountWei: depositWei,
          chainId: corePlatformCoin.chain.id,
        },
        bodyApprove: { to: web3TransactionBody.to, from: body.ownerAddress },
      };
    }

    const senderWallet = {
      address: body.ownerAddress,
      chainId: corePlatformCoin.chain.id,
    };

    return {
      senderWallet,
      bodyTransaction: web3TransactionBody,
      approveTokenInfo,
    };
  }

  private async formTransactionForNativeToken(
    pool: Pool,
    ownerAddress: string,
    depositAmount: string,
  ): Promise<Web3TransactionBodyDTO> {
    const txs: EthereumTransactionTypeExtended[] = await pool.supply({
      user: ownerAddress,
      reserve: AAVE_NATIVE_COIN_ADDRESS,
      amount: depositAmount,
      onBehalfOf: ownerAddress,
    });

    const transactionData = await txs[0].tx();

    return {
      data: transactionData.data,
      value: transactionData.value,
      to: transactionData.to,
      from: ownerAddress,
    };
  }

  private async formTransactionForERC20Token(
    pool: Pool,
    corePlatformCoin: PlatformCoin,
    depositWei: string,
    ownerAddress: string,
  ): Promise<Web3TransactionBodyDTO> {
    const transactionService = pool.getContractInstance(pool.poolAddress);
    const { data, to } = await transactionService.populateTransaction.supply(
      corePlatformCoin.tokenAddress,
      depositWei,
      ownerAddress,
      '0',
    );

    const value = getTxValue(corePlatformCoin.tokenAddress, depositWei);

    return { data, value, to, from: ownerAddress };
  }
}
