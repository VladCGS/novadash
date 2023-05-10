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
import { FormAaveV3LendingTransactionDataDTO } from '../dto/aave-v3-lending-transaction-request.dto';
import { AaveV3LendingTransactionDataDTO } from '../dto/aave-v3-lending-transaction-response.dto';
import { AaveV3LendingTransactionService } from '../service/aave-v3-lending-transaction.service';

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
@ApiTags('aave-v3-reserves ( Lending )')
@Roles(AppRoles.USER)
export class AaveV3LendingTransactionController {
  constructor(
    private aaveV3LendingTransactionService: AaveV3LendingTransactionService,
  ) {}

  @Post('lending-transaction-data')
  @ApiOKResponse(
    'Successfully fetched lending transaction data',
    AaveV3LendingTransactionDataDTO,
  )
  async getTransactionData(
    @Body() body: FormAaveV3LendingTransactionDataDTO,
  ): Promise<AaveV3LendingTransactionDataDTO> {
    return this.aaveV3LendingTransactionService.getTransactionData(body);
  }
}
