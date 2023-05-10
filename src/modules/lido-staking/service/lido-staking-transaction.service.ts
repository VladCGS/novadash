import { NATIVE_UNI_ADDRESS } from '@app/common/constants/transactions.const';
import {
  ApproveTokenInfoDTO,
  Web3TransactionBodyDTO,
} from '@app/common/dtos/web3.dto';
import { SupportedStakingToken } from '@app/common/entities/staking/supported-staking-token.entity';
import { PureLidoContractsService } from '@app/common/modules/lido-evm/service/pure-lido-contracts.service';
import { Injectable } from '@nestjs/common';
import { ethers, utils } from 'ethers';
import { FormLidoStakingTransactionDataDTO } from '../dto/lido-staking-transaction-request.dto';
import { LidoStakingTransactionDataDTO } from '../dto/lido-staking-transaction-response.dto';

@Injectable()
export class LidoStakingTransactionService {
  constructor(private pureLidoContractsService: PureLidoContractsService) {}

  async getTransactionData(
    body: FormLidoStakingTransactionDataDTO,
  ): Promise<LidoStakingTransactionDataDTO> {
    const { stakingPlatformCoin, corePlatformCoin } =
      await SupportedStakingToken.findOne({
        where: { stakingAddress: body.stakingAddress },
        relations: {
          stakingPlatformCoin: true,
          corePlatformCoin: { chain: true },
        },
        select: {
          id: true,
          stakingPlatformCoin: { id: true, tokenAddress: true, decimals: true },
          corePlatformCoin: {
            id: true,
            tokenAddress: true,
            chain: { id: true },
          },
        },
      });

    const amountInWei = utils.parseUnits(
      body.depositAmount,
      stakingPlatformCoin.decimals,
    );

    let web3TransactionBody: Web3TransactionBodyDTO;
    let approveTokenInfo: ApproveTokenInfoDTO;

    if (corePlatformCoin.tokenAddress === NATIVE_UNI_ADDRESS) {
      web3TransactionBody = await this.formTransactionForNativeToken(
        stakingPlatformCoin.tokenAddress,
        amountInWei,
        body.ownerAddress,
      );
    } else {
      web3TransactionBody = await this.formTransactionForERC20Token(
        stakingPlatformCoin.tokenAddress,
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
    stTokenAddress: string,
    amountInWei: ethers.BigNumber,
    ownerAddress: string,
  ): Promise<Web3TransactionBodyDTO> {
    const cEthContract: ethers.Contract =
      this.pureLidoContractsService.getStEthContract(stTokenAddress);

    const tx = await cEthContract.populateTransaction.submit(ownerAddress);

    return {
      data: tx.data,
      from: ownerAddress,
      value: amountInWei.toString(),
      to: tx.to,
    };
  }

  private async formTransactionForERC20Token(
    stTokenAddress: string,
    amountInWei: ethers.BigNumber,
    ownerAddress: string,
  ): Promise<Web3TransactionBodyDTO> {
    const cTokenContract: ethers.Contract =
      this.pureLidoContractsService.getStTokenContract(stTokenAddress);

    const tx = await cTokenContract.populateTransaction.submit(
      amountInWei,
      ownerAddress,
    );

    return {
      data: tx.data,
      value: '0x00',
      from: ownerAddress,
      to: tx.to,
    };
  }
}
