import { User } from '@app/common/entities/alphaping';
import { RmqMsBalanceService } from '@app/common/modules/rmq-transport/senders/rmq-ms-balance.service';
import { UserStatusAnalytics } from '@app/common/modules/user-trigger/user-status-analytics.service';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UserAnalyticsService {
  private logger = new Logger(UserAnalyticsService.name);

  constructor(
    private rmqMsBalanceService: RmqMsBalanceService,
    private userStatusAnalytics: UserStatusAnalytics,
  ) {}

  async callInitUserAnalytics(userId: string) {
    const foundUser = await User.createQueryBuilder('user')
      .where({ id: userId })
      .leftJoin('user.wallets', 'wallets')
      .leftJoin('wallets.chain', 'chain')
      .leftJoin('chain.nativeCurrency', 'nativeCurrency')
      .select(['wallets', 'chain', 'nativeCurrency', 'user.id'])
      .getOne();

    if (!foundUser.wallets.length) {
      throw new HttpException(
        'This User doesn`t have any wallets to init',
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    try {
      this.logger.debug(`[callInitUserAnalytics] Set loading for user: ${foundUser.id}`);
      await this.userStatusAnalytics.setLoading(foundUser.id);

      this.logger.debug(`[callInitUserAnalytics] Call initBalancesStart for user: ${foundUser.id}`);
      await this.rmqMsBalanceService.initBalancesStart(
        foundUser.id,
        async () => {
          this.logger.debug('[initBalancesStart] Microservice ms-balanced down!');
          await this.userStatusAnalytics.setErrorMicroserviceDown(foundUser.id);
        },
      );
    } catch (err) {
      this.logger.error(`[callInitUserAnalytics] error: ${err?.message}`, err?.stack);
    }
  }
}
