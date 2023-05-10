import { ApiOKResponse, Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import { SupportedStakingToken } from '@app/common/entities/staking/supported-staking-token.entity';
import {
  JWTAuthGuard,
  RolesGuard,
  CheckIdValidGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FormLidoStakingTransactionDataDTO } from '../dto/lido-staking-transaction-request.dto';
import { LidoStakingTransactionDataDTO } from '../dto/lido-staking-transaction-response.dto';
import { LidoStakingTransactionService } from '../service/lido-staking-transaction.service';

@Controller('staking/lido')
@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
  new CheckRecordFieldExistGuard([
    {
      Entity: SupportedStakingToken,
      dataSource: 'body',
      entityField: 'stakingAddress',
      sourceField: 'stakingAddress',
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
@ApiTags('lido-staking ( Staking )')
@Roles(AppRoles.USER)
export class LidoStakingTransactionController {
  constructor(
    private lidoStakingTransactionService: LidoStakingTransactionService,
  ) {}

  @Post('staking-transaction-data')
  @ApiOKResponse(
    'Successfully fetched staking transaction data',
    LidoStakingTransactionDataDTO,
  )
  async getTransactionData(
    @Body() body: FormLidoStakingTransactionDataDTO,
  ): Promise<LidoStakingTransactionDataDTO> {
    return await this.lidoStakingTransactionService.getTransactionData(body);
  }
}
