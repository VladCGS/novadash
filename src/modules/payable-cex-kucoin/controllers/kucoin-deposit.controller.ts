import { Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PAYABLE_ROUTES } from '../../common/constants/exch-route.constants';
import { ApiKucoinHeaders } from '@app/common/decorators/cex.decorator';
import { PayableCEXHttpSlugs } from '@app/common/constants/payable-slugs.const';
import { FinalStatusDTO } from '../../common/dto/payable/payable-common.responses.dto';
import {
  CEXFetchDepositAddressDTO,
  CEXFetchDepositStatusDTO,
} from '../../common/dto/payable/payable-cex-deposit.requests.dto';
import { KUCOIN_HEADER_KEYS } from '@app/common/constants/cex-header-keys-names.const';
import { KucoinDepositService } from '../services/kucoin-deposit.service';
import { CheckCEXApiKeyAuthGuard } from '@app/common/guards/check-cex-api-key-auth-guard.service';
import { KucoinKeysExtractorService } from '../services/kucoin-keys-extractor.service';
import { CEXDepositAddressDTO } from '../../common/dto/payable/payable-cex-deposit.responses.dto';
import { CheckKucoinRequestedChainGuard } from '../guards/check-kucoin-requested-chain.guard';

@Controller(PayableCEXHttpSlugs.KUCOIN)
@ApiTags('PAYABLE Kucoin')
@ApiKucoinHeaders()
@ApiBearerAuth('JWT')
@UseGuards(
  JWTAuthGuard,
  RolesGuard,
  new CheckCEXApiKeyAuthGuard(Object.values(KUCOIN_HEADER_KEYS)),
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
export class KucoinDepositController {
  constructor(
    private readonly kucoinDepositService: KucoinDepositService,
    private readonly kucoinKeysExtractorService: KucoinKeysExtractorService,
  ) {}

  // @param depositId - for Kucoin is deposit Symbol
  @Post(PAYABLE_ROUTES.depositCEX.status)
  async getDepositStatus(
    @Req() req,
    @Body() body: CEXFetchDepositStatusDTO,
  ): Promise<FinalStatusDTO> {
    const keys = this.kucoinKeysExtractorService.extractKeysFromRequest(req);

    return this.kucoinDepositService.getDepositStatus(keys, body);
  }

  @Post(PAYABLE_ROUTES.depositCEX.depositAddress)
  @UseGuards(
    new CheckKucoinRequestedChainGuard({
      field: ['chainIdDB'],
      findIn: 'body',
    }),
  )
  async getDepositAddress(
    @Req() req,
    @Body() body: CEXFetchDepositAddressDTO,
  ): Promise<CEXDepositAddressDTO> {
    const keys = this.kucoinKeysExtractorService.extractKeysFromRequest(req);

    return this.kucoinDepositService.getDepositSetup(
      keys,
      body.symbol,
      body.chainIdDB,
    );
  }
}
