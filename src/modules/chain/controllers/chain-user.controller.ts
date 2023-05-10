import { SUPPORTED_EVM_SLUGS } from '@app/common/constants/supported-evm-chains.const';
import { Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import { Chain } from '@app/common/entities/transactions';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FetchChainMetaByDBIDsDTO } from '../dto/chain-user.requests.dto';
import { ChainMetaDTO } from '../dto/chain-user.responses.dto';
import { ChainMetaService } from '../services/chain-meta.service';
import { ChainService } from '../services/chain.service';
import { LoadChainService } from '../services/load-chain.service';

@Controller('chains')
@ApiTags('chains')
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
)
@Roles(AppRoles.USER)
export class ChainUserController {
  constructor(
    private readonly loadChainService: LoadChainService,
    private readonly chainService: ChainService,
    private readonly chainMetaService: ChainMetaService,
  ) {}

  @Get('/supported-by-platform')
  async getAllSupported() {
    const supportedSlugs = Object.values(SUPPORTED_EVM_SLUGS);

    const foundChains = await this.chainService.findAllBySlugs(supportedSlugs);

    if (!foundChains) {
      throw new HttpException(
        'No supported chains found',
        HttpStatus.NOT_FOUND,
      );
    }

    return foundChains;
  }

  @Post('meta-by-ids')
  @UseGuards(
    new CheckRecordFieldExistGuard([
      {
        isFieldArray: true,
        dataSource: 'body',
        sourceField: 'chainIds',
        Entity: Chain,
        entityField: 'id',
      },
    ]),
  )
  async getChainsMetaByIds(
    @Body() body: FetchChainMetaByDBIDsDTO,
  ): Promise<ChainMetaDTO[]> {
    return this.chainMetaService.getChainsMetaByIds(body.chainIds);
  }
}
