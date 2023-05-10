import { STRIPE_CLIENT } from '@app/common/constants';
import { SUPPORTED_FIATS } from '@app/common/constants/supported-fiats.const';
import { IdDTO } from '@app/common/dtos';
import { Fiat } from '@app/common/entities/alphaping/fiat.entity';
import { User } from '@app/common/entities/alphaping/user.entity';
import { scryptHash } from '@app/common/helpers/crypto.helper';
import { HttpStatusCode } from '@app/common/modules/common/types/http-base.types';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { WalletService } from '../../wallet/services/wallet.service';
import { ICreateUser, ISetCurrency } from '../types/user-auth.types';

@Injectable()
export class UserService {
  constructor(
    private walletService: WalletService,
    @Inject(STRIPE_CLIENT) private stripeClient: Stripe,
  ) {}
  async create(data: ICreateUser): Promise<User> {
    const { password, ...newUserData } = data;
    const hashedPassword = await scryptHash({ toHash: password });

    const newUserRecord = User.create({
      ...newUserData,
      hashedPassword,
    });

    return User.save(newUserRecord);
  }

  async updateById(id: string, data: Partial<User>): Promise<User> {
    const foundUser = await User.findOneBy({ id });
    Object.assign(foundUser, data);

    return User.save(foundUser);
  }

  async findOneWithAllRelations({ id }: IdDTO): Promise<User> {
    return User.createQueryBuilder('user')
      .where({ id })
      .leftJoinAndSelect('user.wallets', 'wallets')
      .leftJoinAndSelect('user.currency', 'currency')
      .leftJoinAndSelect('wallets.chain', 'chain')
      .leftJoinAndSelect('wallets.meta', 'meta')
      .getOne();
  }

  async setCurrency({ userId, fiatId }: ISetCurrency): Promise<User> {
    const user = await this.findOneWithAllRelations({ id: userId });
    const fiat = await Fiat.findOne({
      where: {
        id: fiatId,
      },
    });

    if (!fiat) {
      throw new HttpException(
        'No fiat with such ID was found',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (!SUPPORTED_FIATS.find((el) => el.symbol === fiat.symbol)) {
      throw new HttpException(
        'fiatId you provide is not in the supported list',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    user.currency = fiat;

    return User.save(user);
  }
}
