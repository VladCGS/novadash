import { Wallet } from '@app/common/entities/transactions/wallet.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ICreateWallet } from '../types/wallet.types';

@Injectable()
export class WalletService {
  async createOne({ walletBody, userId }: ICreateWallet) {
    const newWalletRecord = Wallet.create({
      ...walletBody,
      user: { id: userId },
    });

    return Wallet.save(newWalletRecord);
  }

  async update(id: string, updateObj: Partial<Wallet>): Promise<Wallet> {
    const foundWallet = await Wallet.findOneBy({ id });

    Object.assign(foundWallet, updateObj);

    return Wallet.save(foundWallet);
  }

  async findIdsByUserOrFail(userId: string): Promise<string[]> {
    const walletsIds = await this.findIdsByUser(userId);

    if (!walletsIds || !walletsIds?.length) {
      throw new HttpException(
        'Not found Wallets by user id',
        HttpStatus.NOT_FOUND,
      );
    }

    return walletsIds;
  }

  async findIdsByUser(userId: string): Promise<string[] | []> {
    const wallets = await Wallet.find({
      where: {
        user: { id: userId },
      },
      select: { id: true },
    });

    return wallets.map((wallet) => wallet.id);
  }
}
