import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import {
  ApproveTokenInfoDTO,
  Web3TransactionBodyDTO,
} from '@app/common/dtos/web3.dto';
import { SupportedReserveLendBorrow } from '@app/common/entities/borrowing/reserve.entity';
import { PureCompoundContractsService } from '@app/common/modules/compound-v2-evm/services/pure-compound-contracts.service';
import { Injectable } from '@nestjs/common';
import { ethers, utils } from 'ethers';
import { FormCompoundV2LendingTransactionDataDTO } from '../dto/compound-v2-lending-transaction-request.dto';
import { CompoundV2LendingTransactionDataDTO } from '../dto/compound-v2-lending-transaction-response.dto';

@Injectable()
export class CompoundV2LendingTransactionService {
  constructor(
    private pureCompoundContractsService: PureCompoundContractsService,
  ) {}
  
  async getTransactionData(
    body: FormCompoundV2LendingTransactionDataDTO,
  ): Promise<CompoundV2LendingTransactionDataDTO> {
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

    const amountInWei = utils.parseUnits(
      body.depositAmount,
      corePlatformCoin.decimals,
    );

    let web3TransactionBody: Web3TransactionBodyDTO;
    let approveTokenInfo: ApproveTokenInfoDTO;

    if (corePlatformCoin.tokenAddress === NATIVE_UNI_ADDRESS) {
      web3TransactionBody = await this.formTransactionForNativeToken(
        lendPlatformCoin.tokenAddress,
        amountInWei,
        body.ownerAddress,
      );
    } else {
      web3TransactionBody = await this.formTransactionForERC20Token(
        lendPlatformCoin.tokenAddress,
        amountInWei,
        body.ownerAddress,
      );

      approveTokenInfo = {
        approveTokenMeta: {
          tokenAddress: corePlatformCoin.tokenAddress,
          amountWei: amountInWei.toString(),
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
    lendPlatformCoinAddress: string,
    amountInWei: ethers.BigNumber,
    ownerAddress: string,
  ): Promise<Web3TransactionBodyDTO> {
    const cEthContract: ethers.Contract =
      this.pureCompoundContractsService.getCEthContractInstance(
        lendPlatformCoinAddress,
      );

    const tx = await cEthContract.populateTransaction.mint();

    return {
      data: tx.data,
      from: ownerAddress,
      value: amountInWei.toString(),
      to: tx.to,
    };
  }

  private async formTransactionForERC20Token(
    lendPlatformCoinAddress: string,
    amountInWei: ethers.BigNumber,
    ownerAddress: string,
  ): Promise<Web3TransactionBodyDTO> {
    const cTokenContract: ethers.Contract =
      this.pureCompoundContractsService.getCtokenContractInstance(
        lendPlatformCoinAddress,
      );

    const tx = await cTokenContract.populateTransaction.mint(amountInWei);

    return {
      data: tx.data,
      value: '0x00',
      from: ownerAddress,
      to: tx.to,
    };
  }
}
