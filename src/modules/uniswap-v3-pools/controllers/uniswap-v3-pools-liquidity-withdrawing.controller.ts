import { ApiOKResponse, Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import { Chain } from '@app/common/entities/transactions';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  FormUniswapV3ClaimFeeTransactionDTO,
  FormUniswapV3RemoveLiquidityTransactionDTO,
  FormUniswapV3WithdrawingModalInitializationDataDTO,
} from '../dtos/uniswap-v3-pools-liquidity-withdrawing-request.dto';
import {
  UniswapV3WithdrawingModalInitializationDataDTO,
  UniswapV3WithdrawTransactionDTO,
} from '../dtos/uniswap-v3-pools-liquidity-withdrawing-response.dto';
import { UniswapV3FormClaimFeeTransactionService } from '../services/uniswap-v3-form-claim-fee-transaction.service';
import { UniswapV3FormRemoveLiquidityTransactionService } from '../services/uniswap-v3-form-remove-liquidity-transaction.service';
import { UniswapV3LiquidityWithdrawingService } from '../services/uniswap-v3-liquidity-withdrawing.service';

@Controller('pools/uniswap-v3/liquidity-withdrawal')
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
)
@ApiTags('uniswap-v3-pools ( Withdraw )')
@Roles(AppRoles.USER)
export class UniswapV3PoolsLiquidityWithdrawingController {
  constructor(
    private uniswapV3LiquidityWithdrawingService: UniswapV3LiquidityWithdrawingService,
    private uniswapV3FormClaimFeeTransactionService: UniswapV3FormClaimFeeTransactionService,
    private uniswapV3FormRemoveLiquidityTransactionService: UniswapV3FormRemoveLiquidityTransactionService,
  ) {}

  @ApiOKResponse(
    'Successfully fetched position initialization data',
    UniswapV3WithdrawingModalInitializationDataDTO,
  )
  @Post('modal-initialization-data')
  async getModalInitializationData(
    @Body() body: FormUniswapV3WithdrawingModalInitializationDataDTO,
    @Req() req,
  ): Promise<UniswapV3WithdrawingModalInitializationDataDTO> {
    return this.uniswapV3LiquidityWithdrawingService.getModalPaymentData(
      body,
      req.userData.id,
    );
  }

  @Post('claim-fee-transaction-data')
  @ApiOKResponse(
    'Successfully fetched position claim fee transaction data',
    UniswapV3WithdrawTransactionDTO,
  )
  async getClaimFeeTransactionData(
    @Body() body: FormUniswapV3ClaimFeeTransactionDTO,
  ): Promise<UniswapV3WithdrawTransactionDTO> {
    return this.uniswapV3FormClaimFeeTransactionService.getClaimFeeTransactionData(
      body,
    );
  }

  @Post('remove-liquidity-transaction-data')
  @ApiOKResponse(
    'Successfully fetched remove liquidity transaction data',
    UniswapV3WithdrawTransactionDTO,
  )
  async getRemoveLiquidityTransactionData(
    @Body() body: FormUniswapV3RemoveLiquidityTransactionDTO,
  ): Promise<UniswapV3WithdrawTransactionDTO> {
    return this.uniswapV3FormRemoveLiquidityTransactionService.formRemoveLiquidityTransaction(
      body,
    );
  }
}
