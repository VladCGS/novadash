import { Web3TransactionBodyDTO } from '@app/common/dtos/web3.dto';
import { PureLidoService } from '@app/common/modules/lido-evm/service/pure-lido.service';
import { Injectable, Logger } from '@nestjs/common';
import { FormLidoWithdrawTransactionDataDTO } from '../dto/lido-withdraw-transaction-request.dto';
import { LidoWithdrawTransactionDataDTO } from '../dto/lido-withdraw-transaction-response.dto';
import { ethers, utils } from 'ethers';
import { STETH_META } from '@app/common/constants/lido-staking-tokens.const';
import { DataChainService } from '@app/common/modules/data-chain/services/data.chain.service';
import { DataWalletService } from '@app/common/modules/data-wallet/services/data.wallet.service';
import { ChainSlugs } from '@app/common/types/chain.types';
import { NativeCoinsSymbols } from '@app/common/constants/native-coins.const';

@Injectable()
export class LidoWithdrawTransactionService {
  private logger = new Logger(LidoWithdrawTransactionService.name);

  constructor(
    private pureLidoService: PureLidoService,
    private dataChainService: DataChainService,
  ) {}

  async getWithdrawTransactionData(
    body: FormLidoWithdrawTransactionDataDTO,
  ): Promise<LidoWithdrawTransactionDataDTO> {
    const { symbol, walletAddress } = body;

    const chainSlug: ChainSlugs = symbol === NativeCoinsSymbols.ETH ? 'eth' : 'matic';

    const chain = await this.dataChainService.findOneBySlugOrFail(chainSlug);

    const amountInWei = utils.parseUnits(
      body.amount,
      STETH_META.decimals,
    );

    this.logger.debug(`[getEthWithdrawTransactionData] Amount is: ${amountInWei.toString()}`);

    let web3TransactionBody: Web3TransactionBodyDTO;

    if (symbol === NativeCoinsSymbols.ETH) {
      web3TransactionBody = await this.formEthWithdrawTransactionData(walletAddress, amountInWei);
    } else if (symbol === NativeCoinsSymbols.MATIC) {
      web3TransactionBody = await this.formMaticWithdrawTransactionData(walletAddress, amountInWei);
    }

    const senderWallet = {
      address: walletAddress,
      chainId: chain.id,
    };

    return {
      senderWallet,
      bodyTransaction: web3TransactionBody,
    };
  }

  private async formEthWithdrawTransactionData(
    ownerAddress: string,
    maxAmount: ethers.BigNumber,
  ): Promise<Web3TransactionBodyDTO> {
    const tx = await this.pureLidoService.populateEthWithdrawTransactionData(
      maxAmount,
    );

    this.logger.verbose(
      `[formEthWithdrawTransactionData] Data is: ${JSON.stringify(
        tx,
        null,
        2,
      )}`,
    );

    return {
      data: tx.data,
      value: '0x00',
      to: tx.to,
      from: ownerAddress,
    };
  }

  private async formMaticWithdrawTransactionData(
    ownerAddress: string,
    maxAmount: ethers.BigNumber,
  ): Promise<Web3TransactionBodyDTO> {
    const tx = await this.pureLidoService.populateRequestMaticWithdraw(
      maxAmount,
      ownerAddress
    );

    this.logger.verbose(
      `[formMaticWithdrawTransactionData] Data is: ${JSON.stringify(
        tx,
        null,
        2,
      )}`,
    );

    return {
      data: tx.data,
      value: '0x00',
      to: tx.to,
      from: ownerAddress,
    };
  }
}
