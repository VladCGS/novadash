import { Roles } from '@app/common/decorators';
import { User } from '@app/common/entities/alphaping';
import {
  CheckIdValidGuard,
  JWTAuthGuard,
  RolesGuard,
} from '@app/common/guards';
import { CheckRecordFieldExistGuard } from '@app/common/guards/check-record-field-exist.guard';
import { AppRoles } from '@app/common/types';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { KucoinCredentialsDTO } from '../dto/validate-kucoin.request.dto';
import { CEXApiCheckResponseDTO } from '../../common/dto/cex-validation/cex-validation.responses.dto';

@Controller('kucoin/validate')
@ApiTags('PAYABLE Kucoin')
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
  @Post('/api-key-check')
  async apiKeyCheck(
    @Body() body: KucoinCredentialsDTO,
  ): Promise<CEXApiCheckResponseDTO> {
    console.log(body);
    return {
      isValid: true,
      missingPermissions: [],
    };
  }
}
