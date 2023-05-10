import { ApiOKResponse, Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import { SupportedReserveLendBorrow } from '@app/common/entities/borrowing/reserve.entity';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FormAaveV3WithdrawTransactionDataDTO } from '../dto/aave-v3-withdraw-transaction-request.dto';
import { AaveV3WithdrawTransactionDataDTO } from '../dto/aave-v3-withdraw-transaction-response.dto';
import { AaveV3WithdrawTransactionService } from '../service/aave-v3-withdraw-transaction.service';

@Controller('reserves/aave-v3')
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
@ApiTags('aave-v3-reserves ( Withdraw )')
@Roles(AppRoles.USER)
export class AaveV3WithdrawTransactionController {
  constructor(
    private aaveV3WithdrawTransactionService: AaveV3WithdrawTransactionService,
  ) {}

  @Post('withdraw-transaction-data')
  @ApiOKResponse(
    'Successfully fetched aave v3 withdraw transaction data',
    AaveV3WithdrawTransactionDataDTO,
  )
  getTransactionData(@Body() body: FormAaveV3WithdrawTransactionDataDTO) {
    return this.aaveV3WithdrawTransactionService.getTransactionData(body);
  }
}
