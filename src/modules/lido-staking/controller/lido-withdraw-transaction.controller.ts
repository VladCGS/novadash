import { ApiOKResponse, Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import {
  JWTAuthGuard,
  RolesGuard,
  CheckIdValidGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LidoStakingTransactionDataDTO } from '../dto/lido-staking-transaction-response.dto';
import { LidoWithdrawTransactionService } from '../service/lido-withdraw-transaction.service';
import { FormLidoWithdrawTransactionDataDTO } from '../dto/lido-withdraw-transaction-request.dto';
import { CheckAllowedSymbolGurd } from '@app/common/guards/check-allowed-symbol.guard';
import { CheckUserWalletAddressGuard } from '@app/common/guards/check-user-wallet-address.guard';
import { NativeCoinsSymbols } from '@app/common/constants/native-coins.const';

@Controller('staking/lido')
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
  new CheckAllowedSymbolGurd({
    symbols: [NativeCoinsSymbols.ETH, NativeCoinsSymbols.MATIC],
  }),
  new CheckUserWalletAddressGuard(),
)
@ApiTags('lido-staking ( Withdraw )')
@Roles(AppRoles.USER)
export class LidoWithdrawTransactionController {
  constructor(
    private lidoWithdrawTransactionService: LidoWithdrawTransactionService,
  ) {}

  @Post('withdraw-transaction-data')
  @ApiOKResponse(
    'Successfully fetched withdraw transaction data',
    LidoStakingTransactionDataDTO,
  )
  async getTransactionData(
    @Body() body: FormLidoWithdrawTransactionDataDTO,
  ): Promise<LidoStakingTransactionDataDTO> {
    return this.lidoWithdrawTransactionService.getWithdrawTransactionData(
      body,
    );
  }
}
