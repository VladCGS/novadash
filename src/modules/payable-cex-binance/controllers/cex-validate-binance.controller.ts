import { BINANCE_REQUIRED_PERMISSIONS } from '@app/common/constants/permissions-binance.const';
import { Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { PureBinanceService } from '@app/common/modules/pure-cex-binance/services/pure-binance.service';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BinanceCredentialsDTO } from '../dto/validate-binance.request.dto';
import { BINANCE_HEADER_KEYS } from '@app/common/constants/cex-header-keys-names.const';
import { CEXApiCheckResponseDTO } from '../../common/dto/cex-validation/cex-validation.responses.dto';

@Controller('binance/validate')
@ApiTags('PAYABLE Binance')
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
export class CexValidateBinanceController {
  constructor(private readonly pureBinanceService: PureBinanceService) {}

  @Post('/api-key-check')
  async apiKeyCheck(
    @Req() req,
    @Body() body: BinanceCredentialsDTO,
  ): Promise<CEXApiCheckResponseDTO> {
    const missingPermissions =
      await this.pureBinanceService.getMissingPermissions(
        {
          [BINANCE_HEADER_KEYS.KEY]: body.apiKey,
          [BINANCE_HEADER_KEYS.SECRET]: body.apiSecret,
        },
        BINANCE_REQUIRED_PERMISSIONS,
      );

    return {
      isValid: !missingPermissions.length,
      missingPermissions,
    };
  }
}
