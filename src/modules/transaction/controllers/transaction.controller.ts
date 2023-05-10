import { UserStatusTransactionsEnum } from '@app/common/constants/user-status-transactions.const';
import { ApiGetResponse, Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import { Wallet } from '@app/common/entities/transactions';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { CheckUserStatusTransactionsGuard } from '@app/common/guards/check-user-status-transactions.guard';
import { AssetOperationEnum } from '@app/common/modules/transactions/types/transaction.enum';
import { AppRoles } from '@app/common/types';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WalletService } from '../../wallet/services/wallet.service';
import {
  GetTransactionAssetsSetPageQueryDTO,
  GetTransactionEventsSetPageQueryDTO,
  GetTransactionPageQueryDTO,
} from '../dto/transaction-requests.dto';
import {
  TransactionAssetsSetPageDTO,
  TransactionEventsSetPageDTO,
  TransactionPageDTO,
} from '../dto/transaction-responses.dto';
import { TransactionAssetSetService } from '../services/transaction-asset-set.service';
import { TransactionEventsSetService } from '../services/transaction-events-set.service';
import { TransactionService } from '../services/transaction.service';
import { IInitedUserTransactions } from '../types/transaction.types';
import { groupWallets } from '../utils/group-wallets.util';

@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
  new CheckIdValidGuard({ field: ['id'], findIn: 'userData' }),
  new CheckRecordFieldExistGuard([
    {
      Entity: User,
      dataSource: 'userData',
      entityField: 'id',
      sourceField: 'id',
    },
  ]),
)
@Roles(AppRoles.USER)
@Controller('user/transactions')
@ApiTags('Transactions')
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);
  constructor(
    private transactionService: TransactionService,
    private transactionEventsService: TransactionEventsSetService,
    private transactionAssetSetService: TransactionAssetSetService,
    private walletService: WalletService,
  ) {}

  @Get('/init')
  @UseGuards(
    new CheckUserStatusTransactionsGuard({
      errorsIf: [UserStatusTransactionsEnum.IS_INITING],
    }),
  )
  async initUserTransactions(@Req() req): Promise<IInitedUserTransactions> {
    const { id } = req.userData;

    const foundWallets = await Wallet.createQueryBuilder('wallet')
      .where(`user.id = '${id}'`)
      .leftJoin('wallet.user', 'user')
      .leftJoin('wallet.chain', 'chain')
      .leftJoin('chain.nativeCurrency', 'nativeCurrency')
      .select([
        'wallet.address',
        'wallet.id',
        'chain',
        'nativeCurrency',
        'user.statusTransactions',
        'user.id',
      ])
      .getMany();

    if (!foundWallets.length) {
      throw new HttpException(
        `User ${id} doesn't possess any Wallets to init`,
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    const response: IInitedUserTransactions = {};

    const groupedWalletsByChainGroups = groupWallets(foundWallets);
    const existingChainGroups = Object.keys(groupedWalletsByChainGroups);

    try {
      for (const chainGroupName of existingChainGroups) {
        // Method returns wallet addresses and chains
        response[chainGroupName] =
          await this.transactionService.initChainGroupWallets(id, {
            chainGroupName,
            chainGroupWallets: groupedWalletsByChainGroups[chainGroupName],
          });
      }
    } catch (e) {
      console.log(e);
    }

    return response;
  }

  @Post('/events-set')
  @UseGuards(
    new CheckUserStatusTransactionsGuard({
      errorsIf: [
        UserStatusTransactionsEnum.IS_INITING,
        UserStatusTransactionsEnum.NOT_INITED_YET,
      ],
    }),
  )
  @ApiOperation({ summary: 'Get User transactions Events Set page' })
  @ApiGetResponse(
    'Successfully got transactions events set page',
    TransactionEventsSetPageDTO,
  )
  async getPageEventsSetByAll(
    @Req() req,
    @Body() body: GetTransactionEventsSetPageQueryDTO,
  ): Promise<TransactionEventsSetPageDTO> {
    const { id } = req.userData;

    const walletsIds = await this.walletService.findIdsByUser(id);

    return this.transactionEventsService.findPageEventsByWallets(
      walletsIds,
      body,
    );
  }

  @Post('/assets-set/:operation')
  @UseGuards(
    new CheckUserStatusTransactionsGuard({
      errorsIf: [
        UserStatusTransactionsEnum.IS_INITING,
        UserStatusTransactionsEnum.NOT_INITED_YET,
      ],
    }),
  )
  @ApiOperation({ summary: 'Get User transactions Assets Set page' })
  @ApiGetResponse(
    'Successfully got transactions Assets set page',
    TransactionAssetsSetPageDTO,
  )
  async getPageAssetsSetByAll(
    @Req() req,
    @Param('operation') operation: AssetOperationEnum,
    @Body() body: GetTransactionAssetsSetPageQueryDTO,
  ): Promise<TransactionAssetsSetPageDTO> {
    const { id } = req.userData;

    const walletsIds = await this.walletService.findIdsByUserOrFail(id);
    return this.transactionAssetSetService.findPageAssetsByOperationAndWallets(
      walletsIds,
      operation,
      body,
    );
  }

  @Post('/')
  @UseGuards(
    new CheckUserStatusTransactionsGuard({
      errorsIf: [UserStatusTransactionsEnum.IS_INITING],
    }),
  )
  @ApiOperation({ summary: 'Get User transactions page' })
  @ApiGetResponse('Successfully got transactions page', TransactionPageDTO)
  async getPageByUser(
    @Req() req,
    @Body() queryConfig: GetTransactionPageQueryDTO,
  ): Promise<TransactionPageDTO> {
    const { id } = req.userData;

    const walletsIds = await this.walletService.findIdsByUserOrFail(id);
    return this.transactionService.findPageByParams({
      ...queryConfig,
      walletsIds,
    });
  }
}
