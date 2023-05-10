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
import { FormAaveV3BorrowingTransactionDTO } from '../dto/aave-v3-borrowing-transaction-request.dto';
import { AaveV3BorrowingTransactionDataDTO } from '../dto/aave-v3-borrowing-transaction-response.dto';
import { AaveV3BorrowingTransactionService } from '../service/aave-v3-borrowing-transaction.service';

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
@ApiTags('aave-v3-reserves ( Borrowing )')
@Roles(AppRoles.USER)
export class AaveV3BorrowingTransactionController {
  constructor(
    private aaveV3BorrowingTransactionService: AaveV3BorrowingTransactionService,
  ) {}

  @Post('borrowing-transaction-data')
  @ApiOKResponse(
    'Successfully fetched borrowing transaction data',
    AaveV3BorrowingTransactionDataDTO,
  )
  async getBorrowingTransaction(
    @Body() body: FormAaveV3BorrowingTransactionDTO,
  ): Promise<AaveV3BorrowingTransactionDataDTO> {
    return this.aaveV3BorrowingTransactionService.getTransactionData(body);
  }
}
