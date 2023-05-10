import { InterestRate } from '@aave/contract-helpers';
import { AAVE_NATIVE_COIN_ADDRESS } from '@app/common/constants/chains-aave-v3.const';
import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import { SupportedReserveLendBorrow } from '@app/common/entities/borrowing/reserve.entity';
import { AaveV3EvmDelegator } from '@app/common/modules/aave-v3-evm/services/aave-v3.delegator';
import { Injectable } from '@nestjs/common';
import { FormAaveV3BorrowingTransactionDTO } from '../dto/aave-v3-borrowing-transaction-request.dto';
import { AaveV3BorrowingTransactionDataDTO } from '../dto/aave-v3-borrowing-transaction-response.dto';

@Injectable()
export class AaveV3BorrowingTransactionService {
  constructor(private aaveV3EvmDelegator: AaveV3EvmDelegator) {}

  async getTransactionData(
    body: FormAaveV3BorrowingTransactionDTO,
  ): Promise<AaveV3BorrowingTransactionDataDTO> {
    const isNativeReserve = await this.checkIsNativeReserve(
      body.reserveAddress,
    );

    const useNativeToken = isNativeReserve && body.useNativeToken;

    const reserveId = useNativeToken
      ? this.extractReserveIdFromNativeCustomAddress(body.reserveAddress)
      : body.reserveAddress;

    const {
      corePlatformCoin,
      borrowVariablePlatformCoin,
      borrowStablePlatformCoin,
    } = await SupportedReserveLendBorrow.findOne({
      where: { reserveAddress: reserveId },
      relations: {
        corePlatformCoin: { chain: true },
        lendPlatformCoin: true,
        borrowVariablePlatformCoin: true,
        borrowStablePlatformCoin: true,
      },
      select: {
        id: true,
        corePlatformCoin: {
          id: true,
          chain: { id: true, slug: true },
          tokenAddress: true,
        },
        borrowVariablePlatformCoin: { tokenAddress: true },
        borrowStablePlatformCoin: { tokenAddress: true },
      },
    });

    const pool = await this.aaveV3EvmDelegator
      .setChain(corePlatformCoin.chain.slug)
      .getPool();

    const debtTokenAddress =
      body.interestRateMode === InterestRate.Stable
        ? borrowStablePlatformCoin.tokenAddress
        : borrowVariablePlatformCoin.tokenAddress;
    const reserve = useNativeToken
      ? AAVE_NATIVE_COIN_ADDRESS
      : corePlatformCoin.tokenAddress;

    const txs = await pool.borrow({
      user: body.ownerAddress,
      amount: body.borrowAmount,
      interestRateMode: body.interestRateMode,
      debtTokenAddress,
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

  private extractReserveIdFromNativeCustomAddress(reserveId: string): string {
    const isCustomReserveId = reserveId.includes(NATIVE_UNI_ADDRESS);

    return isCustomReserveId
      ? reserveId.slice(0, reserveId.indexOf(NATIVE_UNI_ADDRESS) - 1)
      : reserveId; // In the init service, we add a native address to reserve id to distinguish between native and wrapped reserve. For the lending, we need to use the wrapped token reserve address, so we trim the custom address
  }
}
