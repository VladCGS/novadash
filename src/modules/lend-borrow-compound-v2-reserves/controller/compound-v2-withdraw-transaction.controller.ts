import { ApiOKResponse, Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import { SupportedReserveLendBorrow } from '@app/common/entities/borrowing/reserve.entity';
import {
  JWTAuthGuard,
  RolesGuard,
  CheckIdValidGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FromCompoundV2WithdrawTransactionData } from '../dto/compound-v2-withdraw-transaction-request.dto';
import { CompoundV2WithdrawTransactionData } from '../dto/compound-v2-withdraw-transaction-response.dto';
import { CompoundV2WithdrawTransactionService } from '../service/compound-v2-withdraw-transaction.service';

@Controller('reserves/compound-v2')
@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
  new CheckRecordFieldExistGuard([
    {
      Entity: SupportedReserveLendBorrow,
      dataSource: 'body',
      entityField: 'reserveAddress',
      sourceField: 'reserveAddress',
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
@ApiTags('compound-v2-reserves ( Withdraw )')
@Roles(AppRoles.USER)
export class CompoundV2WithdrawTransactionController {
  constructor(
    private compoundV2WithdrawTransactionService: CompoundV2WithdrawTransactionService,
  ) {}

  @Post('withdraw-transaction-data')
  @ApiOKResponse(
    'Successfully fetched compound v2 withdraw transaction data',
    CompoundV2WithdrawTransactionData,
  )
  getTransactionData(
    @Body() body: FromCompoundV2WithdrawTransactionData,
  ): Promise<CompoundV2WithdrawTransactionData> {
    return this.compoundV2WithdrawTransactionService.getTransactionData(body);
  }
}
