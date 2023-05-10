import { ApiOKResponse, Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import { Chain } from '@app/common/entities/transactions';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckPoolWithChainExists } from '@app/common/guards/check-pool-with-chain-exists.guard';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { CheckRedisKeyExistsGuard } from '@app/common/guards/check-redis-key-exists.guard';
import { FormRedisKeyGuard } from '@app/common/guards/form-redis-key.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  FormUniswapV3AddLiquidityModalInitializationDataDTO,
  FormUniswapV3AddLiquidityTransactionDTO,
} from '../dtos/uniswap-v3-pools-liquidity-providing-request.dto';
import {
  UniswapV3AddLiquidityModalInitializationDataDTO,
  UniswapV3AddLiquidityTransactionDTO,
} from '../dtos/uniswap-v3-pools-liquidity-providing-response.dto';
import { UniswapV3FormAddLiquidityTransactionService } from '../services/uniswap-v3-form-add-liquidity-transaction.service';
import { UniswapV3LiquidityProvidingService } from '../services/uniswap-v3-liquidity-providing.service';

@Controller('pools/uniswap-v3/liquidity-providing')
@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
  new CheckIdValidGuard({
    field: ['chainIdDB'],
    findIn: 'body',
  }),
  new CheckRecordFieldExistGuard([
    {
      Entity: Chain,
      dataSource: 'body',
      entityField: 'id',
      sourceField: 'chainIdDB',
    },
  ]),
  new CheckIdValidGuard({ field: ['id'], findIn: 'userData' }),
  new CheckRecordFieldExistGuard([
    {
      Entity: User,
      dataSource: 'userData',
      entityField: 'id',
      sourceField: 'id',
    },
  ]),
  new CheckPoolWithChainExists({
    poolAddressField: ['poolAddress'],
    chainDBIdField: ['chainIdDB'],
    dataSource: 'body',
  }),
)
@ApiTags('uniswap-v3-pools ( Deposit )')
@Roles(AppRoles.USER)
export class UniswapV3PoolsLiquidityProvidingController {
  constructor(
    private uniswapV3LiquidityProvidingService: UniswapV3LiquidityProvidingService,
    private uniswapV3FormAddLiquidityTransactionService: UniswapV3FormAddLiquidityTransactionService,
  ) {}

  @ApiOKResponse(
    'Successfully fetched pool initialization data',
    UniswapV3AddLiquidityModalInitializationDataDTO,
  )
  @Post('modal-initialization-data')
  async getModalInitializationData(
    @Body() body: FormUniswapV3AddLiquidityModalInitializationDataDTO,
    @Req() req,
  ): Promise<UniswapV3AddLiquidityModalInitializationDataDTO> {
    const { id: userId } = req.userData;

    return this.uniswapV3LiquidityProvidingService.getAddLiquidityModalInitializationData(
      {
        chainIdDB: body.chainIdDB,
        poolAddress: body.poolAddress,
      },
      userId,
    );
  }

  @UseGuards(
    new FormRedisKeyGuard([
      { name: 'id', dataSource: 'userData' },
      { name: 'poolAddress', dataSource: 'body' },
      { name: 'chainIdDB', dataSource: 'body' },
    ]),
    CheckRedisKeyExistsGuard,
  )
  @ApiOKResponse(
    'Successfully fetched pool transaction data',
    UniswapV3AddLiquidityTransactionDTO,
  )
  @Post('add-liquidity-transaction-data')
  async getDepositPaymentData(
    @Body() body: FormUniswapV3AddLiquidityTransactionDTO,
    @Req() req,
  ): Promise<UniswapV3AddLiquidityTransactionDTO> {
    const { id: userId } = req.userData;

    const bodyTransaction =
      await this.uniswapV3FormAddLiquidityTransactionService.formTransactionBody(
        body,
        userId,
      );
    const approveTokensInfo =
      await this.uniswapV3FormAddLiquidityTransactionService.formApproveTokensInfo(
        body,
        userId,
      );

    return {
      senderWallet: { address: body.walletAddress, chainId: body.chainIdDB },
      bodyTransaction,
      approveTokensInfo,
    };
  }
}
