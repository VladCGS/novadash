import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import { SupportedReserveLendBorrow } from '@app/common/entities/borrowing/reserve.entity';
import { PureCompoundContractsService } from '@app/common/modules/compound-v2-evm/services/pure-compound-contracts.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import bn from 'bignumber.js';
import { FromCompoundV2WithdrawTransactionData } from '../dto/compound-v2-withdraw-transaction-request.dto';
import { CompoundV2WithdrawTransactionData } from '../dto/compound-v2-withdraw-transaction-response.dto';

@Injectable()
export class CompoundV2WithdrawTransactionService {
  constructor(
    private pureCompoundContractsService: PureCompoundContractsService,
  ) {}

  async getTransactionData(
    body: FromCompoundV2WithdrawTransactionData,
  ): Promise<CompoundV2WithdrawTransactionData> {
    const { lendPlatformCoin, corePlatformCoin } =
      await SupportedReserveLendBorrow.findOne({
        where: { reserveAddress: body.reserveAddress },
        relations: {
          lendPlatformCoin: true,
          corePlatformCoin: { chain: true },
        },
        select: {
          id: true,
          lendPlatformCoin: { tokenAddress: true },
          corePlatformCoin: {
            tokenAddress: true,
            decimals: true,
            chain: { id: true },
          },
        },
      });

    let cTokenContract: ethers.Contract;

    if (corePlatformCoin.tokenAddress === NATIVE_UNI_ADDRESS) {
      cTokenContract =
        this.pureCompoundContractsService.getCEthContractInstance(
          lendPlatformCoin.tokenAddress,
        );
    } else {
      cTokenContract =
        this.pureCompoundContractsService.getCtokenContractInstance(
          lendPlatformCoin.tokenAddress,
        );
    }

    const cTokenBalance = bn(
      (await cTokenContract.callStatic.balanceOf(body.ownerAddress)).toString(),
    );

    const erCurrent: bn = bn(
      (await cTokenContract.callStatic.exchangeRateCurrent()).toString(),
    );

    const exchangeRate = erCurrent.div(
      bn(10 ** (18 + corePlatformCoin.decimals - 8)),
    );

    const amountInWeiForWithdraw = bn(body.withdrawAmount)
      .div(exchangeRate)
      .multipliedBy(bn(10 ** 8));

    if (cTokenBalance < amountInWeiForWithdraw) {
      throw new HttpException(
        'Sorry, but you can not withdraw more token then your liquidity',
        HttpStatus.BAD_REQUEST,
      );
    }

    const tx = await cTokenContract.populateTransaction.redeem(
      amountInWeiForWithdraw.toFixed(0),
    );

    const senderWallet = {
      address: body.ownerAddress,
      chainId: corePlatformCoin.chain.id,
    };

    return {
      senderWallet,
      bodyTransaction: {
        data: tx.data,
        to: tx.to,
        from: body.ownerAddress,
        value: '0x00',
      },
    };
  }
}
