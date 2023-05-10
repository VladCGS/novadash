import { AAVE_NATIVE_COIN_ADDRESS } from '@app/common/constants/chains-aave-v3.const';
import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import { SupportedReserveLendBorrow } from '@app/common/entities/borrowing/reserve.entity';
import { AaveV3EvmDelegator } from '@app/common/modules/aave-v3-evm/services/aave-v3.delegator';
import { Injectable } from '@nestjs/common';
import { FormAaveV3WithdrawTransactionDataDTO } from '../dto/aave-v3-withdraw-transaction-request.dto';
import { AaveV3WithdrawTransactionDataDTO } from '../dto/aave-v3-withdraw-transaction-response.dto';

@Injectable()
export class AaveV3WithdrawTransactionService {
  constructor(private aaveV3EvmDelegator: AaveV3EvmDelegator) {}

  async getTransactionData(
    body: FormAaveV3WithdrawTransactionDataDTO,
  ): Promise<AaveV3WithdrawTransactionDataDTO> {
    let isNativeReserve = false;

    if (body.useNativeToken) {
      isNativeReserve = await this.checkIsNativeReserve(body.reserveAddress);
    }

    const { corePlatformCoin, lendPlatformCoin } =
      await SupportedReserveLendBorrow.findOne({
        where: { reserveAddress: body.reserveAddress },
        relations: {
          corePlatformCoin: { chain: true },
          lendPlatformCoin: true,
        },
        select: {
          id: true,
          corePlatformCoin: {
            id: true,
            chain: { id: true, slug: true },
            tokenAddress: true,
          },
          lendPlatformCoin: { id: true, tokenAddress: true },
        },
      });

    const pool = this.aaveV3EvmDelegator
      .setChain(corePlatformCoin.chain.slug)
      .getPool();

    const reserve =
      body.useNativeToken && isNativeReserve
        ? AAVE_NATIVE_COIN_ADDRESS
        : corePlatformCoin.tokenAddress;

    const txs = await pool.withdraw({
      user: body.ownerAddress,
      amount: body.withdrawAmount,
      aTokenAddress: lendPlatformCoin.tokenAddress,
      reserve,
    });

    const { data, value, to, from } = await txs[0].tx();

    return {
      senderWallet: {
        chainId: corePlatformCoin.chain.id,
        address: body.ownerAddress,
      },
      bodyTransaction: { data, value, to, from },
    };
  }

  private async checkIsNativeReserve(reserveId: string): Promise<boolean> {
    if (reserveId.includes(NATIVE_UNI_ADDRESS)) {
      return true;
    }

    const reserve = await SupportedReserveLendBorrow.findOne({
      where: { reserveAddress: `${reserveId}-${NATIVE_UNI_ADDRESS}` }, // in cron manager we make custom reserve id for differ between native and wrapped reserves
      select: { id: true },
    });

    return !!reserve;
  }
}
