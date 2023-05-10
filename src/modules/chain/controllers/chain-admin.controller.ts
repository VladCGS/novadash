import { Roles } from '@app/common/decorators';
import { Admin } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChainService } from '../services/chain.service';
import { LoadChainService } from '../services/load-chain.service';

@Controller('chain')
@ApiTags('chain')
@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
  new CheckIdValidGuard({ field: ['id'], findIn: 'userData' }),
)
@Roles(AppRoles.ADMIN)
export class ChainAdminController {
  constructor(
    private loadChainService: LoadChainService,
    private chainService: ChainService,
  ) {}

  @UseGuards(
    new CheckRecordFieldExistGuard([
      {
        Entity: Admin,
        dataSource: 'userData',
        entityField: 'id',
        sourceField: 'id',
      },
    ]),
  )
  @Roles(AppRoles.ADMIN)
  @Get('/load-db-chains')
  async loadChains() {
    const startInitDate = new Date();

    await this.loadChainService.loadChainIdNetworkChains();
    await this.loadChainService.loadSolanaChain();
    await this.loadChainService.loadBitcoinChain();

    await this.loadChainService.cleanupChainsToDate(startInitDate);
  }
}
