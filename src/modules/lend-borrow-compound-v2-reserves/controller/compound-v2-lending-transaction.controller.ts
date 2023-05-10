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
import { FormCompoundV2LendingTransactionDataDTO } from '../dto/compound-v2-lending-transaction-request.dto';
import { CompoundV2LendingTransactionDataDTO } from '../dto/compound-v2-lending-transaction-response.dto';
import { CompoundV2LendingTransactionService } from '../service/compound-v2-lending-transaction.service';

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
@ApiTags('compound-v2-reserves ( Lending )')
@Roles(AppRoles.USER)
export class CompoundV2LendingTransactionController {
  constructor(
    private compoundV2LendingTransactionService: CompoundV2LendingTransactionService,
  ) {}

  @Post('lending-transaction-data')
  @ApiOKResponse(
    'Successfully fetched lending transaction data',
    CompoundV2LendingTransactionDataDTO,
  )
  async getTransactionData(
    @Body() body: FormCompoundV2LendingTransactionDataDTO,
  ): Promise<CompoundV2LendingTransactionDataDTO> {
    return await this.compoundV2LendingTransactionService.getTransactionData(
      body,
    );
  }
}
